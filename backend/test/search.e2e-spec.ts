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
}

interface SearchResponse {
  products: { id: string; name: string }[];
  vendors: { id: string; shopName: string }[];
}

describe('Omnipresent Index Search (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let adminToken: string;

  let vendorAToken: string;
  let vendorAId: string; // Burger Palace

  let vendorBToken: string;
  let vendorBId: string; // Pizza Paradise

  let vendorCId: string; // Sushi Place (unapproved)

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
    adminToken = (adminLoginRes.body as LoginResponse).accessToken;

    // 2. Create a Category
    const categoryRes = await request(app.getHttpServer())
      .post('/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `SearchCategory_${Date.now()}`,
        description: 'Category for testing search',
      })
      .expect(201);
    categoryId = (categoryRes.body as CategoryResponse).id;

    // 3. Register Vendor A ("Burger Palace")
    const emailA = `vendor_a_${Date.now()}@test.com`;
    await request(app.getHttpServer())
      .post('/vendors/register')
      .send({
        email: emailA,
        password: 'Password123',
        shopName: 'Burger Palace',
        shopDescription: 'The best burgers in town',
      })
      .expect(201);

    const userA = await prisma.user.findUnique({
      where: { email: emailA },
      include: { vendorProfile: true },
    });
    vendorAId = userA!.vendorProfile!.id;

    // Approve Vendor A
    await request(app.getHttpServer())
      .patch(`/admin/vendors/${vendorAId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'APPROVED' })
      .expect(200);

    // Give Vendor A trust (auto approve products)
    await request(app.getHttpServer())
      .patch(`/admin/vendors/${vendorAId}/trust`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ autoApproveProducts: true })
      .expect(200);

    // Login Vendor A
    const loginARes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: emailA, password: 'Password123' })
      .expect(200);
    vendorAToken = (loginARes.body as LoginResponse).accessToken;

    // 4. Register Vendor B ("Pizza Paradise")
    const emailB = `vendor_b_${Date.now()}@test.com`;
    await request(app.getHttpServer())
      .post('/vendors/register')
      .send({
        email: emailB,
        password: 'Password123',
        shopName: 'Pizza Paradise',
        shopDescription: 'Delicious cheesy pizzas',
      })
      .expect(201);

    const userB = await prisma.user.findUnique({
      where: { email: emailB },
      include: { vendorProfile: true },
    });
    vendorBId = userB!.vendorProfile!.id;

    // Approve Vendor B
    await request(app.getHttpServer())
      .patch(`/admin/vendors/${vendorBId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'APPROVED' })
      .expect(200);

    // Give Vendor B trust (auto approve products)
    await request(app.getHttpServer())
      .patch(`/admin/vendors/${vendorBId}/trust`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ autoApproveProducts: true })
      .expect(200);

    // Login Vendor B
    const loginBRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: emailB, password: 'Password123' })
      .expect(200);
    vendorBToken = (loginBRes.body as LoginResponse).accessToken;

    // 5. Register Vendor C ("Sushi Place" - Unapproved status)
    const emailC = `vendor_c_${Date.now()}@test.com`;
    await request(app.getHttpServer())
      .post('/vendors/register')
      .send({
        email: emailC,
        password: 'Password123',
        shopName: 'Sushi Place',
        shopDescription: 'Fresh sushi rolls',
      })
      .expect(201);

    const userC = await prisma.user.findUnique({
      where: { email: emailC },
      include: { vendorProfile: true },
    });
    vendorCId = userC!.vendorProfile!.id;

    // 6. Create Products
    // Product 1: "Beef Cheeseburger" (Vendor A - Trusted -> Automatically APPROVED)
    await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${vendorAToken}`)
      .send({
        categoryId,
        name: 'Beef Cheeseburger',
        description: 'Classic beef burger with cheese',
        price: 9.99,
      })
      .expect(201);

    // Product 2: "Spicy Chicken Burger" (Vendor A - Trusted -> Automatically APPROVED, but we manually change it to PENDING_APPROVAL via prisma to simulate moderation queue)
    const chickenBurgerRes = await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${vendorAToken}`)
      .send({
        categoryId,
        name: 'Spicy Chicken Burger',
        description: 'Crispy chicken with spicy sauce',
        price: 10.99,
      })
      .expect(201);

    const chickenBurgerId = (chickenBurgerRes.body as { id: string }).id;
    await prisma.product.update({
      where: { id: chickenBurgerId },
      data: { status: 'PENDING_APPROVAL' },
    });

    // Product 3: "Pepperoni Pizza" (Vendor B - Trusted -> Automatically APPROVED)
    await request(app.getHttpServer())
      .post('/products')
      .set('Authorization', `Bearer ${vendorBToken}`)
      .send({
        categoryId,
        name: 'Pepperoni Pizza',
        description: 'Double pepperoni and mozzarella',
        price: 14.99,
      })
      .expect(201);

    // Product 4: "Salmon Sushi" (Vendor C - Untrusted and Unapproved Vendor. Create via Prisma to force it to have APPROVED status)
    await prisma.product.create({
      data: {
        vendorId: vendorCId,
        categoryId,
        name: 'Salmon Sushi',
        description: 'Fresh salmon nigiri',
        price: 12.99,
        status: 'APPROVED',
      },
    });
  });

  afterAll(async () => {
    // Cleanup generated data
    await prisma.$transaction([
      prisma.cartItem.deleteMany(),
      prisma.cart.deleteMany(),
      prisma.orderItem.deleteMany(),
      prisma.order.deleteMany(),
      prisma.review.deleteMany(),
      prisma.coupon.deleteMany(),
      prisma.savedCard.deleteMany(),
      prisma.product.deleteMany({
        where: { categoryId },
      }),
      prisma.category.deleteMany({
        where: { id: categoryId },
      }),
      prisma.vendor.deleteMany({
        where: { id: { in: [vendorAId, vendorBId, vendorCId] } },
      }),
      prisma.user.deleteMany({
        where: {
          email: {
            in: [`vendor_a_`, `vendor_b_`, `vendor_c_`].map(
              (prefix) => `${prefix}`,
            ), // Wait, those emails have dynamically generated timestamps, we can find them or delete them by vendor ids.
          },
        },
      }),
    ]);

    // Let's do exact cleanup of those 3 users
    await prisma.user.deleteMany({
      where: {
        vendorProfile: {
          id: { in: [vendorAId, vendorBId, vendorCId] },
        },
      },
    });

    await app.close();
  });

  it('should return empty lists if search query is empty', async () => {
    const res = await request(app.getHttpServer()).get('/search').expect(200);

    expect(res.body).toEqual({
      products: [],
      vendors: [],
    });

    const resEmptyQuery = await request(app.getHttpServer())
      .get('/search?q=')
      .expect(200);

    expect(resEmptyQuery.body).toEqual({
      products: [],
      vendors: [],
    });
  });

  it('should fuzzy match products and vendors on query (case-insensitive)', async () => {
    const res = await request(app.getHttpServer())
      .get('/search?q=burger')
      .expect(200);

    const body = res.body as SearchResponse;
    expect(body.products).toHaveLength(1);
    expect(body.products[0].name).toBe('Beef Cheeseburger');
    expect(body.vendors).toHaveLength(1);
    expect(body.vendors[0].shopName).toBe('Burger Palace');

    // Case insensitive check
    const resUpper = await request(app.getHttpServer())
      .get('/search?q=BURGER')
      .expect(200);

    const bodyUpper = resUpper.body as SearchResponse;
    expect(bodyUpper.products).toHaveLength(1);
    expect(bodyUpper.products[0].name).toBe('Beef Cheeseburger');
    expect(bodyUpper.vendors).toHaveLength(1);
    expect(bodyUpper.vendors[0].shopName).toBe('Burger Palace');
  });

  it('should only return approved products and vendors', async () => {
    // 1. "Spicy Chicken Burger" is PENDING_APPROVAL. Search "chicken" should return nothing.
    const resChicken = await request(app.getHttpServer())
      .get('/search?q=chicken')
      .expect(200);

    const bodyChicken = resChicken.body as SearchResponse;
    expect(bodyChicken.products).toHaveLength(0);

    // 2. Vendor C "Sushi Place" is PENDING (unapproved).
    // Even though "Salmon Sushi" is APPROVED (manually forced in database), it must not be visible because its vendor is not APPROVED.
    const resSushi = await request(app.getHttpServer())
      .get('/search?q=sushi')
      .expect(200);

    const bodySushi = resSushi.body as SearchResponse;
    expect(bodySushi.products).toHaveLength(0);
    expect(bodySushi.vendors).toHaveLength(0);
  });

  it('should return pizza products and vendors when searching "pizza"', async () => {
    const res = await request(app.getHttpServer())
      .get('/search?q=pizza')
      .expect(200);

    const body = res.body as SearchResponse;
    expect(body.products).toHaveLength(1);
    expect(body.products[0].name).toBe('Pepperoni Pizza');
    expect(body.vendors).toHaveLength(1);
    expect(body.vendors[0].shopName).toBe('Pizza Paradise');
  });
});
