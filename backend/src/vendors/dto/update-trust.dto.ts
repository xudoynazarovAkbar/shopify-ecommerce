import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateVendorTrustDto {
  @IsNotEmpty({ message: 'autoApproveProducts is required' })
  @IsBoolean({ message: 'autoApproveProducts must be a boolean' })
  autoApproveProducts: boolean;
}
