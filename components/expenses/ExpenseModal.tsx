'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { ExpensesService } from '@/lib/services/expenses.service';
import { ExpenseCategory } from '@/types/expense';
import { DollarSign, AlertCircle } from 'lucide-react';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORY_OPTIONS = [
  { value: 'UTILITIES', label: 'Electricity & Factory Utilities' },
  { value: 'TOOLING', label: 'CNC Tooling Bits & End Mills' },
  { value: 'RAW_MATERIAL', label: 'Filament & Raw Stock Restock' },
  { value: 'MAINTENANCE', label: 'Machine Repair & Spares' },
  { value: 'SALARY', label: 'Labor & Operator Wages' },
  { value: 'MARKETING', label: 'Marketing & Website Costs' },
  { value: 'OTHER', label: 'General Miscellaneous Expense' },
];

export function ExpenseModal({ isOpen, onClose, onSuccess }: ExpenseModalProps) {
  const [category, setCategory] = useState<ExpenseCategory>('UTILITIES');
  const [description, setDescription] = useState('');
  const [amountLKR, setAmountLKR] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!description.trim()) {
      setError('Please provide a description for this expense');
      return;
    }
    if (amountLKR <= 0) {
      setError('Amount must be greater than 0 LKR');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedOpt = CATEGORY_OPTIONS.find((c) => c.value === category);
      await ExpensesService.createExpense({
        category,
        categoryName: selectedOpt?.label || category,
        description,
        amountLKR,
        date,
        loggedBy: 'usr-1',
        loggedByName: 'Operator',
      });

      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to log expense');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Workshop Expense"
      description="Record operational cost, tooling purchase, or factory utility bill."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-950/50 border border-red-800 rounded-md text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Select
          label="Expense Category *"
          value={category}
          onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
          options={CATEGORY_OPTIONS}
        />

        <Input
          label="Description / Purpose *"
          placeholder="e.g. 10x 6mm Carbide End Mills from Supplier"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Amount (LKR) *"
            type="number"
            value={amountLKR}
            onChange={(e) => setAmountLKR(parseFloat(e.target.value) || 0)}
          />
          <Input
            label="Date *"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} leftIcon={<DollarSign className="h-4 w-4" />}>
            Log Expense
          </Button>
        </div>
      </form>
    </Modal>
  );
}
