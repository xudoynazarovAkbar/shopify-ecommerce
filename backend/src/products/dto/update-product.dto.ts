import { IsOptional, IsString, IsNumber, Min, IsUUID } from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsUUID('4', { message: 'Category ID must be a valid UUID v4' })
  categoryId?: string;

  @IsOptional()
  @IsString({ message: 'Product name must be a string' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Product description must be a string' })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Product price must be a number' })
  @Min(0, { message: 'Product price cannot be negative' })
  price?: number;

  @IsOptional()
  @IsString({ message: 'Product image path/URL must be a string' })
  image?: string;
}
