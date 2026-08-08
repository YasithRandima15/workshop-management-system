export type FilamentType = 'PLA' | 'PETG' | 'ABS' | 'TPU' | 'ASA' | 'OTHER_FILAMENT';
export type WoodType = 'MAHOGANY' | 'TEAK' | 'JACK' | 'NEDUN' | 'MDF' | 'PLYWOOD' | 'OTHER_WOOD';

export type MaterialCategory = FilamentType | WoodType;

export interface Material {
  id: string;
  name: string;
  type: '3D_PRINTING' | 'CNC';
  category: MaterialCategory;
  color?: string;
  brand?: string;
  supplier?: string;
  unit: 'grams' | 'sheets' | 'board_feet' | 'units';
  currentStockQuantity: number;
  minStockThreshold: number;
  unitCostLKR: number;
  archivedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateMaterialInput = Omit<Material, 'id' | 'archivedAt' | 'createdAt' | 'updatedAt'>;
