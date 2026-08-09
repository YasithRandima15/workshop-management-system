'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatLKR } from '@/lib/utils/formatters';
import { Package, Plus, Trash2 } from 'lucide-react';
import { ProductsService } from '@/lib/services/products.service';
import { Product } from '@/types/product';
import { ProductModal } from '@/components/products/ProductModal';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await ProductsService.listProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete catalog product ${name}?`)) {
      await ProductsService.deleteProduct(id);
      fetchProducts();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Standard Products Inventory Catalog
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Pre-configured manufacturing catalog items for fast quotation assembly.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Add Catalog Product
        </Button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-500">Loading catalog from database...</div>
      ) : products.length === 0 ? (
        <div className="p-12 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg text-center space-y-3">
          <Package className="h-8 w-8 text-zinc-400 mx-auto" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Catalog Empty</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Register standardized products, gears, and spare parts to assemble fast quotes for customers.
          </p>
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            Add First Product
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {products.map((p) => (
            <Card key={p.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                  {p.sku}
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{p.categoryName}</Badge>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    className="p-1 text-zinc-400 hover:text-rose-500 transition-colors"
                    title="Delete Product"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{p.name}</h3>
                {p.description && (
                  <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{p.description}</p>
                )}
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[10px] text-zinc-400 block">Stock Qty</span>
                  <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                    {p.stockQuantity} units
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 block">Selling Price</span>
                  <span className="font-mono font-bold text-brand-600 dark:text-brand-400 text-sm">
                    {formatLKR(p.unitPriceLKR)}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchProducts}
      />
    </div>
  );
}
