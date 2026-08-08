export type ExpenseCategory = 
  | 'UTILITIES' 
  | 'TOOLING' 
  | 'RAW_MATERIAL' 
  | 'MAINTENANCE' 
  | 'SALARY' 
  | 'MARKETING' 
  | 'OTHER';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  categoryName: string;
  description: string;
  amountLKR: number;
  date: string;
  receiptUrl?: string;
  loggedBy: string;
  loggedByName?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateExpenseInput = Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>;
