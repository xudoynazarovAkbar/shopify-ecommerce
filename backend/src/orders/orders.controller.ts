import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { CheckoutDto } from './dto/checkout.dto';
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

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  @Roles(Role.BUYER)
  checkout(@Request() req: AuthenticatedRequest, @Body() dto: CheckoutDto) {
    return this.ordersService.checkout(req.user.id, dto);
  }

  @Get('my-orders')
  @Roles(Role.BUYER)
  getBuyerOrders(@Request() req: AuthenticatedRequest) {
    return this.ordersService.getBuyerOrders(req.user.id);
  }

  @Get('vendor-orders')
  @Roles(Role.VENDOR)
  getVendorOrders(@Request() req: AuthenticatedRequest) {
    return this.ordersService.getVendorOrders(req.user.id);
  }

  @Patch(':id/status')
  @Roles(Role.VENDOR)
  updateOrderStatus(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(
      req.user.id,
      id,
      updateOrderStatusDto.status,
    );
  }
}
