'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { PricingService, ElectricityBillCalculation } from '@/lib/services/pricing.service';
import { ExpensesService } from '@/lib/services/expenses.service';
import { JobsService } from '@/lib/services/jobs.service';
import { Job } from '@/types/job';
import { formatLKR } from '@/lib/utils/formatters';
import { Zap, Printer, Cpu, CheckCircle2, RefreshCw } from 'lucide-react';

interface ElectricityBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ElectricityBillModal({ isOpen, onClose, onSuccess }: ElectricityBillModalProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [unitRate, setUnitRate] = useState<number>(30);
  const [isLogging, setIsLogging] = useState<boolean>(false);
  const [logSuccess, setLogSuccess] = useState<boolean>(false);

  // Manual hours override option if user wants to tweak
  const [manualPrintHours, setManualPrintHours] = useState<number | null>(null);
  const [manualCncHours, setManualCncHours] = useState<number | null>(null);

  const loadJobsAndCalculate = async () => {
    setLoading(true);
    try {
      const data = await JobsService.listJobs();
      setJobs(data);
    } catch (err) {
      console.error('Failed to fetch jobs for electricity calculation', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadJobsAndCalculate();
    }
  }, [isOpen]);

  // Compute electricity bill automatically from jobs
  const autoBill = PricingService.calculateElectricityBillFromJobs(jobs, unitRate);

  const finalPrintHours = manualPrintHours !== null ? manualPrintHours : autoBill.printingHours;
  const finalCncHours = manualCncHours !== null ? manualCncHours : autoBill.cncHours;

  const bill: ElectricityBillCalculation = PricingService.calculateElectricityBill(
    finalPrintHours,
    finalCncHours,
    unitRate
  );

  const handleLogAsExpense = async () => {
    setIsLogging(true);
    setLogSuccess(false);
    try {
      const monthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
      await ExpensesService.createExpense({
        category: 'UTILITIES',
        categoryName: 'Electricity & Factory Utilities',
        description: `Monthly Light Bill (${monthName}) - Auto-calculated from ${jobs.length} Jobs (${bill.totalUnits} Units @ Rs ${bill.unitRateLKR}/unit)`,
        amountLKR: bill.totalBillLKR,
        date: new Date().toISOString().split('T')[0],
        loggedBy: 'usr-1',
        loggedByName: 'Operator',
      });

      setIsLogging(false);
      setLogSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        setLogSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
      setIsLogging(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Automatic Monthly Light Bill Calculator"
      description="Automatically calculates factory electricity bill from active 3D printing and CNC job hours in database."
    >
      <div className="space-y-4">
        {/* Source indicator pill */}
        <div className="flex items-center justify-between p-2.5 bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/60 rounded-lg text-xs">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500 shrink-0" />
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              {loading
                ? 'Scanning active workshop jobs...'
                : `Calculated from ${jobs.length} Job Orders in database`}
            </span>
          </div>
          <button
            onClick={loadJobsAndCalculate}
            className="p-1 text-zinc-500 hover:text-brand-600 rounded transition-colors"
            title="Recalculate from Jobs"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Rate Configuration Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <span className="text-zinc-400 font-bold block">1 Electricity Unit</span>
            <span className="text-sm font-mono font-extrabold text-brand-600 dark:text-brand-400">
              Rs. {unitRate} / kWh
            </span>
          </div>

          <div className="p-3 bg-cyan-50/50 dark:bg-cyan-950/30 rounded-lg border border-cyan-200/60 dark:border-cyan-900/50">
            <span className="text-cyan-700 dark:text-cyan-400 font-bold flex items-center gap-1">
              <Printer className="h-3.5 w-3.5" /> 3D Printing Rate
            </span>
            <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300 font-semibold">
              0.1 units/hr (Rs. 3/hr)
            </span>
          </div>

          <div className="p-3 bg-amber-50/50 dark:bg-amber-950/30 rounded-lg border border-amber-200/60 dark:border-amber-900/50">
            <span className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1">
              <Cpu className="h-3.5 w-3.5" /> CNC Machining Rate
            </span>
            <span className="text-xs font-mono text-zinc-700 dark:text-zinc-300 font-semibold">
              0.3 units/hr (Rs. 9/hr)
            </span>
          </div>
        </div>

        {/* Operating Hours Input Fields (Auto-filled from Jobs) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Auto 3D Print Hours (from Jobs)"
            type="number"
            value={finalPrintHours}
            onChange={(e) => setManualPrintHours(parseFloat(e.target.value) || 0)}
          />
          <Input
            label="Auto CNC Machining Hours (from Jobs)"
            type="number"
            value={finalCncHours}
            onChange={(e) => setManualCncHours(parseFloat(e.target.value) || 0)}
          />
          <Input
            label="Unit Rate (LKR / kWh)"
            type="number"
            value={unitRate}
            onChange={(e) => setUnitRate(parseFloat(e.target.value) || 0)}
          />
        </div>

        {/* Calculation Result Summary Card */}
        <div className="p-4 bg-zinc-900 text-white rounded-lg space-y-3 shadow-lg">
          <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-800">
            <span>Power Consumption Breakdown</span>
            <span>Total Units (kWh)</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-cyan-400 font-mono">
              <span>● 3D Printers ({bill.printingHours} hrs × 0.1 units):</span>
              <span>{bill.printUnits} units ({formatLKR(bill.printCostLKR)})</span>
            </div>
            <div className="flex justify-between items-center text-amber-400 font-mono">
              <span>● CNC Machines ({bill.cncHours} hrs × 0.3 units):</span>
              <span>{bill.cncUnits} units ({formatLKR(bill.cncCostLKR)})</span>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-800 flex justify-between items-center">
            <div>
              <span className="text-xs text-zinc-400 block">Total Power Units Consumed:</span>
              <span className="text-sm font-mono font-bold text-zinc-200">
                {bill.totalUnits} Units
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-400 block">Est. Monthly Light Bill:</span>
              <span className="text-xl font-mono font-black text-emerald-400">
                {formatLKR(bill.totalBillLKR)}
              </span>
            </div>
          </div>
        </div>

        {logSuccess && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-lg text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>Monthly light bill expense of {formatLKR(bill.totalBillLKR)} logged successfully!</span>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            type="button"
            isLoading={isLogging}
            onClick={handleLogAsExpense}
            leftIcon={<Zap className="h-4 w-4 text-amber-400" />}
          >
            Log as Monthly Expense ({formatLKR(bill.totalBillLKR)})
          </Button>
        </div>
      </div>
    </Modal>
  );
}
