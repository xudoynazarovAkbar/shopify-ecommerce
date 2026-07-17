import { IsEnum, IsNotEmpty } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class UpdateOrderStatusDto {
  @IsNotEmpty({ message: 'Order status is required' })
  @IsEnum(OrderStatus, {
    message: 'Order status must be PENDING, COMPLETED, or CANCELLED',
  })
  status: OrderStatus;
}
