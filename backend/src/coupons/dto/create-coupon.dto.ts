import {
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsString,
  IsOptional,
  IsDateString,
  Min,
} from 'class-validator';
import { CouponDiscountType } from '@prisma/client';

export class CreateCouponDto {
  @IsNotEmpty({ message: 'Coupon code is required' })
  @IsString({ message: 'Coupon code must be a string' })
  code: string;

  @IsNotEmpty({ message: 'Discount type is required' })
  @IsEnum(CouponDiscountType, {
    message: 'Discount type must be PERCENTAGE or FLAT',
  })
  discountType: CouponDiscountType;

  @IsNotEmpty({ message: 'Discount value is required' })
  @IsNumber({}, { message: 'Discount value must be a number' })
  @Min(0, { message: 'Discount value must be at least 0' })
  discountValue: number;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Expiration date must be a valid ISO date string' },
  )
  expirationDate?: string;
}
