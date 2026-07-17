import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

interface LoginResponse {
  accessToken: string;
}

interface OrderItemResponse {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    price: number;
  };
}

interface OrderResponse {
  id: string;
  orderNumber: number;
  buyerId: string;
  vendorId: string;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
  status: string;
  items: OrderItemResponse[];
  createdAt: string;
  vendor?: {
    id: string;
    shopName: string;
  };
  buyer?: {
    id: string;
    email: string;
  };
}

describe('Dual-Keyed Order Management System (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  let adminToken: string;
  let buyerToken: string;
  let buyerId: string;

  let vendorAToken: string;
  let vendorAId: string; // vendor profile ID

  let vendorBToken: string;
  let vendorBId: string; // vendor profile ID

  let categoryId: string;
  let productA1Id: string;
  let productA2Id: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    prisma = app.get<PrismaService>(PrismaService);

    // 1. Get Admin Token
    const adminLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@shopify.com', password: 'Password123' })
      .expect(200);
    const adminLoginBody = adminLoginRes.body as LoginResponse;
    adminToken = adminLoginBody.accessToken;

    // 2. Setup Buyer
    const buyerEmail = `buyer_orders_${Date.now()}@test.com`;
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: buyerEmail,
        password: 'Password123',
        role: 'BUYER',
      })
      .expect(201);

    const buyerUser = await prisma.user.findUnique({
      where: { email: buyerEmail },
    });
    buyerId = buyerUser!.id;

    const buyerLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: buyerEmail, password: 'Password123' })
      .expect(200);
    buyerToken = (buyerLoginRes.body as LoginResponse).accessToken;

    // 3. Setup Vendor A
    const vendorAEmail = `vendor_orders_a_${Date.now()}@test.com`;
    await request(app.getHttpServer())
      .post('/vendors/register')
      .send({
        email: vendorAEmail,
        password: 'Password123',
        shopName: 'Vendor A Shop (Orders)',
      })
      .expect(201);

    const userA = await prisma.user.findUnique({
      where: { email: vendorAEmail },
      include: { vendorProfile: true },
    });
    vendorAId = userA!.vendorProfile!.id;

    // Approve status and elevate trust for Vendor A
    await request(app.getHttpServer())
      .patch(`/admin/vendors/${vendorAId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'APPROVED' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/admin/vendors/${vendorAId}/trust`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ autoApproveProducts: true })
      .expect(200);

    const loginA = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: vendorAEmail, password: 'Password123' })
      .expect(200);
    vendorAToken = (loginA.body as LoginResponse).accessToken;

    // 4. Setup Vendor B
    const vendorBEmail = `vendor_orders_b_${Date.now()}@test.com`;
    await request(app.getHttpServer())
      .post('/vendors/register')
      .send({
        email: vendorBEmail,
        password: 'Password123',
        shopName: 'Vendor B Shop (Orders)',
      })
      .expect(201);

    const userB = await prisma.user.findUnique({
      where: { email: vendorBEmail },
      include: { vendorProfile: true },
    });
    vendorBId = userB!.vendorProfile!.id;

    // Approve status and elevate trust for Vendor B
    await request(app.getHttpServer())
      .patch(`/admin/vendors/${vendorBId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'APPROVED' })
      .expect(200);

    await request(app.getHttpServer())
      .patch(`/admin/vendors/${vendorBId}/trust`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ autoApproveProducts: true })
      .expect(200);

    const loginB = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: vendorBEmail, password: 'Password123' })
      .expect(200);
    vendorBToken = (loginB.body as LoginResponse).accessToken;

    // 5. Create Global Category
    const categoryRes = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Food_Orders_${Date.now()}`,
        description: 'Delicious food items for order testing',
      })
      .expect(201);
    categoryId = (categoryRes.body as { id: string }).id;

    // 6. Create Products
    // Product A1 (Vendor A) - $10.00
    const prodA1Res = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${vendorAToken}`)
      .send({
        categoryId,
        name: 'Burger',
        price: 10.0,
        description: 'Juicy beef burger',
      })
      .expect(201);
    productA1Id = (prodA1Res.body as { id: string }).id;

    // Product A2 (Vendor A) - $5.00
    const prodA2Res = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${vendorAToken}`)
      .send({
        categoryId,
        name: 'Fries',
        price: 5.0,
        description: 'Crispy salted french fries',
      })
      .expect(201);
    productA2Id = (prodA2Res.body as { id: string }).id;

    // Product B (Vendor B) - $12.00
    await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${vendorBToken}`)
      .send({
        categoryId,
        name: 'Pizza',
        price: 12.0,
        description: 'Cheesy pepperoni pizza',
      })
      .expect(201);
  });

  afterAll(async () => {
    // Cleanup to avoid key conflicts and maintain isolated test state
    await prisma.review.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.cart.deleteMany();
    await prisma.coupon.deleteMany();
    await prisma.savedCard.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.vendor.deleteMany();
    await prisma.user.deleteMany({
      where: {
        email: {
          not: 'admin@shopify.com',
        },
      },
    });

    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /orders/checkout', () => {
    it('should fail checkout if the cart is empty', async () => {
      const res = await request(app.getHttpServer())
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(400);

      expect((res.body as { message: string }).message).toContain('empty');
    });

    it('should successfully checkout and create an order with sequential order numbers', async () => {
      // 1. Add items from Vendor A to cart
      await request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ productId: productA1Id, quantity: 2 })
        .expect(201);

      await request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ productId: productA2Id, quantity: 1 })
        .expect(201);

      // 2. Perform checkout
      const res = await request(app.getHttpServer())
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(201);

      const order = res.body as OrderResponse;
      expect(order.id).toBeDefined();
      expect(order.buyerId).toBe(buyerId);
      expect(order.vendorId).toBe(vendorAId);
      expect(order.status).toBe('PENDING');
      expect(order.subtotal).toBe(25.0); // (2 * 10) + (1 * 5)
      expect(order.tax).toBe(2.5); // 10%
      expect(order.deliveryFee).toBe(5.0);
      expect(order.total).toBe(32.5);
      expect(order.orderNumber).toBeDefined();
      expect(order.items).toHaveLength(2);

      // Verify cart is cleared
      const cartRes = await request(app.getHttpServer())
        .get('/cart')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      const cartBody = cartRes.body as {
        items: unknown[];
        vendorId: string | null;
      };
      expect(cartBody.items).toHaveLength(0);
      expect(cartBody.vendorId).toBeNull();
    });
  });

  describe('GET /orders/my-orders', () => {
    it('should retrieve list of orders for the buyer', async () => {
      const res = await request(app.getHttpServer())
        .get('/orders/my-orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      const orders = res.body as OrderResponse[];
      expect(orders).toHaveLength(1);
      expect(orders[0].buyerId).toBe(buyerId);
      expect(orders[0].vendor).toBeDefined();
      expect(orders[0].items).toHaveLength(2);
    });
  });

  describe('GET /orders/vendor-orders', () => {
    it('should retrieve list of orders for the vendor', async () => {
      const res = await request(app.getHttpServer())
        .get('/orders/vendor-orders')
        .set('Authorization', `Bearer ${vendorAToken}`)
        .expect(200);

      const orders = res.body as OrderResponse[];
      expect(orders).toHaveLength(1);
      expect(orders[0].vendorId).toBe(vendorAId);
      expect(orders[0].buyer).toBeDefined();
      expect(orders[0].buyer?.id).toBe(buyerId);
    });

    it('should return empty list of orders for other vendor B', async () => {
      const res = await request(app.getHttpServer())
        .get('/orders/vendor-orders')
        .set('Authorization', `Bearer ${vendorBToken}`)
        .expect(200);

      const orders = res.body as OrderResponse[];
      expect(orders).toHaveLength(0);
    });
  });

  describe('PATCH /orders/:id/status', () => {
    let orderId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .get('/orders/my-orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);
      orderId = (res.body as OrderResponse[])[0].id;
    });

    it('should prevent non-owners (vendor B) from updating the order status', async () => {
      await request(app.getHttpServer())
        .patch(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${vendorBToken}`)
        .send({ status: 'COMPLETED' })
        .expect(403);
    });

    it('should prevent invalid statuses from being set due to validation pipes', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${vendorAToken}`)
        .send({ status: 'DELIVERED' }) // DELIVERED is not part of OrderStatus enum
        .expect(400);

      expect((res.body as { message: string[] }).message[0]).toContain(
        'Order status must be',
      );
    });

    it('should allow vendor A to update the order status to COMPLETED', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${vendorAToken}`)
        .send({ status: 'COMPLETED' })
        .expect(200);

      const order = res.body as OrderResponse;
      expect(order.status).toBe('COMPLETED');

      // Verify in DB / GET
      const myOrdersRes = await request(app.getHttpServer())
        .get('/orders/my-orders')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);
      expect((myOrdersRes.body as OrderResponse[])[0].status).toBe('COMPLETED');
    });
  });
});
