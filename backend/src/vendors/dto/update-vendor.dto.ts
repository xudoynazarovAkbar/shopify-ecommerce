import { IsNotEmpty, MinLength, IsOptional, IsString } from 'class-validator';

export class UpdateVendorDto {
  @IsNotEmpty({ message: 'Shop name is required' })
  @IsString({ message: 'Shop name must be a string' })
  shopName: string;

  @IsNotEmpty({ message: 'Shop description is required' })
  @IsString({ message: 'Shop description must be a string' })
  @MinLength(10, {
    message: 'Shop description must be at least 10 characters long',
  })
  shopDescription: string;

  @IsOptional()
  @IsString({ message: 'Logo must be a string' })
  logo?: string;
}
