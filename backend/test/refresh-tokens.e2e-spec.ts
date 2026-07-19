import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import cookieParser from 'cookie-parser';

describe('Auth Refresh Tokens and Cookies (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  const testEmail = `refresh_test_${Date.now()}@test.com`;
  const testPassword = 'Password123';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
    prisma = app.get<PrismaService>(PrismaService);

    // Clean up if previous tests failed
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: testEmail },
    });
    await app.close();
  });

  it('should register a new buyer user', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        role: 'BUYER',
      })
      .expect(201);

    expect(res.body.email).toBe(testEmail);
    expect(res.body.password).toBeUndefined();
    expect(res.body.hashedRefreshToken).toBeUndefined();
  });

  it('should login, return an accessToken and set a secure HttpOnly refresh_token cookie', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      })
      .expect(200);

    expect(res.body.accessToken).toBeDefined();
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(testEmail);
    expect(res.body.user.password).toBeUndefined();
    expect(res.body.user.hashedRefreshToken).toBeUndefined();

    // Verify Set-Cookie header contains refresh_token
    const cookies = res.headers['set-cookie'] as string[];
    expect(cookies).toBeDefined();

    const refreshCookie = cookies.find((c) => c.startsWith('refresh_token='));
    expect(refreshCookie).toBeDefined();
    expect(refreshCookie).toContain('HttpOnly');
  });

  it('should refresh the tokens and return a new accessToken using the refresh cookie', async () => {
    // 1. Perform login to get the cookie
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      })
      .expect(200);

    const cookies = loginRes.headers['set-cookie'] as string[];
    const originalAccessToken = loginRes.body.accessToken;

    // 2. Call refresh endpoint using the cookie
    const refreshRes = await request(app.getHttpServer())
      .post('/auth/refresh')
      .set('Cookie', cookies)
      .expect(200);

    expect(refreshRes.body.accessToken).toBeDefined();

    const newCookies = refreshRes.headers['set-cookie'] as string[];
    expect(newCookies).toBeDefined();
    const rotatedCookie = newCookies.find((c) =>
      c.startsWith('refresh_token='),
    );
    expect(rotatedCookie).toBeDefined();
  });

  it('should reject refresh requests if the cookie is missing', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/refresh')
      .expect(401);

    expect(res.body.message).toContain('Refresh token missing');
  });

  it('should logout and clear the refresh token from database and clear the cookie', async () => {
    // 1. Perform login to get the cookie
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      })
      .expect(200);

    const cookies = loginRes.headers['set-cookie'] as string[];

    // Verify hashedRefreshToken is stored in DB
    const userWithToken = await prisma.user.findUnique({
      where: { email: testEmail },
    });
    expect(userWithToken?.hashedRefreshToken).toBeDefined();
    expect(userWithToken?.hashedRefreshToken).not.toBeNull();

    // 2. Logout
    const logoutRes = await request(app.getHttpServer())
      .post('/auth/logout')
      .set('Cookie', cookies)
      .expect(200);

    expect(logoutRes.body.success).toBe(true);

    // Verify hashedRefreshToken is set to null in DB
    const userAfterLogout = await prisma.user.findUnique({
      where: { email: testEmail },
    });
    expect(userAfterLogout?.hashedRefreshToken).toBeNull();

    // Verify Set-Cookie header clears the cookie (Max-Age=0 or Expires in past)
    const logoutCookies = logoutRes.headers['set-cookie'] as string[];
    const clearedCookie = logoutCookies.find((c) =>
      c.startsWith('refresh_token='),
    );
    expect(clearedCookie).toBeDefined();
    expect(clearedCookie).toMatch(/Max-Age=0|Expires=Thu, 01 Jan 1970/);
  });
});
