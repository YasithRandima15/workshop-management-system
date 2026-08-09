'use client';

import React from 'react';
import Link from 'next/link';
import { Job } from '@/types/job';
import { Badge } from '@/components/ui/Badge';
import { formatLKR, formatDate } from '@/lib/utils/formatters';
import { Printer, Cpu, Eye, Trash2 } from 'lucide-react';

interface JobsTableProps {
  jobs: Job[];
  onDeleteJob?: (id: string, jobNumber: string) => void;
}

export function JobsTable({ jobs, onDeleteJob }: JobsTableProps) {
  return (
    <div className="w-full overflow-x-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xs">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 font-semibold uppercase tracking-wider">
            <th className="p-3.5">Job Number</th>
            <th className="p-3.5">Title & Customer</th>
            <th className="p-3.5">Methods</th>
            <th className="p-3.5">Status</th>
            <th className="p-3.5">Priority</th>
            <th className="p-3.5 text-right">Total (LKR)</th>
            <th className="p-3.5 text-right">Payment</th>
            <th className="p-3.5">Due Date</th>
            <th className="p-3.5 text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
          {jobs.length === 0 ? (
            <tr>
              <td colSpan={9} className="p-8 text-center text-zinc-400">
                No job orders found matching criteria.
              </td>
            </tr>
          ) : (
            jobs.map((job) => (
              <tr
                key={job.id}
                className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors"
              >
                {/* Job Number */}
                <td className="p-3.5 font-mono font-bold text-brand-600 dark:text-brand-400">
                  <Link href={`/jobs/${job.id}`} className="hover:underline">
                    {job.jobNumber}
                  </Link>
                </td>

                {/* Title & Customer */}
                <td className="p-3.5">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-brand-500 line-clamp-1"
                  >
                    {job.title}
                  </Link>
                  <p className="text-[11px] text-zinc-500">{job.customerName}</p>
                </td>

                {/* Manufacturing Methods */}
                <td className="p-3.5">
                  <div className="flex items-center gap-1.5">
                    {job.manufacturingTypes.includes('3D_PRINTING') && (
                      <Badge variant="3dprint">
                        <Printer className="h-3 w-3 mr-0.5" /> 3D Print
                      </Badge>
                    )}
                    {job.manufacturingTypes.includes('CNC') && (
                      <Badge variant="cnc">
                        <Cpu className="h-3 w-3 mr-0.5" /> CNC
                      </Badge>
                    )}
                  </div>
                </td>

                {/* Status */}
                <td className="p-3.5">
                  <Badge variant="outline" className="font-semibold">
                    {job.status.replace(/_/g, ' ')}
                  </Badge>
                </td>

                {/* Priority */}
                <td className="p-3.5">
                  <Badge
                    variant={
                      job.priority === 'URGENT'
                        ? 'urgent'
                        : job.priority === 'HIGH'
                        ? 'danger'
                        : 'secondary'
                    }
                  >
                    {job.priority}
                  </Badge>
                </td>

                {/* Total */}
                <td className="p-3.5 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {formatLKR(job.totalLKR)}
                </td>

                {/* Payment Status */}
                <td className="p-3.5 text-right">
                  <Badge
                    variant={
                      job.paymentStatus === 'PAID'
                        ? 'success'
                        : job.paymentStatus === 'PARTIALLY_PAID'
                        ? 'warning'
                        : 'danger'
                    }
                  >
                    {job.paymentStatus === 'PAID'
                      ? 'PAID'
                      : job.paymentStatus === 'PARTIALLY_PAID'
                      ? `Bal: ${formatLKR(job.balanceLKR)}`
                      : 'UNPAID'}
                  </Badge>
                </td>

                {/* Due Date */}
                <td className="p-3.5 text-zinc-500 font-mono text-[11px]">
                  {formatDate(job.dueDate)}
                </td>

                {/* Action */}
                <td className="p-3.5 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      href={`/jobs/${job.id}`}
                      className="inline-flex items-center gap-1 p-1 text-zinc-500 hover:text-brand-500 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    {onDeleteJob && (
                      <button
                        onClick={() => onDeleteJob(job.id, job.jobNumber)}
                        className="p-1 text-zinc-400 hover:text-rose-500 transition-colors rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        title="Delete Job Order"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
