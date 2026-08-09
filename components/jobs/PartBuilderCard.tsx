'use client';

import React, { useState } from 'react';
import { JobPart, ManufacturingMethod } from '@/types/job';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Printer, Cpu, Trash2, Copy, Zap } from 'lucide-react';
import { formatLKR } from '@/lib/utils/formatters';
import { PricingService } from '@/lib/services/pricing.service';

interface PartBuilderCardProps {
  part: JobPart;
  onUpdate: (updated: JobPart) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

export function PartBuilderCard({ part, onUpdate, onDuplicate, onDelete }: PartBuilderCardProps) {
  const initialWeight = part.printDetails?.filamentWeightGrams || 50;
  const defaultRate = initialWeight < 100 ? 20 : 15;
  const [ratePerGram, setRatePerGram] = useState<number>(defaultRate);

  const handleMethodChange = (method: ManufacturingMethod) => {
    if (method === '3D_PRINTING') {
      const weight = 50;
      const rate = 20;
      const autoPrice = PricingService.calculate3DPrintPartPrice(weight, rate);
      setRatePerGram(rate);
      onUpdate({
        ...part,
        manufacturingMethod: '3D_PRINTING',
        unitPriceLKR: autoPrice,
        totalPriceLKR: autoPrice * part.quantity,
        printDetails: {
          materialName: 'PLA Tough',
          color: 'Black',
          filamentWeightGrams: weight,
          estimatedPrintMinutes: 120, // 2 hours
          layerHeightMm: 0.20,
          infillPercentage: 20,
        },
        cncDetails: undefined,
      });
    } else {
      const defaultPrice = PricingService.calculateCNCPartPrice(3000, 60);
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
          estimatedMachiningMinutes: 60, // 1 hour
          materialCostLKR: 3000,
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

  const update3DWeightOrRate = (newWeight?: number, newRate?: number, newHours?: number) => {
    const weight = Math.max(0, newWeight !== undefined ? newWeight : (part.printDetails?.filamentWeightGrams || 0));
    const rate = newRate !== undefined ? newRate : (weight < 100 ? 20 : 15);
    const printMinutes = newHours !== undefined ? Math.round(newHours * 60) : (part.printDetails?.estimatedPrintMinutes || 120);

    if (newRate !== undefined) setRatePerGram(newRate);
    else if (newWeight !== undefined) {
      const autoRate = newWeight < 100 ? 20 : 15;
      setRatePerGram(autoRate);
    }

    const autoPrice = PricingService.calculate3DPrintPartPrice(weight, rate);

    onUpdate({
      ...part,
      unitPriceLKR: autoPrice,
      totalPriceLKR: autoPrice * part.quantity,
      printDetails: {
        materialName: part.printDetails?.materialName || 'PLA Tough',
        color: part.printDetails?.color || 'Black',
        filamentWeightGrams: weight,
        estimatedPrintMinutes: printMinutes,
      },
    });
  };

  const updateCNCDetails = (field: string, value: any) => {
    const currentDetails = part.cncDetails || {
      materialCostLKR: 3000,
      estimatedMachiningMinutes: 60,
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

  const printHours = ((part.printDetails?.estimatedPrintMinutes || 120) / 60);
  const cncHours = ((part.cncDetails?.estimatedMachiningMinutes || 60) / 60);

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
            placeholder="Part Name (e.g. Enclosure Box, Custom Gear)"
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

      {/* Simplified 3D Printing Fields with Operating Hours */}
      {part.manufacturingMethod === '3D_PRINTING' && (
        <div className="bg-cyan-50/40 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-900/40 rounded-md p-3 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-800 dark:text-cyan-400">
              3D Print Details & Operating Hours
            </p>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-900/60 text-cyan-800 dark:text-cyan-300">
              Tier Rule: &lt;100g = 20 LKR/g | ≥100g = 15 LKR/g
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <Select
              label="Filament Material"
              value={part.printDetails?.materialName || 'PLA Tough'}
              onChange={(e) =>
                onUpdate({
                  ...part,
                  printDetails: {
                    materialName: e.target.value,
                    color: part.printDetails?.color || 'Black',
                    filamentWeightGrams: part.printDetails?.filamentWeightGrams || 50,
                    estimatedPrintMinutes: part.printDetails?.estimatedPrintMinutes || 120,
                  },
                })
              }
              options={[
                { value: 'PLA Tough', label: 'PLA Tough' },
                { value: 'PETG Carbon Fiber', label: 'PETG Carbon Fiber' },
                { value: 'ABS High Temp', label: 'ABS High Temp' },
                { value: 'TPU Flexible', label: 'TPU Flexible' },
                { value: 'ASA Outdoor', label: 'ASA Outdoor' },
              ]}
            />

            <Input
              label="Weight in Grams (g) *"
              type="number"
              value={part.printDetails?.filamentWeightGrams || 0}
              onChange={(e) => update3DWeightOrRate(parseFloat(e.target.value) || 0, undefined, undefined)}
            />

            <Input
              label="Cost Rate (LKR / g) *"
              type="number"
              value={ratePerGram}
              onChange={(e) => update3DWeightOrRate(undefined, parseFloat(e.target.value) || 0, undefined)}
            />

            <Input
              label="⚡ Operating Hours (hrs) *"
              type="number"
              step="0.5"
              value={printHours}
              onChange={(e) => update3DWeightOrRate(undefined, undefined, parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="p-2 bg-white dark:bg-zinc-900 rounded border border-cyan-200 dark:border-cyan-900/60 text-xs flex flex-wrap justify-between items-center font-mono gap-2">
            <span className="text-zinc-500">Part Price (Weight Only):</span>
            <span className="font-bold text-cyan-600 dark:text-cyan-400">
              {part.printDetails?.filamentWeightGrams || 0}g × {ratePerGram} LKR/g = {formatLKR(part.unitPriceLKR)}
            </span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-sans">
              <Zap className="h-3 w-3 shrink-0" /> Light bill units: {(printHours * 0.1 * part.quantity).toFixed(2)} units (for monthly light bill)
            </span>
          </div>
        </div>
      )}

      {/* CNC Fields with Operating Hours */}
      {part.manufacturingMethod === 'CNC' && (
        <div className="bg-amber-50/40 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-md p-3 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400">
            CNC Machining Details & Operating Hours
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <Select
              label="Wood / Material"
              value={part.cncDetails?.woodType || 'Mahogany'}
              onChange={(e) => updateCNCDetails('woodType', e.target.value)}
              options={[
                { value: 'Mahogany Hardwood', label: 'Mahogany Hardwood' },
                { value: 'Teak Hardwood', label: 'Teak Hardwood' },
                { value: 'MDF Board', label: 'MDF Board' },
                { value: 'Birch Plywood', label: 'Birch Plywood' },
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
              label="⚡ Operating Hours (hrs) *"
              type="number"
              step="0.5"
              value={cncHours}
              onChange={(e) => updateCNCDetails('estimatedMachiningMinutes', Math.round((parseFloat(e.target.value) || 0) * 60))}
            />
          </div>

          <div className="p-2 bg-white dark:bg-zinc-900 rounded border border-amber-200 dark:border-amber-900/60 text-xs flex justify-between items-center font-mono">
            <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-sans">
              <Zap className="h-3 w-3 shrink-0" /> Light bill units: {(cncHours * 0.3 * part.quantity).toFixed(2)} units (for monthly light bill)
            </span>
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
