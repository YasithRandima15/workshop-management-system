'use client';

import React, { useState, useEffect } from 'react';
import { Material } from '@/types/material';
import { MaterialsService } from '@/lib/services/materials.service';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { formatLKR } from '@/lib/utils/formatters';
import { Layers, Plus, AlertTriangle, Printer, Cpu } from 'lucide-react';

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<'3D_PRINTING' | 'CNC'>('3D_PRINTING');
  const [category, setCategory] = useState<string>('PLA');
  const [color, setColor] = useState<string>('');
  const [stock, setStock] = useState<number>(1000);
  const [threshold, setThreshold] = useState<number>(500);
  const [unitCost, setUnitCost] = useState<number>(10);

  const loadMaterials = async () => {
    const list = await MaterialsService.listMaterials();
    setMaterials(list);
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await MaterialsService.createMaterial({
        name,
        type,
        category: category as any,
        color,
        unit: type === '3D_PRINTING' ? 'grams' : 'sheets',
        currentStockQuantity: stock,
        minStockThreshold: threshold,
        unitCostLKR: unitCost,
      });
      setIsModalOpen(false);
      loadMaterials();
    } catch (err) {
      console.error('Failed to create material', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Raw Materials & Inventory Stock
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Track 3D printing filament weights (PLA, PETG, ABS) and CNC hardwood/sheet stocks.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} size="sm" leftIcon={<Plus className="h-4 w-4" />}>
          Add Material
        </Button>
      </div>

      {/* Materials Inventory Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {materials.map((mat) => {
          const isLowStock = mat.currentStockQuantity <= mat.minStockThreshold;

          return (
            <Card
              key={mat.id}
              className={`p-4 space-y-3 ${
                isLowStock ? 'border-amber-300 dark:border-amber-900/60 bg-amber-50/10' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {mat.type === '3D_PRINTING' ? (
                    <Printer className="h-4 w-4 text-cyan-500" />
                  ) : (
                    <Cpu className="h-4 w-4 text-amber-500" />
                  )}
                  <span className="text-xs font-mono font-bold text-zinc-500">
                    {mat.category}
                  </span>
                </div>
                <Badge variant={isLowStock ? 'warning' : 'success'}>
                  {isLowStock ? 'LOW STOCK' : 'IN STOCK'}
                </Badge>
              </div>

              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{mat.name}</h3>
                <p className="text-xs text-zinc-500">
                  {mat.brand || 'Generic'} • {mat.color || 'Natural'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-md">
                <div>
                  <span className="text-zinc-400 text-[10px] uppercase font-bold">Current Stock</span>
                  <p className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 font-mono">
                    {mat.currentStockQuantity} {mat.unit}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-400 text-[10px] uppercase font-bold">Unit Cost</span>
                  <p className="font-bold text-sm text-brand-600 dark:text-brand-400 font-mono">
                    {formatLKR(mat.unitCostLKR)} / {mat.unit}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Material Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Raw Material">
        <form onSubmit={handleAddMaterial} className="space-y-4">
          <Input label="Material Name *" value={name} onChange={(e) => setName(e.target.value)} required />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Type *"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              options={[
                { value: '3D_PRINTING', label: '3D Printing Filament' },
                { value: 'CNC', label: 'CNC Wood / Sheet' },
              ]}
            />
            <Input label="Category (PLA, Mahogany)" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input label="Color" value={color} onChange={(e) => setColor(e.target.value)} />
            <Input label="Stock Qty" type="number" value={stock} onChange={(e) => setStock(parseFloat(e.target.value) || 0)} />
            <Input label="Unit Cost (LKR)" type="number" value={unitCost} onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Material</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
