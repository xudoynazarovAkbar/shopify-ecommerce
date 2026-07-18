import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { RegisterVendorDto } from './dto/register-vendor.dto';
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

@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Post('register')
  async register(@Body() registerVendorDto: RegisterVendorDto) {
    return this.vendorsService.register(registerVendorDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR)
  @Get('me')
  async getProfile(@Request() req: AuthenticatedRequest) {
    return this.vendorsService.getProfile(req.user.id);
  }

  @Get(':id')
  async getPublicProfile(@Param('id') id: string) {
    return this.vendorsService.getPublicProfile(id);
  }
}
