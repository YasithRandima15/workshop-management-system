export * from './customer';
export * from './job';
export * from './material';
export * from './machine';
export * from './payment';
export * from './expense';
export * from './quotation';
export * from './product';

export type UserRole = 'ADMIN' | 'OPERATOR' | 'VIEWER';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  todayRevenueLKR: number;
  pendingPaymentsLKR: number;
  activeJobsCount: number;
  jobsReadyForDeliveryCount: number;
  lowStockMaterialsCount: number;
  machinesRunningCount: number;
}
