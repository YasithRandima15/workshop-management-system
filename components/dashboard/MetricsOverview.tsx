'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { formatLKR } from '@/lib/utils/formatters';
import { DollarSign, Clock, Briefcase, Truck, Layers, Cpu } from 'lucide-react';

interface MetricsOverviewProps {
  todayRevenueLKR: number;
  pendingPaymentsLKR: number;
  activeJobsCount: number;
  readyForDeliveryCount: number;
}

export function MetricsOverview({
  todayRevenueLKR,
  pendingPaymentsLKR,
  activeJobsCount,
  readyForDeliveryCount,
}: MetricsOverviewProps) {
  const metrics = [
    {
      title: "Today's Revenue",
      value: formatLKR(todayRevenueLKR),
      subtitle: 'Recorded payments today',
      icon: DollarSign,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900',
    },
    {
      title: 'Pending Payments',
      value: formatLKR(pendingPaymentsLKR),
      subtitle: 'Outstanding customer balance',
      icon: Clock,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-900',
    },
    {
      title: 'Active Jobs',
      value: activeJobsCount.toString(),
      subtitle: 'Currently in workshop pipeline',
      icon: Briefcase,
      color: 'text-brand-500 bg-brand-50 dark:bg-brand-950/60 border-brand-200 dark:border-brand-900',
    },
    {
      title: 'Ready for Delivery',
      value: readyForDeliveryCount.toString(),
      subtitle: 'Inspection done & packed',
      icon: Truck,
      color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/60 border-cyan-200 dark:border-cyan-900',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m) => {
        const Icon = m.icon;
        return (
          <Card key={m.title} className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                {m.title}
              </p>
              <h3 className="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
                {m.value}
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">{m.subtitle}</p>
            </div>
            <div className={`p-3 rounded-lg border ${m.color}`}>
              <Icon className="h-5 w-5" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
