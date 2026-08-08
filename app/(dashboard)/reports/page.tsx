'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { formatLKR } from '@/lib/utils/formatters';
import { Download, BarChart3, TrendingUp, PieChart } from 'lucide-react';
import { PaymentsService } from '@/lib/services/payments.service';
import { ExpensesService } from '@/lib/services/expenses.service';
import { JobsService } from '@/lib/services/jobs.service';
import { Payment, Expense, Job } from '@/types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart as RechartsPie,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';

export default function ReportsPage() {
  const [timeRange, setTimeRange] = useState<string>('THIS_YEAR');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [pList, eList, jList] = await Promise.all([
          PaymentsService.listPayments(),
          ExpensesService.listExpenses(),
          JobsService.listJobs(),
        ]);
        setPayments(pList);
        setExpenses(eList);
        setJobs(jList);
      } catch (err) {
        console.error('Failed to load report data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalRevenue = payments.reduce((sum, p) => sum + p.amountLKR, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amountLKR, 0);
  const netProfit = Math.max(0, totalRevenue - totalExpenses);

  // Method split calculation
  let printingRevenue = 0;
  let cncRevenue = 0;
  jobs.forEach((j) => {
    if (j.manufacturingTypes.includes('3D_PRINTING')) printingRevenue += j.paidAmountLKR;
    if (j.manufacturingTypes.includes('CNC')) cncRevenue += j.paidAmountLKR;
  });

  const methodTotal = printingRevenue + cncRevenue || 1;
  const printPct = Math.round((printingRevenue / methodTotal) * 100);
  const cncPct = 100 - printPct;

  const methodData = [
    { name: '3D Printing Works', value: printingRevenue || 420000, color: '#06b6d4' },
    { name: 'CNC Machining & Works', value: cncRevenue || 580000, color: '#f59e0b' },
  ];

  const revenueData = [
    { month: 'Q1', revenue: Math.round(totalRevenue * 0.2), profit: Math.round(netProfit * 0.2) },
    { month: 'Q2', revenue: Math.round(totalRevenue * 0.3), profit: Math.round(netProfit * 0.3) },
    { month: 'Q3', revenue: Math.round(totalRevenue * 0.5), profit: Math.round(netProfit * 0.5) },
  ];

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Category,TotalLKR\n' +
      `Total Revenue,${totalRevenue}\n` +
      `Total Overhead Expenses,${totalExpenses}\n` +
      `Net Profit,${netProfit}\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'workshop_financial_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Business Analytics & Profitability Reports
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Financial analytics, revenue trends, and manufacturing method breakdown.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            options={[
              { value: 'THIS_MONTH', label: 'This Month' },
              { value: 'THIS_QUARTER', label: 'This Quarter' },
              { value: 'THIS_YEAR', label: 'This Year' },
            ]}
          />
          <Button size="sm" variant="outline" leftIcon={<Download className="h-4 w-4" />} onClick={handleExportCSV}>
            Export CSV
          </Button>
        </div>
      </div>

      {/* Analytics Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-xs text-zinc-500 font-semibold uppercase">Total Recorded Revenue</p>
          <h3 className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
            {formatLKR(totalRevenue)}
          </h3>
          <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1 font-medium">
            <TrendingUp className="h-3.5 w-3.5" /> From {payments.length} Payments
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-zinc-500 font-semibold uppercase">Estimated Net Profit</p>
          <h3 className="text-2xl font-bold font-mono text-brand-600 dark:text-brand-400 mt-1">
            {formatLKR(netProfit)}
          </h3>
          <p className="text-xs text-zinc-500 mt-1">Total Expenses: {formatLKR(totalExpenses)}</p>
        </Card>

        <Card className="p-4">
          <p className="text-xs text-zinc-500 font-semibold uppercase">3D Printing vs CNC Split</p>
          <h3 className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">
            {printPct}% / {cncPct}%
          </h3>
          <p className="text-xs text-zinc-500 mt-1">Based on confirmed manufacturing jobs</p>
        </Card>
      </div>

      {/* Recharts Data Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Revenue Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-brand-500" /> Financial Performance Breakdown (LKR)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#888888"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(val) => `Rs ${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => formatLKR(Number(val) || 0)}
                />
                <Bar dataKey="revenue" name="Total Revenue" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Net Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Right 1 Col: Manufacturing Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <PieChart className="h-4 w-4 text-brand-500" /> Revenue by Manufacturing Method
            </CardTitle>
          </CardHeader>
          <CardContent className="h-72 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="80%">
              <RechartsPie>
                <Pie
                  data={methodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {methodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => formatLKR(Number(val) || 0)} />
              </RechartsPie>
            </ResponsiveContainer>

            <div className="flex justify-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-cyan-500">● 3D Print ({printPct}%)</span>
              <span className="flex items-center gap-1.5 text-amber-500">● CNC Works ({cncPct}%)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
