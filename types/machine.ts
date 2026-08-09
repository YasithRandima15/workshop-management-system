export type MachineType = '3D_PRINTER' | 'CNC' | 'CNC_ROUTER' | 'LASER_CUTTER';
export type MachineStatus = 'IDLE' | 'RUNNING' | 'MAINTENANCE' | 'OFFLINE' | 'DOWN';

export interface Machine {
  id: string;
  name: string;
  type: MachineType;
  model: string;
  status: MachineStatus;
  hourlyRateLKR?: number;
  currentJobId?: string | null;
  currentJobTitle?: string | null;
  totalOperatingMinutes: number;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateMachineInput = Omit<Machine, 'id' | 'createdAt' | 'updatedAt'>;
