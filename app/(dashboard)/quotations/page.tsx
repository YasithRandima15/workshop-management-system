'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatLKR, formatDate } from '@/lib/utils/formatters';
import { FileText, Plus, CheckCircle, Clock } from 'lucide-react';
import { QuotationsService } from '@/lib/services/quotations.service';
import { Quotation } from '@/types/quotation';
import { QuotationModal } from '@/components/quotations/QuotationModal';

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const data = await QuotationsService.listQuotations();
      setQuotations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  const handleStatusChange = async (id: string, status: Quotation['status']) => {
    await QuotationsService.updateQuotationStatus(id, status);
    fetchQuotations();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Quotations & Price Estimates
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Create and track client price quotes before converting into active production job orders.
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Create New Quotation
        </Button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-zinc-500">Loading quotations from database...</div>
      ) : quotations.length === 0 ? (
        <div className="p-12 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg text-center space-y-3">
          <FileText className="h-8 w-8 text-zinc-400 mx-auto" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">No Quotations Issued Yet</h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Issue formal quotation estimates to prospective customers before beginning CNC machining or 3D printing.
          </p>
          <Button size="sm" onClick={() => setIsModalOpen(true)}>
            Create First Quotation
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quotations.map((q) => (
            <Card key={q.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                  {q.quotationNumber}
                </span>
                <Badge
                  variant={
                    q.status === 'ACCEPTED'
                      ? 'success'
                      : q.status === 'REJECTED'
                      ? 'danger'
                      : 'secondary'
                  }
                >
                  {q.status}
                </Badge>
              </div>

              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{q.title}</h3>
                <p className="text-xs text-zinc-500 font-medium">{q.customerName}</p>
                {q.notes && <p className="text-[11px] text-zinc-400 mt-1 italic">{q.notes}</p>}
              </div>

              <div className="flex justify-between items-center text-xs pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-zinc-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Valid Until: {formatDate(q.validUntil)}
                </span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                  {formatLKR(q.totalLKR)}
                </span>
              </div>

              {q.status === 'SENT' && (
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-center text-xs text-emerald-500"
                    onClick={() => handleStatusChange(q.id, 'ACCEPTED')}
                  >
                    Mark Accepted
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full justify-center text-xs text-rose-500"
                    onClick={() => handleStatusChange(q.id, 'REJECTED')}
                  >
                    Mark Rejected
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <QuotationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchQuotations}
      />
    </div>
  );
}
