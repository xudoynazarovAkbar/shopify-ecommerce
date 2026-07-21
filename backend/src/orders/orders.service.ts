import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { CouponsService } from '../coupons/coupons.service';
import { CheckoutDto } from './dto/checkout.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
    private readonly couponsService: CouponsService,
  ) {}

  async checkout(buyerId: string, dto?: CheckoutDto) {
    // Validate card ownership if savedCardId is provided
    if (dto?.savedCardId) {
      const card = await this.prisma.savedCard.findUnique({
        where: { id: dto.savedCardId },
      });
      if (!card) {
        throw new NotFoundException(
          `Saved card with ID "${dto.savedCardId}" not found`,
        );
      }
      if (card.buyerId !== buyerId) {
        throw new ForbiddenException(
          'This payment method does not belong to you',
        );
      }
    }

    // 1. Fetch active cart
    const cart = await this.cartService.getCart(buyerId);

    // 2. Validate cart has items and has a vendor associated
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException('Cannot checkout: Your cart is empty.');
    }

    if (!cart.vendorId) {
      throw new BadRequestException(
        'Cannot checkout: Cart is not associated with any vendor.',
      );
    }

    let discount = 0.0;
    let promoCode: string | null = null;

    if (dto?.promoCode) {
      const coupon = await this.couponsService.validateCoupon(
        cart.vendorId,
        dto.promoCode,
      );

      if (coupon.discountType === 'PERCENTAGE') {
        discount = parseFloat(
          (cart.subtotal * (coupon.discountValue / 100)).toFixed(2),
        );
      } else {
        discount = parseFloat(coupon.discountValue.toFixed(2));
      }

      // Discount cannot exceed subtotal
      discount = Math.min(discount, cart.subtotal);
      promoCode = coupon.code;
    }

    const calculatedTotal = parseFloat(
      (cart.subtotal + cart.tax + cart.deliveryFee - discount).toFixed(2),
    );
    const finalTotal = Math.max(0.0, calculatedTotal);

    // 3. Create order and clear cart in a transaction to ensure atomicity
    const order = await this.prisma.$transaction(async (tx) => {
      // Create the main Order along with nested OrderItems
      const createdOrder = await tx.order.create({
        data: {
          buyerId,
          vendorId: cart.vendorId!,
          subtotal: cart.subtotal,
          tax: cart.tax,
          deliveryFee: cart.deliveryFee,
          discount,
          total: finalTotal,
          promoCode,
          status: OrderStatus.PENDING,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Clear the cart items
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      // Reset the vendorId on the cart
      await tx.cart.update({
        where: { id: cart.id },
        data: { vendorId: null },
      });

      return createdOrder;
    });

    return order;
  }

  async getBuyerOrders(buyerId: string) {
    return this.prisma.order.findMany({
      where: { buyerId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        vendor: {
          select: {
            id: true,
            shopName: true,
            shopDescription: true,
          },
        },
        review: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getVendorOrders(userId: string) {
    // Resolve vendor profile first
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      throw new ForbiddenException('Vendor profile not found');
    }

    return this.prisma.order.findMany({
      where: { vendorId: vendor.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        buyer: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateOrderStatus(
    userId: string,
    orderId: string,
    status: OrderStatus,
  ) {
    // Resolve vendor profile first
    const vendor = await this.prisma.vendor.findUnique({
      where: { userId },
    });

    if (!vendor) {
      throw new ForbiddenException('Vendor profile not found');
    }

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID "${orderId}" not found`);
    }

    if (order.vendorId !== vendor.id) {
      throw new ForbiddenException(
        'You do not have permission to update this order',
      );
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        buyer: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }
}
