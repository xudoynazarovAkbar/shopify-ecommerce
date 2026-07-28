import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Role, VendorStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // 1. Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }

    // 2. Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    // 3. Create user and related entities inside a transaction
    return this.prisma.$transaction(async (tx) => {
      const userRole = dto.role || Role.BUYER;

      const user = await tx.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          role: userRole,
        },
      });

      // If user is registering as VENDOR, create their PENDING Vendor Profile
      if (userRole === Role.VENDOR) {
        await tx.vendor.create({
          data: {
            userId: user.id,
            shopName: dto.shopName!,
            shopDescription: dto.shopDescription,
            logo: dto.logo,
            status: VendorStatus.PENDING,
            autoApproveProducts: false,
          },
        });
      }

      // If user is registering as BUYER, initialize an empty cart for them
      if (userRole === Role.BUYER) {
        await tx.cart.create({
          data: {
            buyerId: user.id,
          },
        });
      }

      // Return user without password or refresh token hash
      return exclude(user, ['password', 'hashedRefreshToken']);
    });
  }

  generateTokens(userId: string, role: Role) {
    const payload = { sub: userId, role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    return { accessToken, refreshToken };
  }

  async login(dto: LoginDto) {
    // 1. Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: {
        vendorProfile: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 2. Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 3. Check vendor status if they are logging in as a vendor
    if (
      user.role === Role.VENDOR &&
      user.vendorProfile?.status !== VendorStatus.APPROVED
    ) {
      throw new UnauthorizedException(
        `Your vendor account status is currently ${user.vendorProfile?.status.toLowerCase()}. Please contact an administrator.`,
      );
    }

    // 4. Generate access and refresh tokens
    const { accessToken, refreshToken } = this.generateTokens(
      user.id,
      user.role,
    );

    // 5. Hash and store the refresh token
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: user.id },
      data: { hashedRefreshToken },
    });

    // Return token and user details (sans password and hashedRefreshToken)
    return {
      accessToken,
      refreshToken,
      user: exclude(user, ['password', 'hashedRefreshToken']),
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<{ sub: string; role: Role }>(
        refreshToken,
      );
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.hashedRefreshToken) {
        throw new UnauthorizedException('Access Denied');
      }

      // Verify stored hash matches
      const isMatch = await bcrypt.compare(
        refreshToken,
        user.hashedRefreshToken,
      );
      if (!isMatch) {
        throw new UnauthorizedException('Access Denied');
      }

      const tokens = this.generateTokens(user.id, user.role);
      const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);

      await this.prisma.user.update({
        where: { id: user.id },
        data: { hashedRefreshToken },
      });

      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(refreshToken: string) {
    try {
      const payload = this.jwtService.verify<{ sub: string; role: Role }>(
        refreshToken,
      );
      await this.prisma.user.update({
        where: { id: payload.sub },
        data: { hashedRefreshToken: null },
      });
    } catch {
      // Ignore invalid token on logout
    }
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        vendorProfile: true,
        cart: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return exclude(user, ['password', 'hashedRefreshToken']);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException('Current password does not match');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(dto.newPassword, saltRounds);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { success: true };
  }
}

function exclude<User, Key extends keyof User>(
  user: User,
  keys: Key[],
): Omit<User, Key> {
  const clone = { ...user };
  for (const key of keys) {
    delete clone[key];
  }
  return clone;
}
