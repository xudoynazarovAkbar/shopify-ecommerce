import { Module } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { VendorsController } from './vendors.controller';
import { AdminVendorsController } from './admin-vendors.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [VendorsController, AdminVendorsController],
  providers: [VendorsService],
  exports: [VendorsService],
})
export class VendorsModule {}
