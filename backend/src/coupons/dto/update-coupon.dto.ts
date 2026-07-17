import { IsOptional, IsBoolean, IsDateString } from 'class-validator';

export class UpdateCouponDto {
  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean' })
  isActive?: boolean;

  @IsOptional()
  @IsDateString(
    {},
    { message: 'Expiration date must be a valid ISO date string' },
  )
  expirationDate?: string;
}
