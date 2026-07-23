import {
  Controller,
  Get,
  Patch,
  Body,
  Query,
  UseGuards,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { IsNumber, Min, Max } from 'class-validator';

interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    role: Role;
  };
}

class UpdateCommissionRateDto {
  @IsNumber()
  @Min(0)
  @Max(1)
  commissionRate: number;
}

@Controller('stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('settings')
  async getSettings() {
    return this.statsService.getSettings();
  }

  @Patch('settings')
  async updateSettings(@Body() dto: UpdateCommissionRateDto) {
    return this.statsService.updateSettings(dto.commissionRate);
  }

  @Get('revenue')
  async getRevenueStats(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException(
        'startDate and endDate query parameters are required.',
      );
    }

    const start = Date.parse(startDate);
    const end = Date.parse(endDate);

    if (isNaN(start) || isNaN(end)) {
      throw new BadRequestException(
        'Invalid date format for startDate or endDate.',
      );
    }

    if (start > end) {
      throw new BadRequestException('startDate cannot be after endDate.');
    }

    return this.statsService.getRevenueStats(startDate, endDate);
  }

  @Get('vendor/income')
  @Roles(Role.VENDOR)
  async getVendorIncomeStats(
    @Request() req: AuthenticatedRequest,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException(
        'startDate and endDate query parameters are required.',
      );
    }

    const start = Date.parse(startDate);
    const end = Date.parse(endDate);

    if (isNaN(start) || isNaN(end)) {
      throw new BadRequestException(
        'Invalid date format for startDate or endDate.',
      );
    }

    if (start > end) {
      throw new BadRequestException('startDate cannot be after endDate.');
    }

    return this.statsService.getVendorIncomeStats(
      req.user.id,
      startDate,
      endDate,
    );
  }

  @Get('vendor/products')
  @Roles(Role.VENDOR)
  async getVendorProductSalesStats(
    @Request() req: AuthenticatedRequest,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException(
        'startDate and endDate query parameters are required.',
      );
    }

    const start = Date.parse(startDate);
    const end = Date.parse(endDate);

    if (isNaN(start) || isNaN(end)) {
      throw new BadRequestException(
        'Invalid date format for startDate or endDate.',
      );
    }

    if (start > end) {
      throw new BadRequestException('startDate cannot be after endDate.');
    }

    return this.statsService.getVendorProductSalesStats(
      req.user.id,
      startDate,
      endDate,
    );
  }

  @Get('buyer/spendings')
  @Roles(Role.BUYER)
  async getBuyerSpendingsStats(
    @Request() req: AuthenticatedRequest,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException(
        'startDate and endDate query parameters are required.',
      );
    }

    const start = Date.parse(startDate);
    const end = Date.parse(endDate);

    if (isNaN(start) || isNaN(end)) {
      throw new BadRequestException(
        'Invalid date format for startDate or endDate.',
      );
    }

    if (start > end) {
      throw new BadRequestException('startDate cannot be after endDate.');
    }

    return this.statsService.getBuyerSpendingsStats(
      req.user.id,
      startDate,
      endDate,
    );
  }
}
