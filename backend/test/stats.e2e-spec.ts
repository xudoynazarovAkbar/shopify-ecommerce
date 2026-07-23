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

describe('Platform Revenue Dashboard Stats (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  let adminToken: string;
  let buyerToken: string;
  let vendorToken: string;

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
    adminToken = (adminLoginRes.body as LoginResponse).accessToken;

    // 2. Setup Buyer
    const buyerEmail = `buyer_stats_${Date.now()}@test.com`;
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

    // 3. Setup Vendor
    const vendorEmail = `vendor_stats_${Date.now()}@test.com`;
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: vendorEmail,
        password: 'Password123',
        role: 'VENDOR',
        shopName: 'Test Statistics Shop',
        shopDescription: 'An elegant test shop',
      })
      .expect(201);

    // Approve the vendor profile BEFORE logging in
    const vendorUser = await prisma.user.findUnique({
      where: { email: vendorEmail },
      include: { vendorProfile: true },
    });
    if (vendorUser?.vendorProfile) {
      await prisma.vendor.update({
        where: { id: vendorUser.vendorProfile.id },
        data: { status: 'APPROVED' },
      });
    }

    const vendorLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: vendorEmail, password: 'Password123' })
      .expect(200);
    vendorToken = (vendorLoginRes.body as LoginResponse).accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /stats/revenue', () => {
    it('should refuse access for unauthenticated users', async () => {
      await request(app.getHttpServer())
        .get('/stats/revenue?startDate=2026-07-01&endDate=2026-07-07')
        .expect(401);
    });

    it('should refuse access for non-admin users (BUYER)', async () => {
      await request(app.getHttpServer())
        .get('/stats/revenue?startDate=2026-07-01&endDate=2026-07-07')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(403);
    });

    it('should allow access for admin users and return date buckets', async () => {
      const res = await request(app.getHttpServer())
        .get('/stats/revenue?startDate=2026-07-01&endDate=2026-07-03')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('commissionRate');
      expect(res.body).toHaveProperty('chartData');
      expect(Array.isArray(res.body.chartData)).toBe(true);
      expect(res.body.chartData.length).toBe(3); // 2026-07-01, 2026-07-02, 2026-07-03
      expect(res.body.chartData[0]).toHaveProperty('date', '2026-07-01');
      expect(res.body.chartData[0]).toHaveProperty('campaignsRevenue');
      expect(res.body.chartData[0]).toHaveProperty('commissionRevenue');
      expect(res.body.chartData[0]).toHaveProperty('totalIncome');
    });

    it('should return 400 if startDate or endDate query params are missing', async () => {
      await request(app.getHttpServer())
        .get('/stats/revenue?startDate=2026-07-01')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      await request(app.getHttpServer())
        .get('/stats/revenue?endDate=2026-07-01')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });

    it('should return 400 if dates are invalid or start > end', async () => {
      await request(app.getHttpServer())
        .get('/stats/revenue?startDate=invalid&endDate=2026-07-01')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      await request(app.getHttpServer())
        .get('/stats/revenue?startDate=2026-07-05&endDate=2026-07-01')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });
  });

  describe('GET and PATCH /stats/settings', () => {
    it('should allow admin to retrieve global platform settings', async () => {
      const res = await request(app.getHttpServer())
        .get('/stats/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('id', 'GLOBAL');
      expect(res.body).toHaveProperty('commissionRate');
    });

    it('should refuse access to settings for BUYERs', async () => {
      await request(app.getHttpServer())
        .get('/stats/settings')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(403);
    });

    it('should allow admin to update the global commission rate', async () => {
      const res = await request(app.getHttpServer())
        .patch('/stats/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ commissionRate: 0.15 })
        .expect(200);

      expect(res.body.commissionRate).toBe(0.15);

      // Verify setting was persisted on the database
      const settings = await prisma.platformSettings.findUnique({
        where: { id: 'GLOBAL' },
      });
      expect(settings?.commissionRate).toBe(0.15);

      // Restore default rate (0.10) for other tests
      await prisma.platformSettings.update({
        where: { id: 'GLOBAL' },
        data: { commissionRate: 0.10 },
      });
    });

    it('should validate commissionRate range (0 to 1)', async () => {
      await request(app.getHttpServer())
        .patch('/stats/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ commissionRate: 1.5 })
        .expect(400);

      await request(app.getHttpServer())
        .patch('/stats/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ commissionRate: -0.05 })
        .expect(400);
    });
  });

  describe('GET /stats/vendor/income', () => {
    it('should refuse access for unauthenticated users', async () => {
      await request(app.getHttpServer())
        .get('/stats/vendor/income?startDate=2026-07-01&endDate=2026-07-03')
        .expect(401);
    });

    it('should refuse access for non-vendor users (BUYER)', async () => {
      await request(app.getHttpServer())
        .get('/stats/vendor/income?startDate=2026-07-01&endDate=2026-07-03')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(403);
    });

    it('should return continuous date buckets for vendor net income', async () => {
      const res = await request(app.getHttpServer())
        .get('/stats/vendor/income?startDate=2026-07-01&endDate=2026-07-03')
        .set('Authorization', `Bearer ${vendorToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(3); // 2026-07-01, 2026-07-02, 2026-07-03
      expect(res.body[0]).toHaveProperty('date', '2026-07-01');
      expect(res.body[0]).toHaveProperty('netIncome', 0);
    });
  });

  describe('GET /stats/vendor/products', () => {
    it('should return continuous date buckets with pre-populated products', async () => {
      const res = await request(app.getHttpServer())
        .get('/stats/vendor/products?startDate=2026-07-01&endDate=2026-07-03')
        .set('Authorization', `Bearer ${vendorToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('products');
      expect(res.body).toHaveProperty('chartData');
      expect(Array.isArray(res.body.products)).toBe(true);
      expect(Array.isArray(res.body.chartData)).toBe(true);
      expect(res.body.chartData.length).toBe(3);
      expect(res.body.chartData[0]).toHaveProperty('date', '2026-07-01');
    });
  });
});
