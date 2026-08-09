'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Payment } from '@/types/payment';
import { PaymentsService } from '@/lib/services/payments.service';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatLKR, formatDateTime } from '@/lib/utils/formatters';
import { CreditCard, DollarSign, Trash2 } from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);

  const loadPayments = async () => {
    const list = await PaymentsService.listPayments();
    setPayments(list);
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleDelete = async (id: string, number: string) => {
    if (confirm(`Are you sure you want to delete payment record ${number}?`)) {
      await PaymentsService.deletePayment(id);
      loadPayments();
    }
  };

  const totalCollected = payments.reduce((sum, p) => sum + p.amountLKR, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Payments & Receipts Audit
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Complete transaction history of advance deposits and final payments.
          </p>
        </div>

        <div className="p-3 bg-zinc-900 text-white rounded-lg flex items-center gap-3">
          <DollarSign className="h-5 w-5 text-brand-400" />
          <div>
            <span className="text-[10px] text-zinc-400 uppercase font-bold">Total Receipts</span>
            <p className="font-bold font-mono text-sm">{formatLKR(totalCollected)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold uppercase">
              <th className="p-3.5">Payment #</th>
              <th className="p-3.5">Job Order</th>
              <th className="p-3.5">Customer</th>
              <th className="p-3.5">Method</th>
              <th className="p-3.5 text-right">Amount (LKR)</th>
              <th className="p-3.5">Timestamp</th>
              <th className="p-3.5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                <td className="p-3.5 font-mono font-bold text-brand-600 dark:text-brand-400">
                  {p.paymentNumber}
                </td>
                <td className="p-3.5 font-medium text-zinc-900 dark:text-zinc-100">
                  <Link href={`/jobs/${p.jobId}`} className="hover:underline">
                    {p.jobTitle || p.jobId}
                  </Link>
                </td>
                <td className="p-3.5 text-zinc-700 dark:text-zinc-300">{p.customerName}</td>
                <td className="p-3.5">
                  <Badge variant="outline">{p.paymentMethod}</Badge>
                </td>
                <td className="p-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatLKR(p.amountLKR)}
                </td>
                <td className="p-3.5 text-zinc-500 font-mono text-[11px]">
                  {formatDateTime(p.recordedAt)}
                </td>
                <td className="p-3.5 text-center">
                  <button
                    onClick={() => handleDelete(p.id, p.paymentNumber)}
                    className="p-1 text-zinc-400 hover:text-rose-500 transition-colors"
                    title="Delete Payment"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
