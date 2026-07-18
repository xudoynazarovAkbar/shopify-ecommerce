import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsUUID,
} from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty({ message: 'Order ID is required' })
  @IsUUID('4', { message: 'Order ID must be a valid UUID v4' })
  orderId: string;

  @IsNotEmpty({ message: 'Rating is required' })
  @IsInt({ message: 'Rating must be an integer' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must be at most 5' })
  rating: number;

  @IsOptional()
  @IsString({ message: 'Comment must be a string' })
  comment?: string;
}
