import {
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  Max,
  Matches,
} from 'class-validator';

export class SaveCardDto {
  @IsNotEmpty({ message: 'Card number is required' })
  @IsString({ message: 'Card number must be a string' })
  @Matches(/^\d{13,19}$/, {
    message: 'Card number must be a numeric string between 13 and 19 digits',
  })
  cardNumber: string;

  @IsNotEmpty({ message: 'Card brand is required' })
  @IsString({ message: 'Card brand must be a string' })
  brand: string;

  @IsNotEmpty({ message: 'Expiration month is required' })
  @IsInt({ message: 'Expiration month must be an integer' })
  @Min(1, { message: 'Expiration month must be at least 1' })
  @Max(12, { message: 'Expiration month cannot be greater than 12' })
  expMonth: number;

  @IsNotEmpty({ message: 'Expiration year is required' })
  @IsInt({ message: 'Expiration year must be an integer' })
  @Min(2026, { message: 'Expiration year must be 2026 or later' })
  expYear: number;
}
