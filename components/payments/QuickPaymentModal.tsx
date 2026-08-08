'use client';

import React, { useState } from 'react';
import { Job } from '@/types/job';
import { PaymentsService } from '@/lib/services/payments.service';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { formatLKR } from '@/lib/utils/formatters';
import { CreditCard, AlertCircle } from 'lucide-react';
import { PaymentMethod } from '@/types';

interface QuickPaymentModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export function QuickPaymentModal({
  job,
  isOpen,
  onClose,
  onPaymentSuccess,
}: QuickPaymentModalProps) {
  const [amount, setAmount] = useState<number>(job.balanceLKR);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK_TRANSFER');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (amount <= 0) {
      setError('Payment amount must be greater than zero');
      return;
    }

    if (amount > job.balanceLKR) {
      setError(`Payment amount cannot exceed remaining balance (${formatLKR(job.balanceLKR)})`);
      return;
    }

    setIsSubmitting(true);
    try {
      await PaymentsService.createPayment({
        jobId: job.id,
        jobTitle: `${job.jobNumber} (${job.title})`,
        customerId: job.customerId,
        customerName: job.customerName,
        amountLKR: amount,
        paymentMethod,
        referenceNumber,
        notes,
        recordedBy: 'usr-1',
        recordedAt: new Date().toISOString(),
      });

      setIsSubmitting(false);
      onPaymentSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Unable to save payment. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Record Payment for ${job.jobNumber}`}
      description="Record cash, bank transfer, or card payment against the remaining balance."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Job Summary Banner */}
        <div className="bg-zinc-50 dark:bg-zinc-800/60 p-3 rounded-lg flex items-center justify-between text-xs">
          <div>
            <span className="text-zinc-500">Total Quote Amount:</span>
            <p className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">
              {formatLKR(job.totalLKR)}
            </p>
          </div>
          <div>
            <span className="text-zinc-500">Paid Amount:</span>
            <p className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {formatLKR(job.paidAmountLKR)}
            </p>
          </div>
          <div>
            <span className="text-zinc-500 font-medium">Remaining Balance:</span>
            <p className="font-extrabold text-brand-600 dark:text-brand-400 font-mono text-sm">
              {formatLKR(job.balanceLKR)}
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-md text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Input
          label="Payment Amount (LKR) *"
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Payment Method *"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            options={[
              { value: 'BANK_TRANSFER', label: 'Bank Transfer (HNB/Commercial)' },
              { value: 'CASH', label: 'Cash Payment' },
              { value: 'ONLINE', label: 'Online Payment Gateway' },
              { value: 'CARD', label: 'Credit/Debit Card' },
            ]}
          />
          <Input
            label="Reference / Transaction ID"
            placeholder="e.g. BT-998822"
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
          />
        </div>

        <Input
          label="Notes / Receipt Comments"
          placeholder="e.g. Advance payment before 3D printing start"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            leftIcon={<CreditCard className="h-4 w-4" />}
          >
            Record Payment ({formatLKR(amount)})
          </Button>
        </div>
      </form>
    </Modal>
  );
}
