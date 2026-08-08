import { JobPart } from './job';

export type QuotationStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface Quotation {
  id: string;
  quotationNumber: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  title: string;
  parts: JobPart[];
  subtotalLKR: number;
  discountLKR: number;
  taxLKR: number;
  totalLKR: number;
  validUntil: string;
  status: QuotationStatus;
  notes?: string;
  convertedToJobId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateQuotationInput = Omit<Quotation, 'id' | 'quotationNumber' | 'createdAt' | 'updatedAt'>;
