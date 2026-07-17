import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
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

@Controller('cart')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.BUYER)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Request() req: AuthenticatedRequest) {
    return this.cartService.getCart(req.user.id);
  }

  @Post('items')
  addToCart(
    @Request() req: AuthenticatedRequest,
    @Body() addToCartDto: AddToCartDto,
  ) {
    return this.cartService.addToCart(req.user.id, addToCartDto);
  }

  @Patch('items/:id')
  updateCartItem(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(req.user.id, id, updateCartItemDto);
  }

  @Delete('items/:id')
  removeFromCart(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.cartService.removeFromCart(req.user.id, id);
  }

  @Delete()
  clearCart(@Request() req: AuthenticatedRequest) {
    return this.cartService.clearCart(req.user.id);
  }
}
