import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductStatus, VendorStatus, Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async createProduct(userId: string, dto: CreateProductDto) {
    // 1. Get vendor profile of the current user
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      throw new ForbiddenException('Vendor profile not found');
    }

    if (vendor.status !== VendorStatus.APPROVED) {
      throw new ForbiddenException(
        'Your vendor application is not approved yet',
      );
    }

    // 2. Validate category
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category) {
      throw new NotFoundException(
        `Category with ID "${dto.categoryId}" not found`,
      );
    }

    // 3. Determine status based on trust level (autoApproveProducts)
    const status = vendor.autoApproveProducts
      ? ProductStatus.APPROVED
      : ProductStatus.PENDING_APPROVAL;

    return this.prisma.product.create({
      data: {
        vendorId: vendor.id,
        categoryId: dto.categoryId,
        name: dto.name,
        description: dto.description,
        price: dto.price,
        image: dto.image,
        status,
      },
      include: {
        category: true,
        vendor: {
          select: {
            shopName: true,
            autoApproveProducts: true,
          },
        },
      },
    });
  }

  async updateProduct(
    userId: string,
    productId: string,
    dto: UpdateProductDto,
  ) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        vendor: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${productId}" not found`);
    }

    if (product.vendor.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to modify this product',
      );
    }

    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });
      if (!category) {
        throw new NotFoundException(
          `Category with ID "${dto.categoryId}" not found`,
        );
      }
    }

    // Determine status: if vendor does not have auto-approve, reset status to PENDING_APPROVAL on update
    const status = product.vendor.autoApproveProducts
      ? ProductStatus.APPROVED
      : ProductStatus.PENDING_APPROVAL;

    return this.prisma.product.update({
      where: { id: productId },
      data: {
        ...dto,
        status,
      },
      include: {
        category: true,
      },
    });
  }

  async removeProduct(userId: string, productId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        vendor: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${productId}" not found`);
    }

    if (product.vendor.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this product',
      );
    }

    return this.prisma.product.delete({
      where: { id: productId },
    });
  }

  async findAllApproved(
    categoryId?: string,
    search?: string,
    vendorId?: string,
  ) {
    const where: Prisma.ProductWhereInput = {
      status: ProductStatus.APPROVED,
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (vendorId) {
      where.vendorId = vendorId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.product.findMany({
      where,
      include: {
        category: true,
        vendor: {
          select: {
            shopName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOneApproved(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        vendor: {
          select: {
            shopName: true,
          },
        },
      },
    });

    if (!product || product.status !== ProductStatus.APPROVED) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return product;
  }

  async findVendorProducts(userId: string) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      throw new ForbiddenException('Vendor profile not found');
    }

    return this.prisma.product.findMany({
      where: { vendorId: vendor.id },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async listPendingProducts() {
    return this.prisma.product.findMany({
      where: { status: ProductStatus.PENDING_APPROVAL },
      include: {
        category: true,
        vendor: {
          select: {
            id: true,
            shopName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  async updateProductStatus(productId: string, status: ProductStatus) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${productId}" not found`);
    }

    return this.prisma.product.update({
      where: { id: productId },
      data: { status },
      include: {
        category: true,
        vendor: {
          select: {
            shopName: true,
          },
        },
      },
    });
  }
}
