import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import express from 'express';
import { join } from 'path';
import fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ensure uploads directories exist on startup
  fs.mkdirSync(join(process.cwd(), 'uploads', 'products'), { recursive: true });
  fs.mkdirSync(join(process.cwd(), 'uploads', 'vendors'), { recursive: true });

  // Serve static assets from uploads directory
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  // Enable CORS with credentials support for cookies
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3002'],
    credentials: true,
  });

  // Enable cookie-parser middleware
  app.use(cookieParser());

  // Enable strict request validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap().catch((err) => {
  console.error('Error starting NestJS server:', err);
});
