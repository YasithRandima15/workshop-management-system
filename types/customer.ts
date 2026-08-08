export interface Customer {
  id: string;
  customerCode: string;
  name: string;
  companyName?: string;
  email: string;
  phone: string;
  address?: string;
  notes?: string;
  totalJobsCount: number;
  totalSpentLKR: number;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateCustomerInput = Omit<Customer, 'id' | 'customerCode' | 'totalJobsCount' | 'totalSpentLKR' | 'archivedAt' | 'createdAt' | 'updatedAt'>;
export type UpdateCustomerInput = Partial<CreateCustomerInput>;
