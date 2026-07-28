import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Request,
  Query,
  Patch,
  Delete,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { RegisterVendorDto } from './dto/register-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
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

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR)
  @Patch('me')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads/vendors',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `vendor-${uniqueSuffix}${ext}`);
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
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  async updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() updateVendorDto: UpdateVendorDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      updateVendorDto.logo = `/uploads/vendors/${file.filename}`;
    }
    return this.vendorsService.updateProfile(req.user.id, updateVendorDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.VENDOR)
  @Delete('me')
  async deleteOwnStore(@Request() req: AuthenticatedRequest) {
    return this.vendorsService.deleteOwnStore(req.user.id);
  }

  @Get()
  async listApproved(@Query('categoryId') categoryId?: string) {
    return this.vendorsService.listApproved(categoryId);
  }

  @Get(':id')
  async getPublicProfile(@Param('id') id: string) {
    return this.vendorsService.getPublicProfile(id);
  }
}
