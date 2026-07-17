import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { RegisterVendorDto } from './dto/register-vendor.dto';
import { Role, VendorStatus } from '@prisma/client';

@Injectable()
export class VendorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async register(dto: RegisterVendorDto) {
    // Delegate to AuthService to handle transactional User and Vendor creation
    return this.authService.register({
      email: dto.email,
      password: dto.password,
      role: Role.VENDOR,
      shopName: dto.shopName,
      shopDescription: dto.shopDescription,
    });
  }

  async getProfile(userId: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    if (!vendor) {
      throw new NotFoundException('Vendor profile not found');
    }

    return vendor;
  }

  async listVendors(status?: VendorStatus) {
    return this.prisma.vendor.findMany({
      where: status ? { status } : {},
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateStatus(vendorId: string, status: VendorStatus) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
    }

    return this.prisma.vendor.update({
      where: { id: vendorId },
      data: { status },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });
  }

  async updateTrust(vendorId: string, autoApproveProducts: boolean) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      throw new NotFoundException(`Vendor with ID ${vendorId} not found`);
    }

    return this.prisma.vendor.update({
      where: { id: vendorId },
      data: { autoApproveProducts },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });
  }
}
