import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { Role } from '@prisma/client';

export class RegisterDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsOptional()
  @IsEnum(Role, { message: 'Role must be BUYER, VENDOR, or ADMIN' })
  role?: Role;

  @ValidateIf((o: RegisterDto) => o.role === Role.VENDOR)
  @IsNotEmpty({ message: 'Shop name is required for vendor registration' })
  shopName?: string;

  @IsOptional()
  shopDescription?: string;
}
