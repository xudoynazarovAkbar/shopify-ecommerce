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

interface CategoryResponse {
  id: string;
  name: string;
  description?: string;
}

interface ProductResponse {
  id: string;
  name: string;
  status: string;
  price: number;
  description?: string;
}

describe('Categories & Products Moderation System (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let adminToken: string;

  let untrustedVendorToken: string;
  let untrustedVendorId: string; // vendor profile ID

  let trustedVendorToken: string;
  let trustedVendorId: string; // vendor profile ID

  let categoryId: string;

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

    // 2. Setup Untrusted Vendor (Registered, Approved status, but autoApproveProducts = false)
    const untrustedEmail = `untrusted_${Date.now()}@test.com`;
    await request(app.getHttpServer())
      .post('/vendors/register')
      .send({
        email: untrustedEmail,
        password: 'Password123',
        shopName: 'Untrusted Shop',
      })
      .expect(201);

    const untrustedUser = await prisma.user.findUnique({
      where: { email: untrustedEmail },
      include: { vendorProfile: true },
    });
    untrustedVendorId = untrustedUser!.vendorProfile!.id;

    // Approve vendor status
    await request(app.getHttpServer())
      .patch(`/admin/vendors/${untrustedVendorId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'APPROVED' })
      .expect(200);

    // Log in untrusted vendor
    const untrustedLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: untrustedEmail, password: 'Password123' })
      .expect(200);
    const untrustedLoginBody = untrustedLogin.body as LoginResponse;
    untrustedVendorToken = untrustedLoginBody.accessToken;

    // 3. Setup Trusted Vendor (Registered, Approved, autoApproveProducts = true)
    const trustedEmail = `trusted_${Date.now()}@test.com`;
    await request(app.getHttpServer())
      .post('/vendors/register')
      .send({
        email: trustedEmail,
        password: 'Password123',
        shopName: 'Trusted Shop',
      })
      .expect(201);

    const trustedUser = await prisma.user.findUnique({
      where: { email: trustedEmail },
      include: { vendorProfile: true },
    });
    trustedVendorId = trustedUser!.vendorProfile!.id;

    // Approve vendor status
    await request(app.getHttpServer())
      .patch(`/admin/vendors/${trustedVendorId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'APPROVED' })
      .expect(200);

    // Elevate to trusted (autoApproveProducts = true)
    await request(app.getHttpServer())
      .patch(`/admin/vendors/${trustedVendorId}/trust`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ autoApproveProducts: true })
      .expect(200);

    // Log in trusted vendor
    const trustedLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: trustedEmail, password: 'Password123' })
      .expect(200);
    const trustedLoginBody = trustedLogin.body as LoginResponse;
    trustedVendorToken = trustedLoginBody.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('1. Global Categories Administration', () => {
    const catName = `Electronics_${Date.now()}`;

    it('should allow Admin to create a category', async () => {
      const res = await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: catName,
          description: 'Electronic gadgets and devices',
        })
        .expect(201);

      const category = res.body as CategoryResponse;
      expect(category).toHaveProperty('id');
      expect(category.name).toBe(catName);
      categoryId = category.id;
    });

    it('should block Admin from creating a duplicate category', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: catName })
        .expect(409);
    });

    it('should block Non-Admin from creating a category', async () => {
      await request(app.getHttpServer())
        .post('/categories')
        .set('Authorization', `Bearer ${untrustedVendorToken}`)
        .send({ name: 'HackCat' })
        .expect(403);
    });

    it('should list all categories for anyone (public)', async () => {
      const res = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      const categories = res.body as CategoryResponse[];
      expect(Array.isArray(categories)).toBe(true);
      const found = categories.find((c) => c.id === categoryId);
      expect(found).toBeDefined();
      expect(found?.name).toBe(catName);
    });

    it('should allow Admin to update a category', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ description: 'Updated Description' })
        .expect(200);

      const category = res.body as CategoryResponse;
      expect(category.description).toBe('Updated Description');
    });

    it('should block Non-Admin from updating a category', async () => {
      await request(app.getHttpServer())
        .patch(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${untrustedVendorToken}`)
        .send({ description: 'Hack' })
        .expect(403);
    });
  });

  describe('2. Product Creation & Status Moderation', () => {
    let untrustedProductId: string;
    let trustedProductId: string;

    it('should require status PENDING_APPROVAL for product created by untrusted vendor', async () => {
      const res = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${untrustedVendorToken}`)
        .send({
          categoryId,
          name: 'Low Trust Gadget',
          price: 99.99,
          description: 'A generic device',
        })
        .expect(201);

      const product = res.body as ProductResponse;
      expect(product.status).toBe('PENDING_APPROVAL');
      untrustedProductId = product.id;

      // Verify DB
      const dbProduct = await prisma.product.findUnique({
        where: { id: untrustedProductId },
      });
      expect(dbProduct?.status).toBe('PENDING_APPROVAL');
    });

    it('should instantly APPROVE product created by trusted vendor', async () => {
      const res = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${trustedVendorToken}`)
        .send({
          categoryId,
          name: 'High Trust Gadget',
          price: 199.99,
          description: 'A premium device',
        })
        .expect(201);

      const product = res.body as ProductResponse;
      expect(product.status).toBe('APPROVED');
      trustedProductId = product.id;

      // Verify DB
      const dbProduct = await prisma.product.findUnique({
        where: { id: trustedProductId },
      });
      expect(dbProduct?.status).toBe('APPROVED');
    });

    it('should hide PENDING_APPROVAL products from public / buyers', async () => {
      // 1. Browse list
      const listRes = await request(app.getHttpServer())
        .get('/products')
        .expect(200);

      const products = listRes.body as ProductResponse[];
      const hasUntrusted = products.some((p) => p.id === untrustedProductId);
      const hasTrusted = products.some((p) => p.id === trustedProductId);

      expect(hasUntrusted).toBe(false);
      expect(hasTrusted).toBe(true);

      // 2. Fetch direct detail
      await request(app.getHttpServer())
        .get(`/products/${untrustedProductId}`)
        .expect(404);

      await request(app.getHttpServer())
        .get(`/products/${trustedProductId}`)
        .expect(200);
    });

    it('should allow vendor to fetch their own products regardless of status', async () => {
      const res = await request(app.getHttpServer())
        .get('/products/my-shop')
        .set('Authorization', `Bearer ${untrustedVendorToken}`)
        .expect(200);

      const products = res.body as ProductResponse[];
      const hasUntrusted = products.some((p) => p.id === untrustedProductId);
      expect(hasUntrusted).toBe(true);
    });
  });

  describe('3. Admin Moderation Queue & Operations', () => {
    let pendingProductId: string;

    beforeAll(async () => {
      // Create another product to moderating
      const res = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${untrustedVendorToken}`)
        .send({
          categoryId,
          name: 'Gadget To Moderating',
          price: 49.99,
        })
        .expect(201);
      const product = res.body as ProductResponse;
      pendingProductId = product.id;
    });

    it('should list all pending products for Admin review', async () => {
      const res = await request(app.getHttpServer())
        .get('/admin/products/pending')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const products = res.body as ProductResponse[];
      expect(Array.isArray(products)).toBe(true);
      const hasProduct = products.some((p) => p.id === pendingProductId);
      expect(hasProduct).toBe(true);
    });

    it('should allow Admin to approve a product', async () => {
      await request(app.getHttpServer())
        .patch(`/admin/products/${pendingProductId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'APPROVED' })
        .expect(200);

      // Verify product is now public
      await request(app.getHttpServer())
        .get(`/products/${pendingProductId}`)
        .expect(200);
    });

    it('should allow Admin to reject a product', async () => {
      // Create one more product
      const res = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${untrustedVendorToken}`)
        .send({
          categoryId,
          name: 'Spam Product',
          price: 5.0,
        })
        .expect(201);
      const product = res.body as ProductResponse;
      const spamId = product.id;

      await request(app.getHttpServer())
        .patch(`/admin/products/${spamId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'REJECTED' })
        .expect(200);

      // Verify not visible
      await request(app.getHttpServer()).get(`/products/${spamId}`).expect(404);
    });

    it('should block non-Admins from product moderation actions', async () => {
      await request(app.getHttpServer())
        .get('/admin/products/pending')
        .set('Authorization', `Bearer ${untrustedVendorToken}`)
        .expect(403);

      await request(app.getHttpServer())
        .patch(`/admin/products/${pendingProductId}/status`)
        .set('Authorization', `Bearer ${untrustedVendorToken}`)
        .send({ status: 'APPROVED' })
        .expect(403);
    });
  });

  describe('4. Product Updates & Deletion', () => {
    let prodId: string;

    beforeAll(async () => {
      // Create approved product as trusted vendor
      const res = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${trustedVendorToken}`)
        .send({
          categoryId,
          name: 'Deletable Product',
          price: 10.0,
        })
        .expect(201);
      const product = res.body as ProductResponse;
      prodId = product.id;
    });

    it('should block non-owners from updating or deleting product', async () => {
      // Untrusted vendor tries to update trusted vendor's product
      await request(app.getHttpServer())
        .patch(`/products/${prodId}`)
        .set('Authorization', `Bearer ${untrustedVendorToken}`)
        .send({ price: 15.0 })
        .expect(403);

      // Untrusted vendor tries to delete
      await request(app.getHttpServer())
        .delete(`/products/${prodId}`)
        .set('Authorization', `Bearer ${untrustedVendorToken}`)
        .expect(403);
    });

    it('should reset status to PENDING_APPROVAL upon product update by untrusted vendor', async () => {
      // Let's create an approved product first by admin approving it
      const res = await request(app.getHttpServer())
        .post('/products')
        .set('Authorization', `Bearer ${untrustedVendorToken}`)
        .send({
          categoryId,
          name: 'Approved Untrusted',
          price: 10.0,
        })
        .expect(201);
      const product = res.body as ProductResponse;
      const uId = product.id;

      // Admin approves it
      await request(app.getHttpServer())
        .patch(`/admin/products/${uId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'APPROVED' })
        .expect(200);

      // Verify approved
      await request(app.getHttpServer()).get(`/products/${uId}`).expect(200);

      // Untrusted vendor updates description
      await request(app.getHttpServer())
        .patch(`/products/${uId}`)
        .set('Authorization', `Bearer ${untrustedVendorToken}`)
        .send({ description: 'New description hack' })
        .expect(200);

      // Should be back to pending approval, hence hidden from public detail
      await request(app.getHttpServer()).get(`/products/${uId}`).expect(404);
    });

    it('should allow owner to delete their product', async () => {
      await request(app.getHttpServer())
        .delete(`/products/${prodId}`)
        .set('Authorization', `Bearer ${trustedVendorToken}`)
        .expect(200);

      // Verify no longer in db
      const product = await prisma.product.findUnique({
        where: { id: prodId },
      });
      expect(product).toBeDefined();
      expect(product?.isDeleted).toBe(true);
    });

    it('should block deletion of category if it contains products', async () => {
      await request(app.getHttpServer())
        .delete(`/categories/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(409);
    });
  });

  describe('5. Product Image Uploads', () => {
    it('should block unauthorized or anonymous file uploads', async () => {
      await request(app.getHttpServer())
        .post('/products/upload')
        .attach('file', Buffer.from('fake-image-data'), 'test.png')
        .expect(401);
    });

    it('should allow approved vendor to upload a product image', async () => {
      const res = await request(app.getHttpServer())
        .post('/products/upload')
        .set('Authorization', `Bearer ${trustedVendorToken}`)
        .attach('file', Buffer.from('fake-image-data'), 'test-image.png')
        .expect(201);

      expect(res.body).toHaveProperty('url');
      expect(res.body.url).toContain('/uploads/products/product-');
    });

    it('should allow admin to upload a product image', async () => {
      const res = await request(app.getHttpServer())
        .post('/products/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', Buffer.from('fake-image-data'), 'test-image.jpg')
        .expect(201);

      expect(res.body).toHaveProperty('url');
      expect(res.body.url).toContain('/uploads/products/product-');
    });

    it('should reject non-image file formats', async () => {
      await request(app.getHttpServer())
        .post('/products/upload')
        .set('Authorization', `Bearer ${trustedVendorToken}`)
        .attach('file', Buffer.from('plain-text-data'), 'malicious.txt')
        .expect(400);
    });
  });
});
