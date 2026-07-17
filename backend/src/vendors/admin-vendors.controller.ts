import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { UpdateVendorStatusDto } from './dto/update-status.dto';
import { UpdateVendorTrustDto } from './dto/update-trust.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, VendorStatus } from '@prisma/client';

@Controller('admin/vendors')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminVendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  @Get()
  async listVendors(@Query('status') status?: VendorStatus) {
    return this.vendorsService.listVendors(status);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateVendorStatusDto: UpdateVendorStatusDto,
  ) {
    return this.vendorsService.updateStatus(id, updateVendorStatusDto.status);
  }

  @Patch(':id/trust')
  async updateTrust(
    @Param('id') id: string,
    @Body() updateVendorTrustDto: UpdateVendorTrustDto,
  ) {
    return this.vendorsService.updateTrust(
      id,
      updateVendorTrustDto.autoApproveProducts,
    );
  }
}
