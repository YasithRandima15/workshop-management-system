'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { JobsService } from '@/lib/services/jobs.service';
import { PaymentsService } from '@/lib/services/payments.service';
import { MaterialsService } from '@/lib/services/materials.service';
import { MachinesService } from '@/lib/services/machines.service';
import { Job, Payment, Material, Machine } from '@/types';
import { MetricsOverview } from '@/components/dashboard/MetricsOverview';
import { ProductionPipelineOverview } from '@/components/dashboard/ProductionPipelineOverview';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatLKR, formatDate } from '@/lib/utils/formatters';
import {
  AlertTriangle,
  Clock,
  ArrowRight,
  Plus,
  CheckCircle2,
  Printer,
  Cpu,
} from 'lucide-react';

export default function DashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [lowStock, setLowStock] = useState<Material[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [jList, pList, mList, macList] = await Promise.all([
          JobsService.listJobs(),
          PaymentsService.listPayments(),
          MaterialsService.getLowStockMaterials(),
          MachinesService.listMachines(),
        ]);
        setJobs(jList);
        setPayments(pList);
        setLowStock(mList);
        setMachines(macList);
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  // Compute live dashboard metrics
  const todayStr = new Date().toISOString().split('T')[0];
  const todayRevenue = payments
    .filter((p) => p.recordedAt.startsWith(todayStr))
    .reduce((sum, p) => sum + p.amountLKR, 0);

  const pendingPayments = jobs.reduce((sum, j) => sum + j.balanceLKR, 0);
  const activeJobs = jobs.filter(
    (j) => j.status !== 'COMPLETED' && j.status !== 'CANCELLED' && j.status !== 'QUOTATION'
  );
  const readyForDelivery = jobs.filter((j) => j.status === 'READY');

  const upcomingDeliveries = jobs
    .filter((j) => j.status !== 'COMPLETED' && j.status !== 'CANCELLED')
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Workshop Live Operations
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Real-time status overview for 3D printing & CNC production.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/jobs/new">
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
              Create New Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Metric Cards */}
      <MetricsOverview
        todayRevenueLKR={todayRevenue}
        pendingPaymentsLKR={pendingPayments}
        activeJobsCount={activeJobs.length}
        readyForDeliveryCount={readyForDelivery.length}
      />

      {/* Workshop Production Pipeline */}
      <ProductionPipelineOverview jobs={jobs} />

      {/* Grid Section: Upcoming Deliveries & Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Upcoming & Due Deliveries */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Job Deliveries</CardTitle>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Scheduled delivery deadlines for active workshop orders
                </p>
              </div>
              <Link href="/jobs" className="text-xs text-brand-600 dark:text-brand-400 hover:underline">
                View All Jobs
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs">
                {upcomingDeliveries.length === 0 ? (
                  <p className="p-4 text-center text-zinc-400">No active job deadlines</p>
                ) : (
                  upcomingDeliveries.map((j) => (
                    <div
                      key={j.id}
                      className="p-4 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
                            {j.jobNumber}
                          </span>
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                            {j.title}
                          </span>
                          <Badge variant="outline">{j.status.replace(/_/g, ' ')}</Badge>
                        </div>
                        <p className="text-zinc-500 text-[11px]">
                          Customer: {j.customerName} • {j.deliveryMethod}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="flex items-center gap-1 text-zinc-600 dark:text-zinc-300 font-mono font-semibold">
                          <Clock className="h-3.5 w-3.5 text-zinc-400" /> {formatDate(j.dueDate)}
                        </span>
                        <p className="text-[11px] font-mono font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
                          {formatLKR(j.totalLKR)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Material Alerts & Machine Cards */}
        <div className="space-y-6">
          {/* Low Stock Material Warnings */}
          <Card className="border-amber-200/80 dark:border-amber-900/40">
            <CardHeader className="p-4 border-b border-amber-100 dark:border-amber-950/40 bg-amber-50/30 dark:bg-amber-950/20">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-semibold text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Low Stock Inventory Alerts</span>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {lowStock.length === 0 ? (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>All material stocks are sufficient.</span>
                </div>
              ) : (
                lowStock.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-xs border-b border-zinc-100 dark:border-zinc-800 pb-2">
                    <div>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{m.name}</span>
                      <p className="text-[11px] text-zinc-500">Threshold: {m.minStockThreshold} {m.unit}</p>
                    </div>
                    <Badge variant="warning">
                      {m.currentStockQuantity} {m.unit}
                    </Badge>
                  </div>
                ))
              )}
              <Link href="/materials" className="inline-block text-xs text-brand-600 dark:text-brand-400 hover:underline pt-1">
                Manage Inventory →
              </Link>
            </CardContent>
          </Card>

          {/* Live Machines Summary */}
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-xs uppercase tracking-wider text-zinc-500">
                Machine Activity Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              {machines.map((mac) => (
                <div key={mac.id} className="p-2.5 bg-zinc-50 dark:bg-zinc-800/40 rounded-md border border-zinc-200/60 dark:border-zinc-700/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    {mac.type === '3D_PRINTER' ? (
                      <Printer className="h-4 w-4 text-cyan-500" />
                    ) : (
                      <Cpu className="h-4 w-4 text-amber-500" />
                    )}
                    <div>
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{mac.name}</p>
                      <p className="text-[10px] text-zinc-500 truncate max-w-[130px]">
                        {mac.currentJobTitle || 'Idle'}
                      </p>
                    </div>
                  </div>
                  <Badge variant={mac.status === 'RUNNING' ? 'success' : 'secondary'}>
                    {mac.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
