import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings() {
    const settings = await this.prisma.platformSettings.findUnique({
      where: { id: 'GLOBAL' },
    });
    if (!settings) {
      // Lazy initialize if not found
      return this.prisma.platformSettings.create({
        data: {
          id: 'GLOBAL',
          commissionRate: 0.1,
        },
      });
    }
    return settings;
  }

  async updateSettings(commissionRate: number) {
    return this.prisma.platformSettings.upsert({
      where: { id: 'GLOBAL' },
      update: { commissionRate },
      create: {
        id: 'GLOBAL',
        commissionRate,
      },
    });
  }

  async getRevenueStats(startDateStr: string, endDateStr: string) {
    const start = new Date(startDateStr);
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(endDateStr);
    end.setUTCHours(23, 59, 59, 999);

    // Get active global platform settings
    const settings = await this.getSettings();
    const commissionRate = settings.commissionRate;

    // Fetch COMPLETED orders in range, selecting the snapshot commissionAmount
    const orders = await this.prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        total: true,
        commissionAmount: true,
        createdAt: true,
      },
    });

    // Fetch paid Ad campaigns in range
    const campaigns = await this.prisma.adCampaign.findMany({
      where: {
        isPaid: true,
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        totalPaid: true,
        createdAt: true,
      },
    });

    // Generate continuous date buckets
    const buckets: {
      [key: string]: {
        date: string;
        campaignsRevenue: number;
        commissionRevenue: number;
        totalIncome: number;
      };
    } = {};

    const current = new Date(start);
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      buckets[dateStr] = {
        date: dateStr,
        campaignsRevenue: 0,
        commissionRevenue: 0,
        totalIncome: 0,
      };
      current.setUTCDate(current.getUTCDate() + 1);
    }

    // Populate commission revenue using snapshot value with fallback
    for (const order of orders) {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      if (buckets[dateStr]) {
        const amount =
          order.commissionAmount > 0
            ? order.commissionAmount
            : order.total * commissionRate;
        buckets[dateStr].commissionRevenue += amount;
      }
    }

    // Populate campaigns revenue
    for (const campaign of campaigns) {
      const dateStr = campaign.createdAt.toISOString().split('T')[0];
      if (buckets[dateStr]) {
        buckets[dateStr].campaignsRevenue += campaign.totalPaid;
      }
    }

    // Map buckets to array and round values
    const chartData = Object.values(buckets).map((b) => {
      b.campaignsRevenue = Math.round(b.campaignsRevenue * 100) / 100;
      b.commissionRevenue = Math.round(b.commissionRevenue * 100) / 100;
      b.totalIncome =
        Math.round((b.campaignsRevenue + b.commissionRevenue) * 100) / 100;
      return b;
    });

    return {
      commissionRate,
      chartData,
    };
  }

  async getVendorIncomeStats(
    userId: string,
    startDateStr: string,
    endDateStr: string,
  ) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId },
    });
    if (!vendor) {
      throw new NotFoundException('Vendor profile not found.');
    }

    const start = new Date(startDateStr);
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(endDateStr);
    end.setUTCHours(23, 59, 59, 999);

    // Fetch Completed orders for this vendor
    const orders = await this.prisma.order.findMany({
      where: {
        vendorId: vendor.id,
        status: 'COMPLETED',
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        total: true,
        commissionAmount: true,
        createdAt: true,
      },
    });

    // Create daily buckets
    const buckets: { [key: string]: { date: string; netIncome: number } } = {};
    const current = new Date(start);
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      buckets[dateStr] = { date: dateStr, netIncome: 0 };
      current.setUTCDate(current.getUTCDate() + 1);
    }

    // Default rate if order has no commission stored
    const settings = await this.getSettings();
    const defaultRate = settings.commissionRate;

    for (const order of orders) {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      if (buckets[dateStr]) {
        const comm =
          order.commissionAmount > 0
            ? order.commissionAmount
            : order.total * defaultRate;
        const net = Math.max(0.0, order.total - comm);
        buckets[dateStr].netIncome += net;
      }
    }

    const chartData = Object.values(buckets).map((b) => {
      b.netIncome = Math.round(b.netIncome * 100) / 100;
      return b;
    });

    return chartData;
  }

  async getVendorProductSalesStats(
    userId: string,
    startDateStr: string,
    endDateStr: string,
  ) {
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId },
    });
    if (!vendor) {
      throw new NotFoundException('Vendor profile not found.');
    }

    const products = await this.prisma.product.findMany({
      where: { vendorId: vendor.id },
      select: { id: true, name: true },
    });

    const start = new Date(startDateStr);
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(endDateStr);
    end.setUTCHours(23, 59, 59, 999);

    const orderItems = await this.prisma.orderItem.findMany({
      where: {
        order: {
          vendorId: vendor.id,
          status: 'COMPLETED',
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      },
      select: {
        productId: true,
        quantity: true,
        order: {
          select: {
            createdAt: true,
          },
        },
      },
    });

    const buckets: {
      [key: string]: {
        date: string;
        [productName: string]: string | number;
      };
    } = {};

    const current = new Date(start);
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      const bucket: { date: string; [productName: string]: string | number } = {
        date: dateStr,
      };
      // Pre-populate each product with 0 sales
      for (const prod of products) {
        bucket[prod.name] = 0;
      }
      buckets[dateStr] = bucket;
      current.setUTCDate(current.getUTCDate() + 1);
    }

    // Map productId to name for fast lookup
    const prodMap = new Map<string, string>();
    for (const prod of products) {
      prodMap.set(prod.id, prod.name);
    }

    for (const item of orderItems) {
      const dateStr = item.order.createdAt.toISOString().split('T')[0];
      const prodName = prodMap.get(item.productId);
      if (prodName && buckets[dateStr]) {
        const bucket = buckets[dateStr];
        const currentQty = (bucket[prodName] as number) || 0;
        bucket[prodName] = currentQty + item.quantity;
      }
    }

    return {
      products: products.map((p) => p.name),
      chartData: Object.values(buckets),
    };
  }

  async getBuyerSpendingsStats(
    userId: string,
    startDateStr: string,
    endDateStr: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User profile not found.');
    }

    const start = new Date(startDateStr);
    start.setUTCHours(0, 0, 0, 0);

    const end = new Date(endDateStr);
    end.setUTCHours(23, 59, 59, 999);

    const orders = await this.prisma.order.findMany({
      where: {
        buyerId: userId,
        status: 'COMPLETED',
        createdAt: {
          gte: start,
          lte: end,
        },
      },
      select: {
        total: true,
        createdAt: true,
      },
    });

    const buckets: { [key: string]: { date: string; spendings: number } } = {};
    const current = new Date(start);
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      buckets[dateStr] = { date: dateStr, spendings: 0 };
      current.setUTCDate(current.getUTCDate() + 1);
    }

    for (const order of orders) {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      if (buckets[dateStr]) {
        buckets[dateStr].spendings += order.total;
      }
    }

    const chartData = Object.values(buckets).map((b) => {
      b.spendings = Math.round(b.spendings * 100) / 100;
      return b;
    });

    return chartData;
  }
}
