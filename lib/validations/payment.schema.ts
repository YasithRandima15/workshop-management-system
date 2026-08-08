import { z } from 'zod';

export const paymentSchema = z.object({
  jobId: z.string().min(1, 'Please select a job'),
  customerId: z.string().min(1, 'Customer ID required'),
  customerName: z.string().min(1, 'Customer name required'),
  amountLKR: z.number().min(1, 'Amount must be greater than 0'),
  paymentMethod: z.enum(['CASH', 'BANK_TRANSFER', 'ONLINE', 'CARD']),
  referenceNumber: z.string().optional(),
  receiptUrl: z.string().optional(),
  notes: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
