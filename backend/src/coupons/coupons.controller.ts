import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    role: Role;
  };
}

@Controller('coupons')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.VENDOR)
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post('validate')
  @Roles(Role.BUYER, Role.VENDOR)
  async validate(
    @Request() req: AuthenticatedRequest,
    @Body('code') code: string,
  ) {
    if (!code) {
      throw new BadRequestException('Promo code is required');
    }
    return this.couponsService.validateCouponForBuyer(req.user.id, code);
  }

  @Post()
  async create(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateCouponDto,
  ) {
    return this.couponsService.createCoupon(req.user.id, dto);
  }

  @Get()
  async findAll(@Request() req: AuthenticatedRequest) {
    return this.couponsService.getVendorCoupons(req.user.id);
  }

  @Patch(':id')
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateCouponDto,
  ) {
    return this.couponsService.updateCoupon(req.user.id, id, dto);
  }

  @Delete(':id')
  async remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.couponsService.deleteCoupon(req.user.id, id);
  }
}
