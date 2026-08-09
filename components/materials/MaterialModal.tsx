'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { MaterialsService } from '@/lib/services/materials.service';
import { MaterialCategory } from '@/types/material';
import { Layers, AlertCircle } from 'lucide-react';

interface MaterialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function MaterialModal({ isOpen, onClose, onSuccess }: MaterialModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'3D_PRINTING' | 'CNC'>('3D_PRINTING');
  const [category, setCategory] = useState<MaterialCategory>('PLA');
  const [unit, setUnit] = useState<'grams' | 'sheets' | 'board_feet' | 'units'>('grams');
  const [unitCostLKR, setUnitCostLKR] = useState<number>(10);
  const [currentStockQuantity, setCurrentStockQuantity] = useState<number>(1000);
  const [minStockThreshold, setMinStockThreshold] = useState<number>(200);
  const [supplier, setSupplier] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter a material name');
      return;
    }

    setIsSubmitting(true);
    try {
      await MaterialsService.createMaterial({
        name,
        type,
        category,
        unit,
        unitCostLKR,
        currentStockQuantity,
        minStockThreshold,
        supplier,
      });

      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create material');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Manufacturing Material"
      description="Register 3D Printing Filament, Resin, Wood Stock, or Aluminum Sheet Metal."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-950/50 border border-red-800 rounded-md text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Material Name *"
          placeholder="e.g. eSUN PLA+ Tough Filament (Black)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Manufacturing Method *"
            value={type}
            onChange={(e) => {
              const t = e.target.value as '3D_PRINTING' | 'CNC';
              setType(t);
              if (t === '3D_PRINTING') {
                setUnit('grams');
                setCategory('PLA');
              } else {
                setUnit('sheets');
                setCategory('MAHOGANY');
              }
            }}
            options={[
              { value: '3D_PRINTING', label: '3D Printing Filament / Resin' },
              { value: 'CNC', label: 'CNC Wood / Sheet Metal' },
            ]}
          />

          <Select
            label="Category *"
            value={category}
            onChange={(e) => setCategory(e.target.value as MaterialCategory)}
            options={
              type === '3D_PRINTING'
                ? [
                    { value: 'PLA', label: 'PLA Filament' },
                    { value: 'PETG', label: 'PETG Filament' },
                    { value: 'ABS', label: 'ABS Filament' },
                    { value: 'TPU', label: 'TPU Flexible' },
                    { value: 'ASA', label: 'ASA Outdoor' },
                  ]
                : [
                    { value: 'MAHOGANY', label: 'Mahogany Hardwood' },
                    { value: 'TEAK', label: 'Teak Wood' },
                    { value: 'MDF', label: 'MDF Board' },
                    { value: 'PLYWOOD', label: 'Plywood Board' },
                  ]
            }
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Unit Cost (LKR) *"
            type="number"
            value={unitCostLKR}
            onChange={(e) => setUnitCostLKR(parseFloat(e.target.value) || 0)}
          />
          <Input
            label="Initial Stock *"
            type="number"
            value={currentStockQuantity}
            onChange={(e) => setCurrentStockQuantity(parseFloat(e.target.value) || 0)}
          />
          <Input
            label="Low Stock Alert Threshold *"
            type="number"
            value={minStockThreshold}
            onChange={(e) => setMinStockThreshold(parseFloat(e.target.value) || 0)}
          />
        </div>

        <Input
          label="Supplier / Vendor Info"
          placeholder="e.g. Lanka 3D Suppliers (Pvt) Ltd"
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} leftIcon={<Layers className="h-4 w-4" />}>
            Add Material
          </Button>
        </div>
      </form>
    </Modal>
  );
}
