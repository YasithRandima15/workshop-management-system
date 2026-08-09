'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Job, JobStatus, JobStatusHistory, Payment } from '@/types';
import { JobsService } from '@/lib/services/jobs.service';
import { PaymentsService } from '@/lib/services/payments.service';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { QuickPaymentModal } from '@/components/payments/QuickPaymentModal';
import { formatLKR, formatDate, formatDateTime, formatDurationMinutes } from '@/lib/utils/formatters';
import {
  ArrowLeft,
  Printer,
  Cpu,
  CreditCard,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  FileText,
  Trash2,
} from 'lucide-react';

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [history, setHistory] = useState<JobStatusHistory[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const loadJobData = async () => {
    if (!jobId) return;
    try {
      const [jData, hData, pData] = await Promise.all([
        JobsService.getJobById(jobId),
        JobsService.getJobHistory(jobId),
        PaymentsService.getPaymentsForJob(jobId),
      ]);
      setJob(jData);
      setHistory(hData);
      setPayments(pData);
    } catch (err) {
      console.error('Failed to load job details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobData();
  }, [jobId]);

  const handleStatusChange = async (newStatus: JobStatus) => {
    if (!job) return;
    try {
      const updated = await JobsService.updateJobStatus(job.id, newStatus);
      setJob(updated);
      const hData = await JobsService.getJobHistory(job.id);
      setHistory(hData);
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-zinc-400">Loading job details...</div>
    );
  }

  const handleDeleteJob = async () => {
    if (!job) return;
    if (confirm(`Are you sure you want to delete job ${job.jobNumber}? This operation cannot be undone.`)) {
      await JobsService.deleteJob(job.id);
      router.push('/jobs');
    }
  };

  if (!job) {
    return (
      <div className="p-8 text-center space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Job Not Found</h2>
        <Button onClick={() => router.push('/jobs')} variant="outline">
          Back to Jobs List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/jobs">
            <button className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <ArrowLeft className="h-5 w-5" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-extrabold font-mono text-brand-600 dark:text-brand-400">
                {job.jobNumber}
              </h1>
              <Badge variant={job.priority === 'URGENT' ? 'urgent' : 'secondary'}>
                {job.priority} Priority
              </Badge>
              <Badge variant="outline" className="font-bold">
                {job.status.replace(/_/g, ' ')}
              </Badge>
            </div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {job.title}
            </h2>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-3">
          {job.balanceLKR > 0 && (
            <Button
              onClick={() => setIsPaymentModalOpen(true)}
              size="sm"
              leftIcon={<CreditCard className="h-4 w-4" />}
            >
              Record Payment
            </Button>
          )}

          <Button
            onClick={handleDeleteJob}
            size="sm"
            variant="outline"
            className="text-rose-500 hover:text-rose-600 border-rose-200 dark:border-rose-900/60"
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Delete Job
          </Button>

          {/* Quick Status Selector dropdown */}
          <Select
            value={job.status}
            onChange={(e) => handleStatusChange(e.target.value as JobStatus)}
            options={[
              { value: 'QUOTATION', label: 'Status: Quotation' },
              { value: 'ORDER_CONFIRMED', label: 'Status: Order Confirmed' },
              { value: 'TO_BE_PRINTED', label: 'Status: To Be Printed' },
              { value: 'PRINTING', label: 'Status: 3D Printing' },
              { value: 'CNC_PROCESSING', label: 'Status: CNC Processing' },
              { value: 'FINISHING', label: 'Status: Finishing' },
              { value: 'QUALITY_CHECK', label: 'Status: Quality Check' },
              { value: 'READY', label: 'Status: Ready for Delivery' },
              { value: 'COMPLETED', label: 'Status: Completed' },
            ]}
          />
        </div>
      </div>

      {/* Main Details Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Parts & Specifications */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Parts Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Job Parts & Technical Parameters ({job.parts.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {job.parts.map((part, index) => (
                <div
                  key={part.id}
                  className="bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/60 rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-700/60 pb-2">
                    <div className="flex items-center gap-2">
                      {part.manufacturingMethod === '3D_PRINTING' ? (
                        <Printer className="h-4 w-4 text-cyan-500" />
                      ) : (
                        <Cpu className="h-4 w-4 text-amber-500" />
                      )}
                      <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {part.partName}
                      </span>
                    </div>
                    <Badge variant={part.manufacturingMethod === '3D_PRINTING' ? '3dprint' : 'cnc'}>
                      {part.manufacturingMethod === '3D_PRINTING' ? '3D Print' : 'CNC Machining'}
                    </Badge>
                  </div>

                  {/* 3D Printing Parameters Spec */}
                  {part.manufacturingMethod === '3D_PRINTING' && part.printDetails && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white dark:bg-zinc-900 p-3 rounded border border-zinc-100 dark:border-zinc-800">
                      <div>
                        <span className="text-zinc-400 text-[10px] uppercase font-bold">Material</span>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {part.printDetails.materialName} ({part.printDetails.color || 'Black'})
                        </p>
                      </div>
                      <div>
                        <span className="text-zinc-400 text-[10px] uppercase font-bold">Est. Weight</span>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                          {part.printDetails.filamentWeightGrams} g
                        </p>
                      </div>
                      <div>
                        <span className="text-zinc-400 text-[10px] uppercase font-bold">Print Duration</span>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                          {formatDurationMinutes(part.printDetails.estimatedPrintMinutes)}
                        </p>
                      </div>
                      <div>
                        <span className="text-zinc-400 text-[10px] uppercase font-bold">Layer / Infill</span>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                          {part.printDetails.layerHeightMm || 0.2}mm • {part.printDetails.infillPercentage || 20}%
                        </p>
                      </div>
                    </div>
                  )}

                  {/* CNC Parameters Spec */}
                  {part.manufacturingMethod === 'CNC' && part.cncDetails && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white dark:bg-zinc-900 p-3 rounded border border-zinc-100 dark:border-zinc-800">
                      <div>
                        <span className="text-zinc-400 text-[10px] uppercase font-bold">Wood / Material</span>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {part.cncDetails.woodType} ({part.cncDetails.thicknessMm}mm)
                        </p>
                      </div>
                      <div>
                        <span className="text-zinc-400 text-[10px] uppercase font-bold">Dimensions</span>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                          {part.cncDetails.lengthMm} × {part.cncDetails.widthMm} mm
                        </p>
                      </div>
                      <div>
                        <span className="text-zinc-400 text-[10px] uppercase font-bold">Machining Time</span>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                          {formatDurationMinutes(part.cncDetails.estimatedMachiningMinutes)}
                        </p>
                      </div>
                      <div>
                        <span className="text-zinc-400 text-[10px] uppercase font-bold">Material Cost</span>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 font-mono">
                          {formatLKR(part.cncDetails.materialCostLKR)}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-zinc-500">Quantity: {part.quantity} units</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                      {formatLKR(part.totalPriceLKR)}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Production Timeline History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-brand-500" /> Production & Status Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
                {history.map((h) => (
                  <div key={h.id} className="relative text-xs space-y-0.5">
                    <div className="absolute -left-6 top-0.5 h-3 w-3 rounded-full bg-brand-500 border-2 border-white dark:border-zinc-900" />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">
                        {h.newStatus.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {formatDateTime(h.timestamp)}
                      </span>
                    </div>
                    <p className="text-zinc-500">{h.note}</p>
                    <p className="text-[10px] text-zinc-400 font-mono">By: {h.changedByName}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Column: Customer Info & Financial Timeline */}
        <div className="space-y-6">
          {/* Financial Breakdown Card */}
          <Card className="border-brand-500/30">
            <CardHeader className="p-4 bg-brand-500/10 border-b border-brand-500/20">
              <CardTitle className="text-xs uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Financial Breakdown & Payment Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>Parts Subtotal:</span>
                <span className="font-mono">{formatLKR(job.subtotalLKR)}</span>
              </div>
              {job.discountLKR > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Discount:</span>
                  <span className="font-mono">- {formatLKR(job.discountLKR)}</span>
                </div>
              )}
              {job.deliveryFeeLKR > 0 && (
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Delivery Fee:</span>
                  <span className="font-mono">+ {formatLKR(job.deliveryFeeLKR)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-sm text-zinc-900 dark:text-zinc-100 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span>Total Amount:</span>
                <span className="font-mono text-brand-600 dark:text-brand-400">
                  {formatLKR(job.totalLKR)}
                </span>
              </div>

              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-md space-y-1.5 mt-2">
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Paid so far:</span>
                  <span className="font-mono">{formatLKR(job.paidAmountLKR)}</span>
                </div>
                <div className="flex justify-between text-rose-600 dark:text-rose-400 font-bold">
                  <span>Remaining Balance:</span>
                  <span className="font-mono">{formatLKR(job.balanceLKR)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Receipts History */}
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-xs uppercase tracking-wider text-zinc-500 flex items-center justify-between">
                <span>Payment History</span>
                <Badge variant={job.paymentStatus === 'PAID' ? 'success' : 'warning'}>
                  {job.paymentStatus}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              {payments.length === 0 ? (
                <p className="text-xs text-zinc-400">No payments recorded yet.</p>
              ) : (
                payments.map((p) => (
                  <div
                    key={p.id}
                    className="p-2.5 bg-zinc-50 dark:bg-zinc-800/40 rounded border border-zinc-100 dark:border-zinc-800 text-xs space-y-1"
                  >
                    <div className="flex justify-between font-bold">
                      <span className="font-mono text-brand-600 dark:text-brand-400">{p.paymentNumber}</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400">
                        {formatLKR(p.amountLKR)}
                      </span>
                    </div>
                    <p className="text-zinc-500 text-[11px]">
                      Method: {p.paymentMethod} {p.referenceNumber ? `(${p.referenceNumber})` : ''}
                    </p>
                    <p className="text-[10px] text-zinc-400 font-mono">{formatDateTime(p.recordedAt)}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Customer Profile Card */}
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-xs uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <User className="h-4 w-4" /> Customer Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-2 text-xs">
              <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                {job.customerName}
              </h4>
              <p className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <Phone className="h-3.5 w-3.5 text-zinc-400" /> {job.customerPhone || 'N/A'}
              </p>
              <p className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <Mail className="h-3.5 w-3.5 text-zinc-400" /> {job.customerEmail || 'N/A'}
              </p>
              <p className="flex items-start gap-2 text-zinc-600 dark:text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0 mt-0.5" />
                <span>{job.deliveryAddress || 'Workshop Pickup'}</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Payment Modal Dialog */}
      <QuickPaymentModal
        job={job}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onPaymentSuccess={loadJobData}
      />
    </div>
  );
}
