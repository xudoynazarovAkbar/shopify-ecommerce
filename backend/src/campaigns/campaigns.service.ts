import {
  Injectable,
  OnModuleInit,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdatePricingSettingsDto } from './dto/update-pricing-settings.dto';
import { EditCampaignDto } from './dto/edit-campaign.dto';
import { AdCampaignStatus, AdPricingSettings, Prisma } from '@prisma/client';

@Injectable()
export class CampaignsService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    // Ensure the GLOBAL settings exist on startup with flat prices
    await this.prisma.adPricingSettings.upsert({
      where: { id: 'GLOBAL' },
      update: {},
      create: {
        id: 'GLOBAL',
        priceTier1: 100.0,
        priceTier2: 80.0,
        priceTier3: 60.0,
        priceTier4: 40.0,
      },
    });
  }

  // Retrieve flat weekly cost for a selected Tier (1 to 4)
  getTierWeeklyCost(settings: AdPricingSettings | null, tier: number): number {
    if (!settings) return 0;
    if (tier === 1) return settings.priceTier1;
    if (tier === 2) return settings.priceTier2;
    if (tier === 3) return settings.priceTier3;
    if (tier === 4) return settings.priceTier4;
    return settings.priceTier1;
  }

  async getPricingSettings() {
    const settings = await this.prisma.adPricingSettings.findUnique({
      where: { id: 'GLOBAL' },
    });

    if (!settings) {
      throw new NotFoundException('Global pricing settings not found');
    }

    // Return the settings directly along with flat prices per Tier
    const calculatedCosts: Record<number, number> = {
      1: settings.priceTier1,
      2: settings.priceTier2,
      3: settings.priceTier3,
      4: settings.priceTier4,
    };

    return {
      settings,
      calculatedCosts,
    };
  }

  async updatePricingSettings(dto: UpdatePricingSettingsDto) {
    return this.prisma.adPricingSettings.update({
      where: { id: 'GLOBAL' },
      data: dto,
    });
  }

  async getActiveCampaigns() {
    const now = new Date();
    return this.prisma.adCampaign.findMany({
      where: {
        status: AdCampaignStatus.APPROVED,
        isPaid: true,
        isActive: true,
        isVendorPaused: false,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      include: {
        vendor: {
          select: {
            id: true,
            shopName: true,
          },
        },
      },
      orderBy: {
        slidePosition: 'asc',
      },
    });
  }

  async getVendorCampaigns(userId: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor profile not found');
    }

    return this.prisma.adCampaign.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllCampaigns() {
    return this.prisma.adCampaign.findMany({
      include: {
        vendor: {
          select: {
            id: true,
            shopName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Get slide position slots linked to a given Tier
  getSlotsForTier(tier: number): number[] {
    if (tier === 1) return [1, 2, 3];
    if (tier === 2) return [4, 5, 6];
    if (tier === 3) return [7, 8, 9];
    if (tier === 4) return [10, 11, 12];
    return [1, 2, 3];
  }

  async createCampaign(
    userId: string,
    dto: CreateCampaignDto,
    imagePath: string,
  ) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor profile not found');
    }

    if (vendor.status !== 'APPROVED') {
      throw new ForbiddenException(
        'Only approved vendors can create ad campaigns',
      );
    }

    // Compute start and end dates
    const startDate = new Date(dto.startDate);
    const endDate = new Date(startDate.getTime());
    endDate.setDate(startDate.getDate() + dto.durationWeeks * 7);

    // Ensure startDate is valid
    if (isNaN(startDate.getTime())) {
      throw new BadRequestException('Invalid start date');
    }

    // Get candidate slots for the chosen Tier
    const candidateSlots = this.getSlotsForTier(dto.tier);
    let allocatedSlidePosition: number | null = null;

    // Loop through the 3 candidate slide positions inside the Tier
    for (const slot of candidateSlots) {
      // Check if there is an overlapping approved/pending campaign for this slot position
      const overlap = await this.prisma.adCampaign.findFirst({
        where: {
          slidePosition: slot,
          status: {
            in: [AdCampaignStatus.APPROVED, AdCampaignStatus.PENDING_APPROVAL],
          },
          isActive: true,
          // (StartA < EndB) and (EndA > StartB)
          startDate: { lt: endDate },
          endDate: { gt: startDate },
        },
      });

      if (!overlap) {
        allocatedSlidePosition = slot;
        break; // Successfully allocated!
      }
    }

    if (allocatedSlidePosition === null) {
      throw new BadRequestException(
        `All slide slots in Tier ${dto.tier} are fully booked for the selected timeframe. Please select another Tier or date range.`,
      );
    }

    // Enforce active cap limit (max 12 total active campaigns cross the entire system)
    const activeCampaignCount = await this.prisma.adCampaign.count({
      where: {
        status: AdCampaignStatus.APPROVED,
        isPaid: true,
        isActive: true,
        startDate: { lt: endDate },
        endDate: { gt: startDate },
      },
    });

    if (activeCampaignCount >= 12) {
      throw new BadRequestException(
        'Maximum active threshold of 12 campaigns in the system has been reached for this timeframe.',
      );
    }

    // Retrieve global flat pricing configuration
    const pricingSettings = await this.prisma.adPricingSettings.findUnique({
      where: { id: 'GLOBAL' },
    });

    const weeklyCost = this.getTierWeeklyCost(pricingSettings, dto.tier);
    const totalPaid = weeklyCost * dto.durationWeeks;

    // Trust Bypass Workflow
    const status = vendor.autoApproveProducts
      ? AdCampaignStatus.APPROVED
      : AdCampaignStatus.PENDING_APPROVAL;

    return this.prisma.adCampaign.create({
      data: {
        vendorId: vendor.id,
        image: imagePath,
        label: dto.label || null,
        labelColor: dto.labelColor || 'red',
        startDate,
        endDate,
        durationWeeks: dto.durationWeeks,
        tier: dto.tier,
        slidePosition: allocatedSlidePosition,
        totalPaid,
        status,
        isPaid: false,
      },
    });
  }

  async checkoutCampaign(userId: string, campaignId: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor profile not found');
    }

    const campaign = await this.prisma.adCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Ad campaign not found');
    }

    if (campaign.vendorId !== vendor.id) {
      throw new ForbiddenException('You do not own this ad campaign');
    }

    if (campaign.status !== AdCampaignStatus.APPROVED) {
      throw new BadRequestException(
        'Campaign is not approved yet. Please wait for admin approval.',
      );
    }

    if (campaign.isPaid) {
      throw new BadRequestException('Campaign is already paid');
    }

    // Simulated Checkout payment gateway charge
    // Simply set isPaid to true
    return this.prisma.adCampaign.update({
      where: { id: campaignId },
      data: {
        isPaid: true,
      },
    });
  }

  async updateCampaignStatus(campaignId: string, status: AdCampaignStatus) {
    const campaign = await this.prisma.adCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Ad campaign not found');
    }

    return this.prisma.adCampaign.update({
      where: { id: campaignId },
      data: { status },
    });
  }

  async toggleCampaignActive(campaignId: string, isActive: boolean) {
    const campaign = await this.prisma.adCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Ad campaign not found');
    }

    return this.prisma.adCampaign.update({
      where: { id: campaignId },
      data: { isActive },
    });
  }

  async vendorTogglePause(
    userId: string,
    campaignId: string,
    isVendorPaused: boolean,
  ) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor profile not found');
    }

    const campaign = await this.prisma.adCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Ad campaign not found');
    }

    if (campaign.vendorId !== vendor.id) {
      throw new ForbiddenException('You do not own this ad campaign');
    }

    return this.prisma.adCampaign.update({
      where: { id: campaignId },
      data: { isVendorPaused },
    });
  }

  async vendorEditCampaign(
    userId: string,
    campaignId: string,
    dto: EditCampaignDto,
    imagePath?: string,
  ) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor profile not found');
    }

    const campaign = await this.prisma.adCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new NotFoundException('Ad campaign not found');
    }

    if (campaign.vendorId !== vendor.id) {
      throw new ForbiddenException('You do not own this ad campaign');
    }

    const updateData: Prisma.AdCampaignUpdateInput = {};
    if (dto.label !== undefined) updateData.label = dto.label || null;
    if (dto.labelColor !== undefined)
      updateData.labelColor = dto.labelColor || null;
    if (imagePath) updateData.image = imagePath;

    // Trust Governance Rule:
    // If vendor is trusted (autoApproveProducts === true), edited campaign automatically goes live (APPROVED).
    // If vendor is untrusted, campaign should pause (reset status to PENDING_APPROVAL) and go live only after admin approval.
    if (vendor.autoApproveProducts) {
      updateData.status = AdCampaignStatus.APPROVED;
    } else {
      updateData.status = AdCampaignStatus.PENDING_APPROVAL;
    }

    return this.prisma.adCampaign.update({
      where: { id: campaignId },
      data: updateData,
    });
  }
}
