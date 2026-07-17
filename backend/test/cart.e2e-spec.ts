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

interface CartItemResponse {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    vendorId: string;
  };
}

interface CartResponse {
  id: string;
  buyerId: string;
  vendorId: string | null;
  items: CartItemResponse[];
  subtotal: number;
  tax: number;
  deliveryFee: number;
  total: number;
}

describe('Scoped Cart Engine System (e2e)', () => {
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
    const buyerEmail = `buyer_${Date.now()}@test.com`;
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

    // 3. Setup Vendor A (autoApproveProducts = true)
    const vendorAEmail = `vendor_a_${Date.now()}@test.com`;
    await request(app.getHttpServer())
      .post('/vendors/register')
      .send({
        email: vendorAEmail,
        password: 'Password123',
        shopName: 'Vendor A Shop',
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

    // 4. Setup Vendor B (autoApproveProducts = true)
    const vendorBEmail = `vendor_b_${Date.now()}@test.com`;
    await request(app.getHttpServer())
      .post('/vendors/register')
      .send({
        email: vendorBEmail,
        password: 'Password123',
        shopName: 'Vendor B Shop',
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
        name: `Food_${Date.now()}`,
        description: 'Delicious food items',
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
    const prodBRes = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${vendorBToken}`)
      .send({
        categoryId,
        name: 'Pizza',
        price: 12.0,
        description: 'Cheesy pepperoni pizza',
      })
      .expect(201);
    productBId = (prodBRes.body as { id: string }).id;
  });

  afterAll(async () => {
    // Cleanup with proper dependency order to avoid foreign key violations
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
    // Exclude the admin user so we do not delete seeds required by other tests
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

  describe('GET /cart', () => {
    it('should return an empty cart with default calculations', async () => {
      const res = await request(app.getHttpServer())
        .get('/cart')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      const cart = res.body as CartResponse;
      expect(cart).toBeDefined();
      expect(cart.buyerId).toBe(buyerId);
      expect(cart.vendorId).toBeNull();
      expect(cart.items).toHaveLength(0);
      expect(cart.subtotal).toBe(0);
      expect(cart.tax).toBe(0);
      expect(cart.deliveryFee).toBe(0);
      expect(cart.total).toBe(0);
    });

    it('should block unauthenticated requests', async () => {
      await request(app.getHttpServer()).get('/cart').expect(401);
    });

    it('should block non-buyer (e.g. vendor) requests', async () => {
      await request(app.getHttpServer())
        .get('/cart')
        .set('Authorization', `Bearer ${vendorAToken}`)
        .expect(403);
    });
  });

  describe('POST /cart/items', () => {
    it('should add a product to the cart and associate vendorId', async () => {
      const res = await request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          productId: productA1Id,
          quantity: 2,
        })
        .expect(201);

      const cart = res.body as CartResponse;
      expect(cart.vendorId).toBe(vendorAId);
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].productId).toBe(productA1Id);
      expect(cart.items[0].quantity).toBe(2);

      // Calculations: subtotal = 2 * 10 = 20, tax = 2, delivery = 5, total = 27
      expect(cart.subtotal).toBe(20.0);
      expect(cart.tax).toBe(2.0);
      expect(cart.deliveryFee).toBe(5.0);
      expect(cart.total).toBe(27.0);
    });

    it('should increment quantity when adding the same product again', async () => {
      const res = await request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          productId: productA1Id,
          quantity: 1,
        })
        .expect(201);

      const cart = res.body as CartResponse;
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(3);

      // Calculations: subtotal = 3 * 10 = 30, tax = 3, delivery = 5, total = 38
      expect(cart.subtotal).toBe(30.0);
      expect(cart.tax).toBe(3.0);
      expect(cart.deliveryFee).toBe(5.0);
      expect(cart.total).toBe(38.0);
    });

    it('should permit adding another product from the same vendor', async () => {
      const res = await request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          productId: productA2Id,
          quantity: 2,
        })
        .expect(201);

      const cart = res.body as CartResponse;
      expect(cart.items).toHaveLength(2);

      // Calculations: subtotal = (3 * 10) + (2 * 5) = 40, tax = 4, delivery = 5, total = 49
      expect(cart.subtotal).toBe(40.0);
      expect(cart.tax).toBe(4.0);
      expect(cart.deliveryFee).toBe(5.0);
      expect(cart.total).toBe(49.0);
    });

    it('should enforce the single-vendor rule and throw 400 error on mismatch', async () => {
      const res = await request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          productId: productBId,
          quantity: 1,
        })
        .expect(400);

      expect((res.body as { message: string }).message).toContain(
        'A buyer can only add products from one specific shop or restaurant at a time',
      );
    });
  });

  describe('PATCH /cart/items/:id', () => {
    it('should update the quantity of a cart item', async () => {
      // First get current cart to retrieve cartItem id
      const cartRes = await request(app.getHttpServer())
        .get('/cart')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      const cartItem = (cartRes.body as CartResponse).items.find(
        (item) => item.productId === productA2Id,
      );
      expect(cartItem).toBeDefined();

      const res = await request(app.getHttpServer())
        .patch(`/cart/items/${cartItem!.id}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          quantity: 4,
        })
        .expect(200);

      const cart = res.body as CartResponse;
      const updatedItem = cart.items.find(
        (item) => item.productId === productA2Id,
      );
      expect(updatedItem?.quantity).toBe(4);

      // Calculations: subtotal = (3 * 10) + (4 * 5) = 50, tax = 5, delivery = 5, total = 60
      expect(cart.subtotal).toBe(50.0);
      expect(cart.tax).toBe(5.0);
      expect(cart.deliveryFee).toBe(5.0);
      expect(cart.total).toBe(60.0);
    });
  });

  describe('DELETE /cart/items/:id', () => {
    it('should remove a single item and update the cart', async () => {
      const cartRes = await request(app.getHttpServer())
        .get('/cart')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      const cartItem = (cartRes.body as CartResponse).items.find(
        (item) => item.productId === productA2Id,
      );

      const res = await request(app.getHttpServer())
        .delete(`/cart/items/${cartItem!.id}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      const cart = res.body as CartResponse;
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].productId).toBe(productA1Id);

      // Calculations: subtotal = 3 * 10 = 30, tax = 3, delivery = 5, total = 38
      expect(cart.subtotal).toBe(30.0);
    });

    it('should reset vendorId when last item is removed', async () => {
      const cartRes = await request(app.getHttpServer())
        .get('/cart')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      const cartItem = (cartRes.body as CartResponse).items[0];

      const res = await request(app.getHttpServer())
        .delete(`/cart/items/${cartItem.id}`)
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      const cart = res.body as CartResponse;
      expect(cart.items).toHaveLength(0);
      expect(cart.vendorId).toBeNull();
      expect(cart.total).toBe(0.0);
    });
  });

  describe('DELETE /cart', () => {
    beforeEach(async () => {
      // Setup: Add an item before clearing
      await request(app.getHttpServer())
        .post('/cart/items')
        .set('Authorization', `Bearer ${buyerToken}`)
        .send({
          productId: productA1Id,
          quantity: 2,
        })
        .expect(201);
    });

    it('should clear all items and reset vendorId', async () => {
      const res = await request(app.getHttpServer())
        .delete('/cart')
        .set('Authorization', `Bearer ${buyerToken}`)
        .expect(200);

      const cart = res.body as CartResponse;
      expect(cart.items).toHaveLength(0);
      expect(cart.vendorId).toBeNull();
      expect(cart.subtotal).toBe(0.0);
      expect(cart.total).toBe(0.0);
    });
  });
});
