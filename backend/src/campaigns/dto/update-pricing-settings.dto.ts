import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdatePricingSettingsDto {
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceTier1?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceTier2?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceTier3?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceTier4?: number;
}
