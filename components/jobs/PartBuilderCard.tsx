'use client';

import React from 'react';
import { JobPart, ManufacturingMethod } from '@/types/job';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Printer, Cpu, Trash2, Copy, DollarSign } from 'lucide-react';
import { formatLKR } from '@/lib/utils/formatters';
import { PricingService } from '@/lib/services/pricing.service';

interface PartBuilderCardProps {
  part: JobPart;
  onUpdate: (updated: JobPart) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function PartBuilderCard({ part, onUpdate, onDuplicate, onDelete }: PartBuilderCardProps) {
  const handleMethodChange = (method: ManufacturingMethod) => {
    if (method === '3D_PRINTING') {
      const defaultPrice = PricingService.calculate3DPrintPartPrice(100, 120);
      onUpdate({
        ...part,
        manufacturingMethod: '3D_PRINTING',
        unitPriceLKR: defaultPrice,
        totalPriceLKR: defaultPrice * part.quantity,
        printDetails: {
          materialName: 'PLA Tough',
          color: 'Black',
          filamentWeightGrams: 100,
          estimatedPrintMinutes: 120,
          layerHeightMm: 0.20,
          infillPercentage: 20,
        },
        cncDetails: undefined,
      });
    } else {
      const defaultPrice = PricingService.calculateCNCPartPrice(5000, 90);
      onUpdate({
        ...part,
        manufacturingMethod: 'CNC',
        unitPriceLKR: defaultPrice,
        totalPriceLKR: defaultPrice * part.quantity,
        cncDetails: {
          woodType: 'Mahogany',
          thicknessMm: 18,
          lengthMm: 300,
          widthMm: 200,
          estimatedMachiningMinutes: 90,
          materialCostLKR: 5000,
        },
        printDetails: undefined,
      });
    }
  };

  const handleQuantityChange = (qty: number) => {
    const safeQty = Math.max(1, qty);
    onUpdate({
      ...part,
      quantity: safeQty,
      totalPriceLKR: part.unitPriceLKR * safeQty,
    });
  };

  const handleUnitPriceChange = (price: number) => {
    const safePrice = Math.max(0, price);
    onUpdate({
      ...part,
      unitPriceLKR: safePrice,
      totalPriceLKR: safePrice * part.quantity,
    });
  };

  // Recalculate 3D print auto pricing
  const update3DPrintDetails = (field: string, value: any) => {
    const currentDetails = part.printDetails || {
      filamentWeightGrams: 100,
      estimatedPrintMinutes: 120,
    };
    const updatedDetails = { ...currentDetails, [field]: value };
    const autoPrice = PricingService.calculate3DPrintPartPrice(
      updatedDetails.filamentWeightGrams,
      updatedDetails.estimatedPrintMinutes
    );

    onUpdate({
      ...part,
      printDetails: updatedDetails,
      unitPriceLKR: autoPrice,
      totalPriceLKR: autoPrice * part.quantity,
    });
  };

  // Recalculate CNC auto pricing
  const updateCNCDetails = (field: string, value: any) => {
    const currentDetails = part.cncDetails || {
      materialCostLKR: 5000,
      estimatedMachiningMinutes: 90,
      thicknessMm: 18,
      lengthMm: 300,
      widthMm: 200,
    };
    const updatedDetails = { ...currentDetails, [field]: value };
    const autoPrice = PricingService.calculateCNCPartPrice(
      updatedDetails.materialCostLKR,
      updatedDetails.estimatedMachiningMinutes
    );

    onUpdate({
      ...part,
      cncDetails: updatedDetails,
      unitPriceLKR: autoPrice,
      totalPriceLKR: autoPrice * part.quantity,
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 space-y-4 shadow-xs transition-all">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2 flex-1">
          {part.manufacturingMethod === '3D_PRINTING' ? (
            <div className="p-1.5 bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 rounded-md">
              <Printer className="h-4 w-4" />
            </div>
          ) : (
            <div className="p-1.5 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-md">
              <Cpu className="h-4 w-4" />
            </div>
          )}
          <input
            type="text"
            placeholder="Part Name (e.g. Robot Gear, Carved Panel)"
            value={part.partName}
            onChange={(e) => onUpdate({ ...part, partName: e.target.value })}
            className="font-semibold text-sm bg-transparent border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 focus:border-brand-500 focus:outline-none text-zinc-900 dark:text-zinc-100 w-full"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Badge variant={part.manufacturingMethod === '3D_PRINTING' ? '3dprint' : 'cnc'}>
            {part.manufacturingMethod === '3D_PRINTING' ? '3D Print' : 'CNC Machining'}
          </Badge>
          <button
            onClick={onDuplicate}
            className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
            title="Duplicate Part"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-zinc-400 hover:text-red-600 rounded hover:bg-red-50 dark:hover:bg-red-950/40"
            title="Delete Part"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Manufacturing Method Switcher & Quantity */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select
          label="Manufacturing Method"
          value={part.manufacturingMethod}
          onChange={(e) => handleMethodChange(e.target.value as ManufacturingMethod)}
          options={[
            { value: '3D_PRINTING', label: '3D Printing' },
            { value: 'CNC', label: 'CNC Machining / Cutting' },
          ]}
        />
        <Input
          label="Quantity"
          type="number"
          min="1"
          value={part.quantity}
          onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
        />
        <Input
          label="Unit Price (LKR)"
          type="number"
          value={part.unitPriceLKR}
          onChange={(e) => handleUnitPriceChange(parseFloat(e.target.value) || 0)}
        />
      </div>

      {/* Conditional 3D Printing Fields */}
      {part.manufacturingMethod === '3D_PRINTING' && (
        <div className="bg-cyan-50/40 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-900/40 rounded-md p-3 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-800 dark:text-cyan-400">
              3D Printing Parameters
            </p>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-900/60 text-cyan-800 dark:text-cyan-300">
              Gram Rate: {(part.printDetails?.filamentWeightGrams || 0) < 100 ? 'Rs 20/g (<100g)' : 'Rs 15/g (≥100g)'}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <Select
              label="Filament Material"
              value={part.printDetails?.materialName || 'PLA'}
              onChange={(e) => update3DPrintDetails('materialName', e.target.value)}
              options={[
                { value: 'PLA Tough', label: 'PLA Tough' },
                { value: 'PETG Carbon Fiber', label: 'PETG Carbon Fiber' },
                { value: 'ABS High Temp', label: 'ABS High Temp' },
                { value: 'TPU Flexible', label: 'TPU Flexible (95A)' },
                { value: 'ASA UV Resistant', label: 'ASA UV Resistant' },
              ]}
            />
            <Input
              label="Color"
              value={part.printDetails?.color || 'Black'}
              onChange={(e) => update3DPrintDetails('color', e.target.value)}
            />
            <Input
              label="Est. Filament Weight (g)"
              type="number"
              value={part.printDetails?.filamentWeightGrams || 0}
              onChange={(e) => update3DPrintDetails('filamentWeightGrams', parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Est. Print Time (mins)"
              type="number"
              value={part.printDetails?.estimatedPrintMinutes || 0}
              onChange={(e) => update3DPrintDetails('estimatedPrintMinutes', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
      )}

      {/* Conditional CNC Fields */}
      {part.manufacturingMethod === 'CNC' && (
        <div className="bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-md p-3 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
            CNC Routing & Machining Parameters
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <Select
              label="Wood / Material Type"
              value={part.cncDetails?.woodType || 'Mahogany'}
              onChange={(e) => updateCNCDetails('woodType', e.target.value)}
              options={[
                { value: 'Mahogany Hardwood', label: 'Mahogany Hardwood' },
                { value: 'Teak Hardwood', label: 'Teak Hardwood' },
                { value: 'Jack Wood', label: 'Jack Wood' },
                { value: 'MDF Board', label: 'MDF Board' },
                { value: 'Birch Plywood', label: 'Birch Plywood' },
                { value: 'Cast Clear Acrylic', label: 'Cast Clear Acrylic' },
              ]}
            />
            <Input
              label="Thickness (mm)"
              type="number"
              value={part.cncDetails?.thicknessMm || 18}
              onChange={(e) => updateCNCDetails('thicknessMm', parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Raw Material Cost (LKR)"
              type="number"
              value={part.cncDetails?.materialCostLKR || 0}
              onChange={(e) => updateCNCDetails('materialCostLKR', parseFloat(e.target.value) || 0)}
            />
            <Input
              label="Est. Machining Time (mins)"
              type="number"
              value={part.cncDetails?.estimatedMachiningMinutes || 0}
              onChange={(e) => updateCNCDetails('estimatedMachiningMinutes', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
      )}

      {/* Total Part Price Summary */}
      <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-100 dark:border-zinc-800">
        <span className="text-zinc-500 font-medium">
          Line Item Total: {part.quantity} × {formatLKR(part.unitPriceLKR)}
        </span>
        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
          {formatLKR(part.totalPriceLKR)}
        </span>
      </div>
    </div>
  );
}
