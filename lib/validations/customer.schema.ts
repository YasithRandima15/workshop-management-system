import { z } from 'zod';

export const customerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  companyName: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(8, 'Phone number must be at least 8 digits'),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type CustomerFormValues = z.infer<typeof customerSchema>;
