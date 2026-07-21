import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CheckoutDto {
  @IsOptional()
  @IsString({ message: 'Promo code must be a string' })
  promoCode?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Saved card ID must be a valid UUID v4' })
  savedCardId?: string;
}
