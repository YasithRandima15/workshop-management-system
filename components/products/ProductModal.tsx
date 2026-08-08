'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ProductsService } from '@/lib/services/products.service';
import { ProductCategory } from '@/types/product';
import { Package, AlertCircle } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORY_OPTIONS = [
  { value: 'SPARE_PARTS', label: '3D Printed Spare Parts' },
  { value: 'CUSTOM_GEARS', label: 'Custom Machined Gears' },
  { value: 'STANDARD_HARDWARE', label: 'Fasteners & Brackets' },
  { value: 'ELECTRONICS', label: 'Sensors & Controllers' },
  { value: 'CONSUMABLES', label: 'Workshop Consumables' },
  { value: 'OTHER', label: 'Other Catalog Product' },
];

export function ProductModal({ isOpen, onClose, onSuccess }: ProductModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('SPARE_PARTS');
  const [description, setDescription] = useState('');
  const [unitPriceLKR, setUnitPriceLKR] = useState<number>(0);
  const [costPriceLKR, setCostPriceLKR] = useState<number>(0);
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter a product name');
      return;
    }
    if (unitPriceLKR <= 0) {
      setError('Selling price must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedOpt = CATEGORY_OPTIONS.find((c) => c.value === category);
      await ProductsService.createProduct({
        name,
        category,
        categoryName: selectedOpt?.label || category,
        description,
        unitPriceLKR,
        costPriceLKR,
        stockQuantity,
      });

      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create product');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Inventory Product"
      description="Register a standardized component or manufactured item into the stock catalog."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-950/50 border border-red-800 rounded-md text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Product Name *"
          placeholder="e.g. NEMA 17 Stepper Mounting Plate"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Select
          label="Category *"
          value={category}
          onChange={(e) => setCategory(e.target.value as ProductCategory)}
          options={CATEGORY_OPTIONS}
        />

        <Input
          label="Description / Specifications"
          placeholder="e.g. Black Anodized Aluminum 6061 3mm thickness"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Selling Price (LKR) *"
            type="number"
            value={unitPriceLKR}
            onChange={(e) => setUnitPriceLKR(parseFloat(e.target.value) || 0)}
          />
          <Input
            label="Manufacturing Cost *"
            type="number"
            value={costPriceLKR}
            onChange={(e) => setCostPriceLKR(parseFloat(e.target.value) || 0)}
          />
          <Input
            label="Initial Stock *"
            type="number"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(parseInt(e.target.value, 10) || 0)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} leftIcon={<Package className="h-4 w-4" />}>
            Add Product to Catalog
          </Button>
        </div>
      </form>
    </Modal>
  );
}
