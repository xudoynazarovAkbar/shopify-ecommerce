import { IsEnum, IsNotEmpty } from 'class-validator';
import { VendorStatus } from '@prisma/client';

export class UpdateVendorStatusDto {
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(VendorStatus, {
    message: 'Status must be PENDING, APPROVED, or REJECTED',
  })
  status: VendorStatus;
}
