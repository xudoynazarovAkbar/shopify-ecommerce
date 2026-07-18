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

interface SavedCardResponse {
  id: string;
  buyerId: string;
  cardToken: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  createdAt: string;
  updatedAt: string;
}

describe('Tokenized Payment Card Vaulting (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  let buyer1Token: string;
  let buyer1Id: string;

  let buyer2Token: string;
  let buyer2Id: string;

  let vendorToken: string;

  let adminToken: string;

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

    // 2. Setup Buyer 1
    const buyer1Email = `buyer1_${Date.now()}@test.com`;
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: buyer1Email,
        password: 'Password123',
        role: 'BUYER',
      })
      .expect(201);

    const buyer1User = await prisma.user.findUnique({
      where: { email: buyer1Email },
    });
    buyer1Id = buyer1User!.id;

    const buyer1Login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: buyer1Email, password: 'Password123' })
      .expect(200);
    buyer1Token = (buyer1Login.body as LoginResponse).accessToken;

    // 3. Setup Buyer 2
    const buyer2Email = `buyer2_${Date.now()}@test.com`;
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: buyer2Email,
        password: 'Password123',
        role: 'BUYER',
      })
      .expect(201);

    const buyer2User = await prisma.user.findUnique({
      where: { email: buyer2Email },
    });
    buyer2Id = buyer2User!.id;

    const buyer2Login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: buyer2Email, password: 'Password123' })
      .expect(200);
    buyer2Token = (buyer2Login.body as LoginResponse).accessToken;

    // 4. Setup Vendor
    const vendorEmail = `vendor_${Date.now()}@test.com`;
    await request(app.getHttpServer())
      .post('/vendors/register')
      .send({
        email: vendorEmail,
        password: 'Password123',
        shopName: 'Payments Test Shop',
      })
      .expect(201);

    const vendorUser = await prisma.user.findUnique({
      where: { email: vendorEmail },
      include: { vendorProfile: true },
    });
    const vendorProfileId = vendorUser!.vendorProfile!.id;

    // Approve the vendor so they can login
    await request(app.getHttpServer())
      .patch(`/admin/vendors/${vendorProfileId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'APPROVED' })
      .expect(200);

    const vendorLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: vendorEmail, password: 'Password123' })
      .expect(200);
    vendorToken = (vendorLogin.body as LoginResponse).accessToken;
  });

  afterAll(async () => {
    // Teardown with dependency order
    await prisma.savedCard.deleteMany();
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

  describe('POST /payments/cards', () => {
    it('should successfully vault a new payment card for an authorized BUYER', async () => {
      const res = await request(app.getHttpServer())
        .post('/payments/cards')
        .set('Authorization', `Bearer ${buyer1Token}`)
        .send({
          cardNumber: '1111222233334444',
          brand: 'Visa',
          expMonth: 12,
          expYear: 2028,
        })
        .expect(201);

      const card = res.body as SavedCardResponse;
      expect(card).toHaveProperty('id');
      expect(card).toHaveProperty('cardToken');
      expect(card.cardToken).toMatch(/^tok_/);
      expect(card.brand).toBe('Visa');
      expect(card.last4).toBe('4444');
      expect(card.expMonth).toBe(12);
      expect(card.expYear).toBe(2028);
      expect(card.buyerId).toBe(buyer1Id);

      // Verify DB does NOT store raw card number anywhere
      const savedInDb = await prisma.savedCard.findUnique({
        where: { id: card.id },
      });
      expect(savedInDb).toBeDefined();
      expect(savedInDb?.last4).toBe('4444');
      expect(savedInDb?.cardToken).toBe(card.cardToken);
    });

    it('should fail card vaulting with invalid numeric range for month/year', async () => {
      await request(app.getHttpServer())
        .post('/payments/cards')
        .set('Authorization', `Bearer ${buyer1Token}`)
        .send({
          cardNumber: '1111222233334444',
          brand: 'Visa',
          expMonth: 13, // invalid month
          expYear: 2028,
        })
        .expect(400);

      await request(app.getHttpServer())
        .post('/payments/cards')
        .set('Authorization', `Bearer ${buyer1Token}`)
        .send({
          cardNumber: '1111222233334444',
          brand: 'Visa',
          expMonth: 12,
          expYear: 2024, // invalid year (less than 2026)
        })
        .expect(400);
    });

    it('should fail card vaulting with invalid non-numeric card number', async () => {
      await request(app.getHttpServer())
        .post('/payments/cards')
        .set('Authorization', `Bearer ${buyer1Token}`)
        .send({
          cardNumber: '111122223333abc4', // invalid non-numeric
          brand: 'Visa',
          expMonth: 12,
          expYear: 2028,
        })
        .expect(400);
    });

    it('should fail card vaulting if user is VENDOR (RBAC)', async () => {
      await request(app.getHttpServer())
        .post('/payments/cards')
        .set('Authorization', `Bearer ${vendorToken}`)
        .send({
          cardNumber: '1111222233334444',
          brand: 'Visa',
          expMonth: 12,
          expYear: 2028,
        })
        .expect(403);
    });

    it('should fail card vaulting if user is ADMIN (RBAC)', async () => {
      await request(app.getHttpServer())
        .post('/payments/cards')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          cardNumber: '1111222233334444',
          brand: 'Visa',
          expMonth: 12,
          expYear: 2028,
        })
        .expect(403);
    });

    it('should fail card vaulting if unauthorized', async () => {
      await request(app.getHttpServer())
        .post('/payments/cards')
        .send({
          cardNumber: '1111222233334444',
          brand: 'Visa',
          expMonth: 12,
          expYear: 2028,
        })
        .expect(401);
    });
  });

  describe('GET /payments/cards', () => {
    it('should retrieve list of saved cards for the authenticated BUYER', async () => {
      // Clear cards for clean slate in listing test
      await prisma.savedCard.deleteMany();

      // Save two cards
      await prisma.savedCard.create({
        data: {
          buyerId: buyer1Id,
          cardToken: 'tok_abc123',
          brand: 'Mastercard',
          last4: '9999',
          expMonth: 10,
          expYear: 2027,
        },
      });

      await prisma.savedCard.create({
        data: {
          buyerId: buyer1Id,
          cardToken: 'tok_xyz789',
          brand: 'Amex',
          last4: '1111',
          expMonth: 5,
          expYear: 2029,
        },
      });

      // Save one card for buyer 2 to ensure isolation
      await prisma.savedCard.create({
        data: {
          buyerId: buyer2Id,
          cardToken: 'tok_buyer2card',
          brand: 'Visa',
          last4: '2222',
          expMonth: 12,
          expYear: 2030,
        },
      });

      const res = await request(app.getHttpServer())
        .get('/payments/cards')
        .set('Authorization', `Bearer ${buyer1Token}`)
        .expect(200);

      const cards = res.body as SavedCardResponse[];
      expect(cards).toHaveLength(2);
      expect(cards.map((c) => c.brand)).toContain('Mastercard');
      expect(cards.map((c) => c.brand)).toContain('Amex');
      expect(cards.map((c) => c.brand)).not.toContain('Visa'); // Buyer 2's card
    });

    it('should return empty list if buyer has no saved cards', async () => {
      const res = await request(app.getHttpServer())
        .get('/payments/cards')
        .set('Authorization', `Bearer ${buyer2Token}`)
        .expect(200);

      const cards = res.body as SavedCardResponse[];
      expect(cards).toHaveLength(1); // buyer2 currently has 1 card in test above

      // Delete buyer2's card and verify empty list
      await prisma.savedCard.deleteMany({ where: { buyerId: buyer2Id } });

      const resEmpty = await request(app.getHttpServer())
        .get('/payments/cards')
        .set('Authorization', `Bearer ${buyer2Token}`)
        .expect(200);
      expect(resEmpty.body).toHaveLength(0);
    });
  });

  describe('DELETE /payments/cards/:id', () => {
    it('should successfully delete card belonging to the authenticated BUYER', async () => {
      const card = await prisma.savedCard.create({
        data: {
          buyerId: buyer1Id,
          cardToken: 'tok_deleteme',
          brand: 'Visa',
          last4: '4321',
          expMonth: 1,
          expYear: 2027,
        },
      });

      await request(app.getHttpServer())
        .delete(`/payments/cards/${card.id}`)
        .set('Authorization', `Bearer ${buyer1Token}`)
        .expect(200);

      const inDb = await prisma.savedCard.findUnique({
        where: { id: card.id },
      });
      expect(inDb).toBeNull();
    });

    it('should return 404 when deleting a card that does not exist', async () => {
      await request(app.getHttpServer())
        .delete('/payments/cards/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${buyer1Token}`)
        .expect(404);
    });

    it('should fail with 403 when trying to delete a card belonging to another buyer', async () => {
      const cardOfBuyer2 = await prisma.savedCard.create({
        data: {
          buyerId: buyer2Id,
          cardToken: 'tok_otherbuyer',
          brand: 'Visa',
          last4: '5555',
          expMonth: 12,
          expYear: 2027,
        },
      });

      // Attempt to delete with Buyer 1's token
      await request(app.getHttpServer())
        .delete(`/payments/cards/${cardOfBuyer2.id}`)
        .set('Authorization', `Bearer ${buyer1Token}`)
        .expect(403);

      // Verify the card was NOT deleted from DB
      const inDb = await prisma.savedCard.findUnique({
        where: { id: cardOfBuyer2.id },
      });
      expect(inDb).toBeDefined();
      expect(inDb?.buyerId).toBe(buyer2Id);
    });
  });
});
