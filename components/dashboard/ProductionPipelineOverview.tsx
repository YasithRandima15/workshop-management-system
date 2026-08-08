'use client';

import React from 'react';
import Link from 'next/link';
import { Job, JobStatus } from '@/types/job';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { ArrowRight, Printer, Cpu } from 'lucide-react';

interface ProductionPipelineOverviewProps {
  jobs: Job[];
}

const PIPELINE_STAGES: { id: JobStatus; name: string }[] = [
  { id: 'TO_BE_PRINTED', name: 'To Be Printed' },
  { id: 'PRINTING', name: '3D Printing' },
  { id: 'CNC_PROCESSING', name: 'CNC Processing' },
  { id: 'FINISHING', name: 'Finishing' },
  { id: 'QUALITY_CHECK', name: 'Quality Check' },
  { id: 'READY', name: 'Ready' },
];

export function ProductionPipelineOverview({ jobs }: ProductionPipelineOverviewProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Workshop Production Pipeline</CardTitle>
          <p className="text-xs text-zinc-500 mt-0.5">
            Active jobs moving through 3D print and CNC machining stages
          </p>
        </div>
        <Link
          href="/jobs"
          className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
        >
          View Kanban <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {PIPELINE_STAGES.map((stage) => {
            const count = jobs.filter((j) => j.status === stage.id).length;
            return (
              <div
                key={stage.id}
                className="bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/70 dark:border-zinc-800 rounded-lg p-3 text-center space-y-1"
              >
                <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                  {stage.name}
                </span>
                <p className="text-xl font-extrabold font-mono text-zinc-900 dark:text-zinc-100">
                  {count}
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
