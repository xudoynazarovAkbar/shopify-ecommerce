import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { buyerId: userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                vendor: true,
              },
            },
          },
        },
        vendor: true,
      },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { buyerId: userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  vendor: true,
                },
              },
            },
          },
          vendor: true,
        },
      });
    }

    const subtotal = cart.items.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0,
    );
    const tax = parseFloat((subtotal * 0.1).toFixed(2)); // 10% tax rate
    const deliveryFee = subtotal > 0 ? 5.0 : 0.0; // Flat $5 delivery fee
    const total = parseFloat((subtotal + tax + deliveryFee).toFixed(2));

    return {
      ...cart,
      subtotal,
      tax,
      deliveryFee,
      total,
    };
  }

  async addToCart(userId: string, dto: AddToCartDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      throw new NotFoundException(
        `Product with ID "${dto.productId}" not found`,
      );
    }

    if (product.status !== 'APPROVED') {
      throw new BadRequestException('Cannot add unapproved product to cart');
    }

    let cart = await this.prisma.cart.findUnique({
      where: { buyerId: userId },
      include: { items: true },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { buyerId: userId },
        include: { items: true },
      });
    }

    // Check single-vendor rule
    if (cart.vendorId && cart.vendorId !== product.vendorId) {
      throw new BadRequestException(
        'A buyer can only add products from one specific shop or restaurant at a time. Please clear your cart first.',
      );
    }

    // If vendorId is not set, set it now
    if (!cart.vendorId) {
      await this.prisma.cart.update({
        where: { id: cart.id },
        data: { vendorId: product.vendorId },
      });
    }

    // Check if item already exists
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: product.id,
        },
      },
    });

    if (existingItem) {
      await this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + dto.quantity },
      });
    } else {
      await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: product.id,
          quantity: dto.quantity,
        },
      });
    }

    return this.getCart(userId);
  }

  async updateCartItem(
    userId: string,
    cartItemId: string,
    dto: UpdateCartItemDto,
  ) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.buyerId !== userId) {
      throw new NotFoundException(
        `Cart item with ID "${cartItemId}" not found`,
      );
    }

    await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity: dto.quantity },
    });

    return this.getCart(userId);
  }

  async removeFromCart(userId: string, cartItemId: string) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!cartItem || cartItem.cart.buyerId !== userId) {
      throw new NotFoundException(
        `Cart item with ID "${cartItemId}" not found`,
      );
    }

    await this.prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    // Check if cart is now empty to reset vendorId
    const remainingItemsCount = await this.prisma.cartItem.count({
      where: { cartId: cartItem.cartId },
    });

    if (remainingItemsCount === 0) {
      await this.prisma.cart.update({
        where: { id: cartItem.cartId },
        data: { vendorId: null },
      });
    }

    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { buyerId: userId },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    await this.prisma.cart.update({
      where: { id: cart.id },
      data: { vendorId: null },
    });

    return this.getCart(userId);
  }
}
