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

interface ReviewResponse {
  id: string;
  orderId: string;
  buyerId: string;
  vendorId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  buyer?: {
    email: string;
  };
}

interface VendorProfileResponse {
  id: string;
  shopName: string;
  shopDescription?: string;
  status: string;
  averageRating: number | null;
  reviewCount: number;
}

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
}

describe('Reviews & Ratings Engine (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  let buyerToken: string;
  let buyerId: string;

  let otherBuyerToken: string;
  let otherBuyerId: string;

  let vendorId: string;

  let completedOrderId: string;
  let pendingOrderId: string;
  let cancelledOrderId: string;
  let otherCompletedOrderId: string;

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

    // 1. Setup Buyer 1
    const buyerEmail = `buyer_reviews_${Date.now()}@test.com`;
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

    // 2. Setup Buyer 2
    const otherBuyerEmail = `other_buyer_reviews_${Date.now()}@test.com`;
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: otherBuyerEmail,
        password: 'Password123',
        role: 'BUYER',
      })
      .expect(201);

    const otherBuyerUser = await prisma.user.findUnique({
      where: { email: otherBuyerEmail },
    });
    otherBuyerId = otherBuyerUser!.id;

    const otherBuyerLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: otherBuyerEmail, password: 'Password123' })
      .expect(200);
    otherBuyerToken = (otherBuyerLoginRes.body as LoginResponse).accessToken;

    // 3. Setup Vendor
    const vendorUser = await prisma.user.create({
      data: {
        email: `vendor_reviews_${Date.now()}@test.com`,
        password: 'Password123',
        role: 'VENDOR',
        vendorProfile: {
          create: {
            shopName: 'E2E Reviews Shop',
            shopDescription: 'Review me!',
            status: 'APPROVED',
          },
        },
      },
      include: {
        vendorProfile: true,
      },
    });
    vendorId = vendorUser.vendorProfile!.id;

    // 4. Setup Orders via Prisma directly to control statuses and bypass cart/checkout rules
    const orderCompleted = await prisma.order.create({
      data: {
        buyerId,
        vendorId,
        subtotal: 100.0,
        tax: 10.0,
        deliveryFee: 5.0,
        total: 115.0,
        status: 'COMPLETED',
      },
    });
    completedOrderId = orderCompleted.id;

    const orderPending = await prisma.order.create({
      data: {
        buyerId,
        vendorId,
        subtotal: 100.0,
        tax: 10.0,
        deliveryFee: 5.0,
        total: 115.0,
        status: 'PENDING',
      },
    });
    pendingOrderId = orderPending.id;

    const orderCancelled = await prisma.order.create({
      data: {
        buyerId,
        vendorId,
        subtotal: 100.0,
        tax: 10.0,
        deliveryFee: 5.0,
        total: 115.0,
        status: 'CANCELLED',
      },
    });
    cancelledOrderId = orderCancelled.id;

    const otherOrderCompleted = await prisma.order.create({
      data: {
        buyerId: otherBuyerId,
        vendorId,
        subtotal: 100.0,
        tax: 10.0,
        deliveryFee: 5.0,
        total: 115.0,
        status: 'COMPLETED',
      },
    });
    otherCompletedOrderId = otherOrderCompleted.id;
  });

  afterAll(async () => {
    // Cleanup E2E seeded data
    await prisma.review.deleteMany();
    await prisma.order.deleteMany();
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

  describe('POST /reviews - Review Creation', () => {
    it('should allow a buyer to successfully review a COMPLETED order', async () => {
      const res = await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          orderId: completedOrderId,
          rating: 5,
          comment: 'Outstanding service and quick response!',
        })
        .expect(201);

      const body = res.body as ReviewResponse;
      expect(body).toHaveProperty('id');
      expect(body.orderId).toBe(completedOrderId);
      expect(body.buyerId).toBe(buyerId);
      expect(body.vendorId).toBe(vendorId);
      expect(body.rating).toBe(5);
      expect(body.comment).toBe('Outstanding service and quick response!');
    });

    it('should fail with 400 if rating is less than 1', async () => {
      await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          orderId: completedOrderId,
          rating: 0,
        })
        .expect(400);
    });

    it('should fail with 400 if rating is greater than 5', async () => {
      await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          orderId: completedOrderId,
          rating: 6,
        })
        .expect(400);
    });

    it('should fail with 400 if rating is not an integer', async () => {
      await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          orderId: completedOrderId,
          rating: 4.5,
        })
        .expect(400);
    });

    it('should fail with 400 if order is still PENDING', async () => {
      const res = await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          orderId: pendingOrderId,
          rating: 4,
          comment: 'Still waiting...',
        })
        .expect(400);

      const body = res.body as ErrorResponse;
      const message = Array.isArray(body.message)
        ? body.message.join(' ')
        : body.message;
      expect(message).toContain('completed');
    });

    it('should fail with 400 if order is CANCELLED', async () => {
      const res = await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          orderId: cancelledOrderId,
          rating: 1,
          comment: 'Cancelled',
        })
        .expect(400);

      const body = res.body as ErrorResponse;
      const message = Array.isArray(body.message)
        ? body.message.join(' ')
        : body.message;
      expect(message).toContain('completed');
    });

    it('should fail with 403 if order belongs to another Buyer', async () => {
      await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          orderId: otherCompletedOrderId,
          rating: 5,
        })
        .expect(403);
    });

    it('should fail with 409 if the order is already reviewed', async () => {
      // completedOrderId is already reviewed in the first test
      const res = await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          orderId: completedOrderId,
          rating: 3,
        })
        .expect(409);

      const body = res.body as ErrorResponse;
      const message = Array.isArray(body.message)
        ? body.message.join(' ')
        : body.message;
      expect(message).toContain('already been reviewed');
    });
  });

  describe('GET /reviews/vendor/:vendorId - Review Retrieval', () => {
    it('should publicly retrieve all reviews for a vendor', async () => {
      const res = await request(app.getHttpServer())
        .get(`/reviews/vendor/${vendorId}`)
        .expect(200);

      const body = res.body as ReviewResponse[];
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThanOrEqual(1);
      expect(body[0].buyer).toBeDefined();
      expect(body[0].buyer?.email).toBeDefined();
    });
  });

  describe('GET /vendors/:id - Public Vendor Profile & Aggregated Ratings', () => {
    it('should return aggregated rating information for a vendor', async () => {
      const res = await request(app.getHttpServer())
        .get(`/vendors/${vendorId}`)
        .expect(200);

      const body = res.body as VendorProfileResponse;
      expect(body).toHaveProperty('averageRating');
      expect(body).toHaveProperty('reviewCount');
      expect(body.averageRating).toBe(5);
      expect(body.reviewCount).toBe(1);
    });

    it('should dynamically update averageRating and reviewCount when more reviews are added', async () => {
      // Add another review for otherCompletedOrderId by Buyer 2
      await request(app.getHttpServer())
        .post('/reviews')
        .set('Authorization', `Bearer ${otherBuyerToken}`)
        .send({
          orderId: otherCompletedOrderId,
          rating: 3,
          comment: 'Average experience',
        })
        .expect(201);

      // Fetch the vendor public profile again
      const res = await request(app.getHttpServer())
        .get(`/vendors/${vendorId}`)
        .expect(200);

      // (5 + 3) / 2 = 4.0
      const body = res.body as VendorProfileResponse;
      expect(body.averageRating).toBe(4);
      expect(body.reviewCount).toBe(2);
    });

    it('should return null for averageRating and 0 for reviewCount if no reviews exist for a vendor', async () => {
      // Create a fresh vendor with no reviews
      const freshVendorUser = await prisma.user.create({
        data: {
          email: `fresh_vendor_${Date.now()}@test.com`,
          password: 'Password123',
          role: 'VENDOR',
          vendorProfile: {
            create: {
              shopName: 'Fresh Shop',
              shopDescription: 'No reviews yet!',
              status: 'APPROVED',
            },
          },
        },
        include: {
          vendorProfile: true,
        },
      });
      const freshVendorId = freshVendorUser.vendorProfile!.id;

      const res = await request(app.getHttpServer())
        .get(`/vendors/${freshVendorId}`)
        .expect(200);

      const body = res.body as VendorProfileResponse;
      expect(body.averageRating).toBeNull();
      expect(body.reviewCount).toBe(0);
    });
  });
});
