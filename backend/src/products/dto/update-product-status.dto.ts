import { IsEnum, IsNotEmpty } from 'class-validator';
import { ProductStatus } from '@prisma/client';

export class UpdateProductStatusDto {
  @IsNotEmpty({ message: 'Product status is required' })
  @IsEnum(ProductStatus, {
    message: 'Product status must be APPROVED or REJECTED',
  })
  status: ProductStatus;
}
