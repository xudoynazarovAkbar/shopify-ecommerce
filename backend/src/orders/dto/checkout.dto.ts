import { IsOptional, IsString } from 'class-validator';

export class CheckoutDto {
  @IsOptional()
  @IsString({ message: 'Promo code must be a string' })
  promoCode?: string;
}
