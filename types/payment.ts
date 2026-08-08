export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'ONLINE' | 'CARD';

export interface Payment {
  id: string;
  paymentNumber: string;
  jobId: string;
  jobTitle?: string;
  customerId: string;
  customerName: string;
  amountLKR: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  receiptUrl?: string;
  notes?: string;
  recordedBy: string;
  recordedByName?: string;
  recordedAt: string;
  createdAt: string;
}

export type CreatePaymentInput = Omit<Payment, 'id' | 'paymentNumber' | 'createdAt'>;
