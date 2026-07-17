import { IsEmail, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class RegisterVendorDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @IsNotEmpty({ message: 'Shop name is required' })
  shopName: string;

  @IsOptional()
  shopDescription?: string;
}
