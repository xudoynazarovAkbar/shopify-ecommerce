import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(buyerId: string, dto: CreateReviewDto) {
    const order = await this.prisma.order.findUnique({
      where: { id: dto.orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${dto.orderId} not found`);
    }

    if (order.buyerId !== buyerId) {
      throw new ForbiddenException(
        'You are not authorized to review this order',
      );
    }

    if (order.status !== 'COMPLETED') {
      throw new BadRequestException('Only completed orders can be reviewed');
    }

    const existingReview = await this.prisma.review.findUnique({
      where: { orderId: dto.orderId },
    });

    if (existingReview) {
      throw new ConflictException('This order has already been reviewed');
    }

    return this.prisma.review.create({
      data: {
        orderId: dto.orderId,
        buyerId,
        vendorId: order.vendorId,
        rating: dto.rating,
        comment: dto.comment,
      },
    });
  }

  async getVendorReviews(vendorId: string) {
    return this.prisma.review.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
      include: {
        buyer: {
          select: {
            email: true,
          },
        },
      },
    });
  }
}
