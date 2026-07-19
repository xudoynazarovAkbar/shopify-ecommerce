import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductStatus, VendorStatus } from '@prisma/client';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(query: string) {
    if (!query || !query.trim()) {
      return { products: [], vendors: [] };
    }

    const trimmedQuery = query.trim();

    const vendorsPromise = this.prisma.vendor.findMany({
      where: {
        status: VendorStatus.APPROVED,
        OR: [
          { shopName: { contains: trimmedQuery, mode: 'insensitive' } },
          { shopDescription: { contains: trimmedQuery, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        shopName: true,
        shopDescription: true,
        createdAt: true,
      },
    });

    const productsPromise = this.prisma.product.findMany({
      where: {
        status: ProductStatus.APPROVED,
        vendor: {
          status: VendorStatus.APPROVED,
        },
        OR: [
          { name: { contains: trimmedQuery, mode: 'insensitive' } },
          { description: { contains: trimmedQuery, mode: 'insensitive' } },
        ],
      },
      include: {
        category: true,
        vendor: {
          select: {
            id: true,
            shopName: true,
          },
        },
      },
    });

    const [vendors, products] = await Promise.all([
      vendorsPromise,
      productsPromise,
    ]);

    return { products, vendors };
  }
}
