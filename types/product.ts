export type ProductCategory = 
  | 'SPARE_PARTS' 
  | 'CUSTOM_GEARS' 
  | 'STANDARD_HARDWARE' 
  | 'ELECTRONICS' 
  | 'CONSUMABLES' 
  | 'OTHER';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  categoryName: string;
  description?: string;
  unitPriceLKR: number;
  costPriceLKR: number;
  stockQuantity: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateProductInput = Omit<Product, 'id' | 'sku' | 'createdAt' | 'updatedAt'>;
