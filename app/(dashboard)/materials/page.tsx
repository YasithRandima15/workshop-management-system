'use client';

import React, { useState, useEffect } from 'react';
import { Material } from '@/types/material';
import { MaterialsService } from '@/lib/services/materials.service';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatLKR } from '@/lib/utils/formatters';
import { Layers, Plus, Printer, Cpu, Trash2 } from 'lucide-react';
import { MaterialModal } from '@/components/materials/MaterialModal';

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const loadMaterials = async () => {
    const list = await MaterialsService.listMaterials();
    setMaterials(list);
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete material ${name}?`)) {
      await MaterialsService.deleteMaterial(id);
      loadMaterials();
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
            Track 3D printing filament weights (PLA, PETG, ABS), SLA resins, and CNC hardwood/metal sheet stocks.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} size="sm" leftIcon={<Plus className="h-4 w-4" />}>
          Add Material
        </Button>
      </div>

      {/* Materials Inventory Table / Cards */}
      {materials.length === 0 ? (
        <div className="p-12 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg text-center space-y-3">
          <Layers className="h-8 w-8 text-zinc-400 mx-auto" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">No Raw Materials Registered</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Add 3D printer filaments, resin spools, or CNC hardwood/metal sheet inventory to enable cost calculations.
          </p>
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            Add First Material
          </Button>
        </div>
      ) : (
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
                  <div className="flex items-center gap-2">
                    <Badge variant={isLowStock ? 'warning' : 'success'}>
                      {isLowStock ? 'LOW STOCK' : 'IN STOCK'}
                    </Badge>
                    <button
                      onClick={() => handleDelete(mat.id, mat.name)}
                      className="p-1 text-zinc-400 hover:text-rose-500 transition-colors"
                      title="Delete Material"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{mat.name}</h3>
                  {mat.supplier && (
                    <p className="text-xs text-zinc-500">Supplier: {mat.supplier}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-md">
                  <div>
                    <span className="text-zinc-400 text-[10px] uppercase font-bold">Current Stock</span>
                    <p className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 font-mono">
                      {mat.currentStockQuantity} {mat.unit}
                    </p>
                  </div>
                  <div>
                    <span className="text-zinc-400 text-[10px] uppercase font-bold">Cost / Unit</span>
                    <p className="font-bold text-sm text-brand-600 dark:text-brand-400 font-mono">
                      {formatLKR(mat.unitCostLKR || 0)}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <MaterialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadMaterials}
      />
    </div>
  );
}
