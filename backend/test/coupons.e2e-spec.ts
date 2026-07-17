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

interface CouponResponse {
  id: string;
  vendorId: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  isActive: boolean;
  expirationDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface OrderResponse {
  id: string;
  orderNumber: number;
  buyerId: string;
  vendorId: string;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
  promoCode: string | null;
  status: string;
}

describe('Merchant Coupon & Promo Code Engine (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  let adminToken: string;
  let buyerToken: string;

  let vendorAToken: string;
  let vendorAId: string; // vendor profile ID

  let vendorBToken: string;
  let vendorBId: string; // vendor profile ID

  let categoryId: string;
  let productAId: string;
  let productBId: string;

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
    const buyerEmail = `buyer_coupons_${Date.now()}@test.com`;
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: buyerEmail,
        password: 'Password123',
        role: 'BUYER',
      })
      .expect(201);

    const buyerLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: buyerEmail, password: 'Password123' })
      .expect(200);
    buyerToken = (buyerLoginRes.body as LoginResponse).accessToken;

    // 3. Setup Vendor A
    const vendorAEmail = `vendor_coupons_a_${Date.now()}@test.com`;
    await request(app.getHttpServer())
      .post('/vendors/register')
      .send({
        email: vendorAEmail,
        password: 'Password123',
        shopName: 'Vendor A (Coupons)',
      })
      .expect(201);

    const userA = await prisma.user.findUnique({
      where: { email: vendorAEmail },
      include: { vendorProfile: true },
    });
    vendorAId = userA!.vendorProfile!.id;

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
    const vendorBEmail = `vendor_coupons_b_${Date.now()}@test.com`;
    await request(app.getHttpServer())
      .post('/vendors/register')
      .send({
        email: vendorBEmail,
        password: 'Password123',
        shopName: 'Vendor B (Coupons)',
      })
      .expect(201);

    const userB = await prisma.user.findUnique({
      where: { email: vendorBEmail },
      include: { vendorProfile: true },
    });
    vendorBId = userB!.vendorProfile!.id;

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

    // 5. Setup global Category
    const categoryRes = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Food_Coupons_${Date.now()}`,
        description: 'Categories for coupon testing',
      })
      .expect(201);
    categoryId = (categoryRes.body as { id: string }).id;

    // 6. Create Products
    const prodARes = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${vendorAToken}`)
      .send({
        categoryId,
        name: 'Burger',
        price: 10.0,
      })
      .expect(201);
    productAId = (prodARes.body as { id: string }).id;

    const prodBRes = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${vendorBToken}`)
      .send({
        categoryId,
        name: 'Pizza',
        price: 20.0,
      })
      .expect(201);
    productBId = (prodBRes.body as { id: string }).id;
  });

  afterAll(async () => {
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

  describe('Vendor Coupon CRUD Management', () => {
    let createdCouponId: string;

    it('should allow vendors to create a PERCENTAGE coupon', async () => {
      const res = await request(app.getHttpServer())
        .post('/coupons')
        .set('Authorization', `Bearer ${vendorAToken}`)
        .send({
          code: 'burger20',
          discountType: 'PERCENTAGE',
          discountValue: 20.0,
        })
        .expect(201);

      const coupon = res.body as CouponResponse;
      expect(coupon.id).toBeDefined();
      expect(coupon.code).toBe('BURGER20'); // uppercase normalization
      expect(coupon.discountType).toBe('PERCENTAGE');
      expect(coupon.discountValue).toBe(20.0);
      expect(coupon.isActive).toBe(true);
      expect(coupon.vendorId).toBe(vendorAId);

      createdCouponId = coupon.id;
    });

    it('should fail to create coupon with duplicate code for the same vendor', async () => {
      await request(app.getHttpServer())
        .post('/coupons')
        .set('Authorization', `Bearer ${vendorAToken}`)
        .send({
          code: 'burger20',
          discountType: 'FLAT',
          discountValue: 5.0,
        })
        .expect(409); // ConflictException
    });

    it('should allow different vendor to create coupon with the same code', async () => {
      await request(app.getHttpServer())
        .post('/coupons')
        .set('Authorization', `Bearer ${vendorBToken}`)
        .send({
          code: 'burger20',
          discountType: 'PERCENTAGE',
          discountValue: 15.0,
        })
        .expect(201);
    });

    it('should list all coupons for a vendor', async () => {
      const res = await request(app.getHttpServer())
        .get('/coupons')
        .set('Authorization', `Bearer ${vendorAToken}`)
        .expect(200);

      const body = res.body as CouponResponse[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBe(1);
      expect(body[0].code).toBe('BURGER20');
    });

    it('should block non-vendors from creating/listing coupons', async () => {
      await request(app.getHttpServer())
        .post('/coupons')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          code: 'BUYER20',
          discountType: 'PERCENTAGE',
          discountValue: 20.0,
        })
        .expect(403);

      await request(app.getHttpServer())
        .get('/coupons')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(403);
    });

    it('should allow updating coupon properties', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/coupons/${createdCouponId}`)
        .set('Authorization', `Bearer ${vendorAToken}`)
        .send({
          isActive: false,
        })
        .expect(200);

      const body = res.body as CouponResponse;
      expect(body.isActive).toBe(false);

      // Re-enable it for checkout testing
      const reEnableRes = await request(app.getHttpServer())
        .patch(`/coupons/${createdCouponId}`)
        .set('Authorization', `Bearer ${vendorAToken}`)
        .send({
          isActive: true,
        })
        .expect(200);

      const reEnableBody = reEnableRes.body as CouponResponse;
      expect(reEnableBody.isActive).toBe(true);
    });

    it('should block vendor from updating coupon of another vendor', async () => {
      await request(app.getHttpServer())
        .patch(`/coupons/${createdCouponId}`)
        .set('Authorization', `Bearer ${vendorBToken}`)
        .send({
          isActive: false,
        })
        .expect(403);
    });
  });

  describe('Checkout with Coupons Integration', () => {
    beforeAll(async () => {
      // 1. Create a FLAT coupon on Vendor A
      await request(app.getHttpServer())
        .post('/coupons')
        .set('Authorization', `Bearer ${vendorAToken}`)
        .send({
          code: 'FLAT5',
          discountType: 'FLAT',
          discountValue: 5.0,
        })
        .expect(201);

      // 2. Create an EXPIRED coupon on Vendor A
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await request(app.getHttpServer())
        .post('/coupons')
        .set('Authorization', `Bearer ${vendorAToken}`)
        .send({
          code: 'EXPIRED',
          discountType: 'PERCENTAGE',
          discountValue: 10.0,
          expirationDate: yesterday.toISOString(),
        })
        .expect(201);

      // 3. Create an INACTIVE coupon on Vendor A
      const inactiveRes = await request(app.getHttpServer())
        .post('/coupons')
        .set('Authorization', `Bearer ${vendorAToken}`)
        .send({
          code: 'INACTIVE',
          discountType: 'PERCENTAGE',
          discountValue: 10.0,
        })
        .expect(201);

      const inactiveCoupon = inactiveRes.body as CouponResponse;

      await request(app.getHttpServer())
        .patch(`/coupons/${inactiveCoupon.id}`)
        .set('Authorization', `Bearer ${vendorAToken}`)
        .send({ isActive: false })
        .expect(200);
    });

    afterEach(async () => {
      // Clear cart of the buyer after each checkout test
      await request(app.getHttpServer())
        .delete('/cart')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);
    });

    it('should apply PERCENTAGE coupon correctly during checkout', async () => {
      // Add 2 burgers ($10 each) to cart = subtotal $20
      await request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ productId: productAId, quantity: 2 })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ promoCode: 'burger20' })
        .expect(201);

      const order = res.body as OrderResponse;
      expect(order.subtotal).toBe(20.0);
      expect(order.discount).toBe(4.0); // 20% of $20
      expect(order.tax).toBe(2.0); // 10% tax on subtotal (as calculated by cart service before discount)
      expect(order.deliveryFee).toBe(5.0);
      expect(order.total).toBe(23.0); // 20 + 2 + 5 - 4 = 23
      expect(order.promoCode).toBe('BURGER20');
    });

    it('should apply FLAT coupon correctly during checkout', async () => {
      // Add 3 burgers ($10 each) to cart = subtotal $30
      await request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ productId: productAId, quantity: 3 })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ promoCode: 'flat5' })
        .expect(201);

      const order = res.body as OrderResponse;
      expect(order.subtotal).toBe(30.0);
      expect(order.discount).toBe(5.0); // Flat $5
      expect(order.tax).toBe(3.0); // 10% tax on $30 subtotal
      expect(order.deliveryFee).toBe(5.0);
      expect(order.total).toBe(33.0); // 30 + 3 + 5 - 5 = 33
      expect(order.promoCode).toBe('FLAT5');
    });

    it('should fail checkout with coupon belonging to a different vendor', async () => {
      // Add Vendor B item (Pizza - $20) to cart
      await request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ productId: productBId, quantity: 1 })
        .expect(201);

      // Attempt to checkout using Vendor A's coupon (FLAT5 is only on Vendor A)
      const res = await request(app.getHttpServer())
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ promoCode: 'flat5' })
        .expect(400);

      expect((res.body as { message: string }).message).toContain(
        'invalid for this shop',
      );
    });

    it('should fail checkout with an inactive coupon', async () => {
      await request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ productId: productAId, quantity: 1 })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ promoCode: 'inactive' })
        .expect(400);

      expect((res.body as { message: string }).message).toContain('inactive');
    });

    it('should fail checkout with an expired coupon', async () => {
      await request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ productId: productAId, quantity: 1 })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ promoCode: 'expired' })
        .expect(400);

      expect((res.body as { message: string }).message).toContain('expired');
    });

    it('should cap the discount at the subtotal value if discount exceeds subtotal', async () => {
      // Create flat coupon with high discount value
      await request(app.getHttpServer())
        .post('/coupons')
        .set('Authorization', `Bearer ${vendorAToken}`)
        .send({
          code: 'FREEBIE',
          discountType: 'FLAT',
          discountValue: 100.0,
        })
        .expect(201);

      // Add 1 burger ($10) to cart
      await request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ productId: productAId, quantity: 1 })
        .expect(201);

      const res = await request(app.getHttpServer())
        .post('/orders/checkout')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({ promoCode: 'freebie' })
        .expect(201);

      const order = res.body as OrderResponse;
      expect(order.subtotal).toBe(10.0);
      expect(order.discount).toBe(10.0); // discount capped to subtotal ($10) rather than full $100
      expect(order.tax).toBe(1.0); // 10% on $10
      expect(order.deliveryFee).toBe(5.0);
      expect(order.total).toBe(6.0); // 10 + 1 + 5 - 10 = 6.0
    });
  });
});
