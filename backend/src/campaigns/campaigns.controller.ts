import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Param,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdatePricingSettingsDto } from './dto/update-pricing-settings.dto';
import { EditCampaignDto } from './dto/edit-campaign.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, AdCampaignStatus } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    role: Role;
  };
}

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get('pricing-settings')
  getPricingSettings() {
    return this.campaignsService.getPricingSettings();
  }

  @Patch('pricing-settings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updatePricingSettings(@Body() dto: UpdatePricingSettingsDto) {
    return this.campaignsService.updatePricingSettings(dto);
  }

  @Get('active')
  getActiveCampaigns() {
    return this.campaignsService.getActiveCampaigns();
  }

  @Get('vendor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR)
  getVendorCampaigns(@Request() req: AuthenticatedRequest) {
    return this.campaignsService.getVendorCampaigns(req.user.id);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getAllCampaigns() {
    return this.campaignsService.getAllCampaigns();
  }

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `campaign-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return callback(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  createCampaign(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreateCampaignDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Creative slide image file is required');
    }

    // Since our static assets are served from '/uploads', and this file is in './uploads/products/campaign-...',
    // the static path is '/uploads/products/campaign-...'
    const imagePath = `/uploads/products/${file.filename}`;
    return this.campaignsService.createCampaign(req.user.id, dto, imagePath);
  }

  @Post(':id/checkout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR)
  checkoutCampaign(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ) {
    return this.campaignsService.checkoutCampaign(req.user.id, id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateCampaignStatus(
    @Param('id') id: string,
    @Body('status') status: AdCampaignStatus,
  ) {
    if (!status) {
      throw new BadRequestException('Status is required');
    }
    return this.campaignsService.updateCampaignStatus(id, status);
  }

  @Patch(':id/active')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  toggleCampaignActive(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    if (isActive === undefined) {
      throw new BadRequestException('isActive is required');
    }
    return this.campaignsService.toggleCampaignActive(id, isActive);
  }

  @Patch('vendor/:id/pause')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR)
  vendorTogglePause(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body('isVendorPaused') isVendorPaused: boolean,
  ) {
    if (isVendorPaused === undefined) {
      throw new BadRequestException('isVendorPaused is required');
    }
    return this.campaignsService.vendorTogglePause(
      req.user.id,
      id,
      isVendorPaused,
    );
  }

  @Patch('vendor/:id/edit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `campaign-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return callback(
            new BadRequestException('Only image files are allowed!'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  vendorEditCampaign(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: EditCampaignDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const imagePath = file ? `/uploads/products/${file.filename}` : undefined;
    return this.campaignsService.vendorEditCampaign(
      req.user.id,
      id,
      dto,
      imagePath,
    );
  }
}
