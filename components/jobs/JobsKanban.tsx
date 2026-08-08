'use client';

import React from 'react';
import Link from 'next/link';
import { Job, JobStatus } from '@/types/job';
import { Badge } from '@/components/ui/Badge';
import { formatLKR, formatDate } from '@/lib/utils/formatters';
import { Printer, Cpu, Clock, Calendar, ArrowRight, DollarSign } from 'lucide-react';
import { JobsService } from '@/lib/services/jobs.service';

interface JobsKanbanProps {
  jobs: Job[];
  onJobStatusChange: () => void;
}

const KANBAN_COLUMNS: { id: JobStatus; title: string; color: string }[] = [
  { id: 'TO_BE_PRINTED', title: 'To Be Printed / Cut', color: 'border-t-zinc-400' },
  { id: 'PRINTING', title: '3D Printing', color: 'border-t-cyan-500' },
  { id: 'CNC_PROCESSING', title: 'CNC Machining', color: 'border-t-amber-500' },
  { id: 'FINISHING', title: 'Finishing & Sanding', color: 'border-t-violet-500' },
  { id: 'QUALITY_CHECK', title: 'Quality Check', color: 'border-t-blue-500' },
  { id: 'READY', title: 'Ready for Delivery', color: 'border-t-emerald-500' },
  { id: 'COMPLETED', title: 'Completed', color: 'border-t-zinc-700' },
];

export function JobsKanban({ jobs, onJobStatusChange }: JobsKanbanProps) {
  const handleMoveStatus = async (jobId: string, nextStatus: JobStatus) => {
    try {
      await JobsService.updateJobStatus(jobId, nextStatus);
      onJobStatusChange();
    } catch (err) {
      console.error('Failed to update job status', err);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 pt-1 min-h-[600px] select-none">
      {KANBAN_COLUMNS.map((col) => {
        const columnJobs = jobs.filter((j) => j.status === col.id);

        return (
          <div
            key={col.id}
            className={`w-72 shrink-0 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 rounded-lg p-3 space-y-3 flex flex-col border-t-2 ${col.color}`}
          >
            {/* Column Title */}
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                {col.title}
              </h3>
              <span className="text-[11px] font-mono font-bold text-zinc-500 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-zinc-200 dark:border-zinc-700">
                {columnJobs.length}
              </span>
            </div>

            {/* Column Cards */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh] pr-0.5">
              {columnJobs.length === 0 ? (
                <div className="h-24 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-md flex items-center justify-center text-xs text-zinc-400">
                  No jobs
                </div>
              ) : (
                columnJobs.map((job) => (
                  <div
                    key={job.id}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 space-y-2.5 shadow-xs hover:border-brand-500/50 transition-all group"
                  >
                    {/* Header: Job Number & Priority */}
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/jobs/${job.id}`}
                        className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 hover:underline"
                      >
                        {job.jobNumber}
                      </Link>
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
                    </div>

                    {/* Job Title & Customer */}
                    <div>
                      <Link
                        href={`/jobs/${job.id}`}
                        className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:text-brand-500 line-clamp-2"
                      >
                        {job.title}
                      </Link>
                      <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                        {job.customerName}
                      </p>
                    </div>

                    {/* Parts Breakdown & Icons */}
                    <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                      <div className="flex items-center gap-1.5">
                        {job.manufacturingTypes.includes('3D_PRINTING') && (
                          <span title="Contains 3D Printing">
                            <Printer className="h-3.5 w-3.5 text-cyan-500" />
                          </span>
                        )}
                        {job.manufacturingTypes.includes('CNC') && (
                          <span title="Contains CNC Machining">
                            <Cpu className="h-3.5 w-3.5 text-amber-500" />
                          </span>
                        )}
                        <span>{job.parts.length} parts</span>
                      </div>
                      <span className="font-mono font-bold text-zinc-900 dark:text-zinc-200">
                        {formatLKR(job.totalLKR)}
                      </span>
                    </div>

                    {/* Due Date & Quick Status Advance */}
                    <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {formatDate(job.dueDate)}
                      </span>

                      {/* Quick Move button */}
                      {col.id !== 'COMPLETED' && (
                        <button
                          onClick={() => {
                            const nextIdx = KANBAN_COLUMNS.findIndex((c) => c.id === col.id) + 1;
                            if (nextIdx < KANBAN_COLUMNS.length) {
                              handleMoveStatus(job.id, KANBAN_COLUMNS[nextIdx].id);
                            }
                          }}
                          className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 flex items-center gap-0.5 bg-zinc-50 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Next <ArrowRight className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
