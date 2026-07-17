import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getVendorByUserId(userId: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId },
    });
    if (!vendor) {
      throw new ForbiddenException('Vendor profile not found');
    }
    return vendor;
  }

  async createCoupon(userId: string, dto: CreateCouponDto) {
    const vendor = await this.getVendorByUserId(userId);

    // Check if a coupon with the same code already exists for this vendor
    const existing = await this.prisma.coupon.findUnique({
      where: {
        vendorId_code: {
          vendorId: vendor.id,
          code: dto.code.toUpperCase(), // Normalize coupon codes to uppercase
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Coupon code "${dto.code}" already exists for your store`,
      );
    }

    return this.prisma.coupon.create({
      data: {
        vendorId: vendor.id,
        code: dto.code.toUpperCase(),
        discountType: dto.discountType,
        discountValue: dto.discountValue,
        expirationDate: dto.expirationDate
          ? new Date(dto.expirationDate)
          : null,
      },
    });
  }

  async getVendorCoupons(userId: string) {
    const vendor = await this.getVendorByUserId(userId);
    return this.prisma.coupon.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateCoupon(userId: string, couponId: string, dto: UpdateCouponDto) {
    const vendor = await this.getVendorByUserId(userId);

    const coupon = await this.prisma.coupon.findUnique({
      where: { id: couponId },
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon with ID "${couponId}" not found`);
    }

    if (coupon.vendorId !== vendor.id) {
      throw new ForbiddenException(
        'You do not have permission to modify this coupon',
      );
    }

    return this.prisma.coupon.update({
      where: { id: couponId },
      data: {
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.expirationDate !== undefined && {
          expirationDate: dto.expirationDate
            ? new Date(dto.expirationDate)
            : null,
        }),
      },
    });
  }

  async deleteCoupon(userId: string, couponId: string) {
    const vendor = await this.getVendorByUserId(userId);

    const coupon = await this.prisma.coupon.findUnique({
      where: { id: couponId },
    });

    if (!coupon) {
      throw new NotFoundException(`Coupon with ID "${couponId}" not found`);
    }

    if (coupon.vendorId !== vendor.id) {
      throw new ForbiddenException(
        'You do not have permission to delete this coupon',
      );
    }

    await this.prisma.coupon.delete({
      where: { id: couponId },
    });

    return { success: true };
  }

  async validateCoupon(vendorId: string, code: string) {
    const coupon = await this.prisma.coupon.findUnique({
      where: {
        vendorId_code: {
          vendorId,
          code: code.toUpperCase(),
        },
      },
    });

    if (!coupon) {
      throw new BadRequestException(
        `Promo code "${code}" is invalid for this shop.`,
      );
    }

    if (!coupon.isActive) {
      throw new BadRequestException(`Promo code "${code}" is inactive.`);
    }

    if (coupon.expirationDate && new Date(coupon.expirationDate) < new Date()) {
      throw new BadRequestException(`Promo code "${code}" has expired.`);
    }

    return coupon;
  }
}
