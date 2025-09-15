// src/purchases/interfaces/purchase.interface.ts
export interface Purchase {
  id: string;
  userId: string;
  gameId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: PurchaseStatus;
  country: string;
  transactionId: string;
  purchaseDate: Date;
  completedAt?: Date;
}

export interface Entitlement {
  id: string;
  userId: string;
  gameId: string;
  purchaseId: string;
  grantedAt: Date;
  active: boolean;
  downloadCount: number;
  maxDownloads: number;
}

export enum PurchaseStatus {
  PENDING = 'pending',
  PROCESSING = 'processing', 
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export interface PurchaseFilters {
  status?: PurchaseStatus;
  gameId?: string;
  startDate?: Date;
  endDate?: Date;
}