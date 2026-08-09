'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { formatLKR, formatDate } from '@/lib/utils/formatters';
import { DollarSign, Plus, Trash2, Tag, Zap } from 'lucide-react';
import { ExpensesService } from '@/lib/services/expenses.service';
import { Expense } from '@/types/expense';
import { ExpenseModal } from '@/components/expenses/ExpenseModal';
import { ElectricityBillModal } from '@/components/expenses/ElectricityBillModal';

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isElecModalOpen, setIsElecModalOpen] = useState(false);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const data = await ExpensesService.listExpenses();
      setExpenses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this expense record?')) {
      await ExpensesService.deleteExpense(id);
      fetchExpenses();
    }
  };

  const totalAmount = expenses.reduce((sum, e) => sum + e.amountLKR, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Workshop Expenses & Overhead Costs
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Log machinery maintenance, electricity bills, tooling bits, and raw material restocks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3 py-1 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-lg text-xs">
            <span className="text-zinc-500 font-medium">Total Expenses:</span>{' '}
            <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
              {formatLKR(totalAmount)}
            </span>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsElecModalOpen(true)}
            leftIcon={<Zap className="h-4 w-4 text-amber-500" />}
          >
            Light Bill Calculator
          </Button>

          <Button
            size="sm"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Log New Expense
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-500">Loading expenses from database...</div>
      ) : expenses.length === 0 ? (
        <div className="p-12 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg text-center space-y-3">
          <DollarSign className="h-8 w-8 text-zinc-400 mx-auto" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">No Expenses Logged Yet</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Keep track of operational costs, factory electricity, and consumable stock purchases.
          </p>
          <div className="flex justify-center gap-3">
            <Button size="sm" variant="outline" onClick={() => setIsElecModalOpen(true)}>
              Calculate Light Bill
            </Button>
            <Button size="sm" onClick={() => setIsModalOpen(true)}>
              Log First Expense
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold uppercase">
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 text-right">Amount (LKR)</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {expenses.map((e) => (
                <tr key={e.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                  <td className="p-3.5 font-semibold text-zinc-900 dark:text-zinc-100">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      <Tag className="h-3 w-3 text-brand-500" />
                      {e.categoryName}
                    </span>
                  </td>
                  <td className="p-3.5 text-zinc-600 dark:text-zinc-300 font-medium">
                    {e.description}
                  </td>
                  <td className="p-3.5 font-mono text-zinc-500 text-[11px]">
                    {formatDate(e.date)}
                  </td>
                  <td className="p-3.5 text-right font-mono font-bold text-rose-600 dark:text-rose-400">
                    {formatLKR(e.amountLKR)}
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="p-1 text-zinc-400 hover:text-rose-500 transition-colors"
                      title="Delete Expense"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchExpenses}
      />

      <ElectricityBillModal
        isOpen={isElecModalOpen}
        onClose={() => setIsElecModalOpen(false)}
        onSuccess={fetchExpenses}
      />
    </div>
  );
}
