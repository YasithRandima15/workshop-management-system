'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { QuotationsService } from '@/lib/services/quotations.service';
import { CustomersService } from '@/lib/services/customers.service';
import { Customer } from '@/types/customer';
import { FileText, AlertCircle } from 'lucide-react';
import { formatLKR } from '@/lib/utils/formatters';

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function QuotationModal({ isOpen, onClose, onSuccess }: QuotationModalProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [title, setTitle] = useState('');
  const [amountLKR, setAmountLKR] = useState<number>(0);
  const [validUntil, setValidUntil] = useState<string>(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      CustomersService.listCustomers().then((custs) => {
        setCustomers(custs);
        if (custs.length > 0) setCustomerId(custs[0].id);
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const selectedCust = customers.find((c) => c.id === customerId);
    if (!selectedCust) {
      setError('Please select a customer');
      return;
    }
    if (!title.trim()) {
      setError('Please enter a quotation title');
      return;
    }
    if (amountLKR <= 0) {
      setError('Quotation total must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    try {
      await QuotationsService.createQuotation({
        customerId: selectedCust.id,
        customerName: selectedCust.name,
        customerEmail: selectedCust.email,
        customerPhone: selectedCust.phone,
        title,
        parts: [],
        subtotalLKR: amountLKR,
        discountLKR: 0,
        taxLKR: 0,
        totalLKR: amountLKR,
        validUntil,
        status: 'SENT',
        notes,
        createdBy: 'usr-1',
      });

      setIsSubmitting(false);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create quotation');
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Formal Quotation"
      description="Issue a printable formal price estimation for custom manufacturing."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-950/50 border border-red-800 rounded-md text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Select
          label="Customer *"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          options={customers.map((c) => ({
            value: c.id,
            label: `${c.name} (${c.companyName || c.email})`,
          }))}
        />

        <Input
          label="Quotation Title / Project Subject *"
          placeholder="e.g. Mold Insert CNC Machining - 5 Units"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Estimated Total (LKR) *"
            type="number"
            value={amountLKR}
            onChange={(e) => setAmountLKR(parseFloat(e.target.value) || 0)}
          />
          <Input
            label="Valid Until *"
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
          />
        </div>

        <Input
          label="Terms / Quotation Notes"
          placeholder="e.g. 50% advance upon PO, remaining 50% upon delivery"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting} leftIcon={<FileText className="h-4 w-4" />}>
            Generate Quotation ({formatLKR(amountLKR)})
          </Button>
        </div>
      </form>
    </Modal>
  );
}
