export type JobPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type JobStatus = 
  | 'QUOTATION'
  | 'ORDER_CONFIRMED'
  | 'TO_BE_PRINTED'
  | 'PRINTING'
  | 'CNC_PROCESSING'
  | 'FINISHING'
  | 'QUALITY_CHECK'
  | 'READY'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export type ManufacturingMethod = '3D_PRINTING' | 'CNC';

export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';

export type DeliveryMethod = 'PICKUP' | 'COURIER' | 'DELIVERY';

export interface JobPart3DPrintDetails {
  printerId?: string;
  printerName?: string;
  materialId?: string;
  materialName?: string;
  color?: string;
  filamentWeightGrams: number;
  estimatedPrintMinutes: number;
  layerHeightMm?: number;
  infillPercentage?: number;
  hasSupports?: boolean;
  nozzleSizeMm?: number;
  slicerFileUrl?: string;
  gcodeFileUrl?: string;
}

export interface JobPartCNCDetails {
  machineId?: string;
  machineName?: string;
  woodType?: string;
  thicknessMm: number;
  lengthMm: number;
  widthMm: number;
  toolDiameterMm?: number;
  feedRate?: number;
  spindleSpeedRpm?: number;
  estimatedMachiningMinutes: number;
  camFileUrl?: string;
  gcodeFileUrl?: string;
  finishingNotes?: string;
  materialCostLKR: number;
}

export interface JobPart {
  id: string;
  jobId?: string;
  partName: string;
  quantity: number;
  manufacturingMethod: ManufacturingMethod;
  unitPriceLKR: number;
  totalPriceLKR: number;
  printDetails?: JobPart3DPrintDetails;
  cncDetails?: JobPartCNCDetails;
  notes?: string;
}

export interface JobStatusHistory {
  id: string;
  jobId: string;
  previousStatus: JobStatus;
  newStatus: JobStatus;
  changedBy: string;
  changedByName: string;
  note?: string;
  timestamp: string;
}

export interface Job {
  id: string;
  jobNumber: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  title: string;
  priority: JobPriority;
  status: JobStatus;
  manufacturingTypes: ManufacturingMethod[];
  parts: JobPart[];
  subtotalLKR: number;
  discountLKR: number;
  taxLKR: number;
  deliveryFeeLKR: number;
  totalLKR: number;
  paidAmountLKR: number;
  balanceLKR: number;
  paymentStatus: PaymentStatus;
  dueDate: string;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  notes?: string;
  archivedAt?: string | null;
  archivedBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateJobInput = Omit<Job, 'id' | 'jobNumber' | 'paidAmountLKR' | 'balanceLKR' | 'paymentStatus' | 'archivedAt' | 'archivedBy' | 'createdAt' | 'updatedAt'>;
export type UpdateJobInput = Partial<CreateJobInput>;
