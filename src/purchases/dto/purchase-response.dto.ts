import { ApiProperty } from '@nestjs/swagger';
import { PurchaseStatus } from '../interfaces/purchase.interface';

export class PurchaseResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  gameId: string;

  @ApiProperty({ example: 'Cyberpunk 2077' })
  gameTitle: string;

  @ApiProperty({ example: 59.99 })
  amount: number;

  @ApiProperty({ example: 'USD' })
  currency: string;

  @ApiProperty({ example: 'credit_card' })
  paymentMethod: string;

  @ApiProperty({ enum: PurchaseStatus, example: PurchaseStatus.COMPLETED })
  status: PurchaseStatus;

  @ApiProperty({ example: 'txn_abc123xyz789' })
  transactionId: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  purchaseDate: Date;

  @ApiProperty({ example: true })
  entitlementGranted: boolean;
}
// src/purchases/dto/entitlement-response.dto.ts
export class EntitlementResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  gameId: string;

  @ApiProperty({ example: 'Cyberpunk 2077' })
  gameTitle: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  grantedAt: Date;

  @ApiProperty({ example: true })
  active: boolean;

  @ApiProperty({ example: 2 })
  downloadCount: number;

  @ApiProperty({ example: 5 })
  maxDownloads: number;

  @ApiProperty({ example: true })
  canDownload: boolean;
}