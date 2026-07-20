import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

interface TestVendor {
  id: string;
  status: string;
  autoApproveProducts: boolean;
  shopName: string;
}

describe('Vendors System (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let adminToken: string;
  let registeredVendorToken: string;
  let registeredVendorId: string;

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

    // Get Admin Token (using seeded admin@shopify.com)
    const adminLoginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@shopify.com', password: 'Password123' })
      .expect(200);
    const adminLoginBody = adminLoginRes.body as { accessToken: string };
    adminToken = adminLoginBody.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('1. Vendor Registration', () => {
    it('should register a new vendor successfully with status PENDING', async () => {
      const email = `new_vendor_${Date.now()}@test.com`;
      const registerRes = await request(app.getHttpServer())
        .post('/vendors/register')
        .send({
          email,
          password: 'Password123',
          shopName: 'Super Cool Shop',
          shopDescription: 'An awesome shop selling gadgets.',
        })
        .expect(201);

      const registerBody = registerRes.body as {
        id: string;
        email: string;
        role: string;
      };
      expect(registerBody).toHaveProperty('id');
      expect(registerBody.email).toBe(email);
      expect(registerBody.role).toBe('VENDOR');

      // Verify vendor profile in DB is indeed PENDING
      const userWithProfile = await prisma.user.findUnique({
        where: { email },
        include: { vendorProfile: true },
      });
      expect(userWithProfile?.vendorProfile).toBeDefined();
      expect(userWithProfile?.vendorProfile?.shopName).toBe('Super Cool Shop');
      expect(userWithProfile?.vendorProfile?.status).toBe('PENDING');
      expect(userWithProfile?.vendorProfile?.autoApproveProducts).toBe(false);

      registeredVendorId = userWithProfile!.vendorProfile!.id;
    });

    it('should fail registration if email is invalid', async () => {
      await request(app.getHttpServer())
        .post('/vendors/register')
        .send({
          email: 'invalid-email',
          password: 'Password123',
          shopName: 'Some Shop',
        })
        .expect(400);
    });

    it('should fail registration if shopName is missing', async () => {
      await request(app.getHttpServer())
        .post('/vendors/register')
        .send({
          email: 'some_other_vendor@test.com',
          password: 'Password123',
        })
        .expect(400);
    });
  });

  describe('2. Vendor Login & Profile Access', () => {
    it('should prevent login if vendor is still PENDING approval', async () => {
      const email = `pending_vendor_${Date.now()}@test.com`;
      // Register
      await request(app.getHttpServer())
        .post('/vendors/register')
        .send({
          email,
          password: 'Password123',
          shopName: 'Pending Inc.',
        })
        .expect(201);

      // Attempt login
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'Password123' })
        .expect(401);

      const loginErrorBody = loginRes.body as { message: string };
      expect(loginErrorBody.message).toContain('pending');
    });

    it('should allow login once admin approves the vendor', async () => {
      const email = `to_approve_${Date.now()}@test.com`;
      // Register
      await request(app.getHttpServer())
        .post('/vendors/register')
        .send({
          email,
          password: 'Password123',
          shopName: 'To Approve Inc.',
        })
        .expect(201);

      const user = await prisma.user.findUnique({
        where: { email },
        include: { vendorProfile: true },
      });
      const vendorId = user!.vendorProfile!.id;

      // Admin approves the vendor
      await request(app.getHttpServer())
        .patch(`/admin/vendors/${vendorId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'APPROVED' })
        .expect(200);

      // Attempt login should now succeed
      const loginRes = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'Password123' })
        .expect(200);

      const vendorLoginBody = loginRes.body as { accessToken: string };
      expect(vendorLoginBody).toHaveProperty('accessToken');
      registeredVendorToken = vendorLoginBody.accessToken;
    });

    it('should allow approved vendor to retrieve their profile', async () => {
      const profileRes = await request(app.getHttpServer())
        .get('/vendors/me')
        .set('Authorization', `Bearer ${registeredVendorToken}`)
        .expect(200);

      const profileBody = profileRes.body as {
        id: string;
        shopName: string;
        status: string;
      };
      expect(profileBody).toHaveProperty('id');
      expect(profileBody.shopName).toContain('To Approve');
      expect(profileBody.status).toBe('APPROVED');
    });

    it('should reject profile access for unauthenticated requests', async () => {
      await request(app.getHttpServer()).get('/vendors/me').expect(401);
    });
  });

  describe('3. Admin Vendor Governance', () => {
    it('should list all vendors for Admin', async () => {
      const listRes = await request(app.getHttpServer())
        .get('/admin/vendors')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const listBody = listRes.body as unknown[];
      expect(Array.isArray(listBody)).toBe(true);
      expect(listBody.length).toBeGreaterThan(0);
    });

    it('should list only pending vendors when status=PENDING filter is used', async () => {
      const listRes = await request(app.getHttpServer())
        .get('/admin/vendors?status=PENDING')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const listPendingBody = listRes.body as TestVendor[];
      expect(Array.isArray(listPendingBody)).toBe(true);
      listPendingBody.forEach((vendor) => {
        expect(vendor.status).toBe('PENDING');
      });
    });

    it('should toggle trust flag (autoApproveProducts) for a vendor', async () => {
      // Check original trust flag
      const origVendor = await prisma.vendor.findUnique({
        where: { id: registeredVendorId },
      });
      expect(origVendor?.autoApproveProducts).toBe(false);

      // Update trust flag to true
      const trustRes = await request(app.getHttpServer())
        .patch(`/admin/vendors/${registeredVendorId}/trust`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ autoApproveProducts: true })
        .expect(200);

      const trustBody = trustRes.body as { autoApproveProducts: boolean };
      expect(trustBody.autoApproveProducts).toBe(true);

      // Verify in database
      const updatedVendor = await prisma.vendor.findUnique({
        where: { id: registeredVendorId },
      });
      expect(updatedVendor?.autoApproveProducts).toBe(true);
    });

    it('should reject trust update if user is not Admin', async () => {
      await request(app.getHttpServer())
        .patch(`/admin/vendors/${registeredVendorId}/trust`)
        .set('Authorization', `Bearer ${registeredVendorToken}`)
        .send({ autoApproveProducts: true })
        .expect(403);
    });
  });

  describe('4. Public Vendor Discovery & Filtering', () => {
    let testCategoryId: string;

    beforeAll(async () => {
      // Approve registeredVendorId first so it is APPROVED and visible
      await prisma.vendor.update({
        where: { id: registeredVendorId },
        data: { status: 'APPROVED' },
      });

      // Create a test category
      const category = await prisma.category.create({
        data: {
          name: `Test Vendor Filter Cat ${Date.now()}`,
          description: 'Used for testing vendor category filters',
        },
      });
      testCategoryId = category.id;

      // Create an approved product in this category for the registered vendor
      await prisma.product.create({
        data: {
          vendorId: registeredVendorId,
          categoryId: testCategoryId,
          name: 'Test Filterable Product',
          price: 9.99,
          status: 'APPROVED',
        },
      });
    });

    it('should list all approved vendors', async () => {
      const res = await request(app.getHttpServer())
        .get('/vendors')
        .expect(200);

      const vendors = res.body as TestVendor[];
      expect(Array.isArray(vendors)).toBe(true);
      const hasOurVendor = vendors.some((v) => v.id === registeredVendorId);
      expect(hasOurVendor).toBe(true);
    });

    it('should filter approved vendors by categoryId', async () => {
      // 1. Query with our test category id
      const resWithCat = await request(app.getHttpServer())
        .get(`/vendors?categoryId=${testCategoryId}`)
        .expect(200);

      const vendorsWithCat = resWithCat.body as TestVendor[];
      const hasOurVendor = vendorsWithCat.some((v) => v.id === registeredVendorId);
      expect(hasOurVendor).toBe(true);

      // 2. Query with a non-existent or empty category id (should not return our vendor since no products match)
      const emptyCat = await prisma.category.create({
        data: {
          name: `Empty Cat ${Date.now()}`,
        },
      });

      const resWithEmptyCat = await request(app.getHttpServer())
        .get(`/vendors?categoryId=${emptyCat.id}`)
        .expect(200);

      const vendorsWithEmptyCat = resWithEmptyCat.body as TestVendor[];
      const hasOurVendorInEmpty = vendorsWithEmptyCat.some((v) => v.id === registeredVendorId);
      expect(hasOurVendorInEmpty).toBe(false);
    });
  });
});
