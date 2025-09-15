// src/purchases/dto/create-purchase.dto.ts
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePurchaseDto {
  @ApiProperty({
    description: 'Payment method used',
    example: 'credit_card',
    enum: ['credit_card', 'paypal', 'bank_transfer', 'crypto']
  })
  @IsEnum(['credit_card', 'paypal', 'bank_transfer', 'crypto'])
  paymentMethod: string;

  @ApiProperty({
    description: 'Country code for localized pricing',
    example: 'PE'
  })
  @IsString()
  country: string;

  @ApiProperty({
    description: 'Currency for payment',
    example: 'PEN',
    enum: ['USD', 'PEN', 'MXN', 'ARS', 'EUR'],
    required: false
  })
  @IsOptional()
  @IsEnum(['USD', 'PEN', 'MXN', 'ARS', 'EUR'])
  currency?: string;
}

