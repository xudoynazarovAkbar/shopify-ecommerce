import { IsOptional, IsString } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString({ message: 'Category name must be a string' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Category description must be a string' })
  description?: string;
}
