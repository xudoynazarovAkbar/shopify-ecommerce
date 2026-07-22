import { IsString, IsOptional } from 'class-validator';

export class EditCampaignDto {
  @IsString()
  @IsOptional()
  label?: string;

  @IsString()
  @IsOptional()
  labelColor?: string;
}
