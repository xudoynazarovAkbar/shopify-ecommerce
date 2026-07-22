import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  startDate: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationWeeks: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4)
  tier: number;

  @IsString()
  @IsOptional()
  label?: string;

  @IsString()
  @IsOptional()
  labelColor?: string;
}
