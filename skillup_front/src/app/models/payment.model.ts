export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED'
}

export interface Payment {
  id: number;
  paymentReference: string;
  formationId: number;
  formationName: string;
  userId: number;
  userName: string;
  userEmail: string;
  amount: number;
  status: string;
  paymentMethod: string;
  paymentDate: string;
}

export interface PaymentRequest {
  formationId: number;
  formationName: string;
  userId: number;
  userName: string;
  userEmail: string;
  amount: number;
  paymentMethod: string;
}

export interface PaymentStats {
  totalRevenue: number;
  totalSuccessfulPayments: number;
  totalPayments: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
