import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private pool: Pool;

  constructor() {
    let connectionString = process.env.DATABASE_URL;

    // Dynamically target a separate test database during E2E tests to preserve development data
    if (process.env.NODE_ENV === 'test' && connectionString) {
      try {
        const url = new URL(connectionString);
        if (!url.pathname.endsWith('_test')) {
          url.pathname = url.pathname + '_test';
        }
        connectionString = url.toString();
      } catch (err) {
        console.warn(
          'Failed to parse DATABASE_URL to append _test for E2E testing:',
          err,
        );
      }
    }

    const pool = new Pool({
      connectionString,
    });
    const adapter = new PrismaPg(pool);
    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
