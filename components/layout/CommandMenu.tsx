'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Search, Briefcase, Users, Layers, Cpu, ArrowRight } from 'lucide-react';
import { JobsService } from '@/lib/services/jobs.service';
import { CustomersService } from '@/lib/services/customers.service';
import { Job, Customer } from '@/types';

export function CommandMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      JobsService.listJobs().then(setJobs);
      CustomersService.listCustomers().then(setCustomers);
    }
  }, [isOpen]);

  const filteredJobs = query.trim()
    ? jobs.filter(
        (j) =>
          j.jobNumber.toLowerCase().includes(query.toLowerCase()) ||
          j.title.toLowerCase().includes(query.toLowerCase()) ||
          j.customerName.toLowerCase().includes(query.toLowerCase())
      )
    : jobs.slice(0, 4);

  const filteredCustomers = query.trim()
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.customerCode.toLowerCase().includes(query.toLowerCase()) ||
          c.companyName?.toLowerCase().includes(query.toLowerCase())
      )
    : customers.slice(0, 4);

  const handleSelectJob = (id: string) => {
    onClose();
    router.push(`/jobs/${id}`);
  };

  const handleSelectCustomer = (id: string) => {
    onClose();
    router.push(`/customers`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="xl">
      <div className="space-y-4">
        {/* Search input bar */}
        <div className="relative flex items-center border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <Search className="h-5 w-5 text-zinc-400 mr-3" />
          <input
            type="text"
            autoFocus
            placeholder="Search Jobs (e.g. JOB-2026-0042), Customers, Materials..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none placeholder:text-zinc-400"
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
          {/* Jobs section */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase text-zinc-400 dark:text-zinc-500 mb-2 px-2 flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" /> Jobs
            </h4>
            {filteredJobs.length === 0 ? (
              <p className="text-xs text-zinc-400 px-2 py-1">No matching jobs</p>
            ) : (
              <div className="space-y-1">
                {filteredJobs.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => handleSelectJob(job.id)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/80 flex items-center justify-between transition-colors group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                          {job.jobNumber}
                        </span>
                        <span className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-xs">
                          {job.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {job.customerName} • {job.status.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Customers section */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase text-zinc-400 dark:text-zinc-500 mb-2 px-2 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" /> Customers
            </h4>
            {filteredCustomers.length === 0 ? (
              <p className="text-xs text-zinc-400 px-2 py-1">No matching customers</p>
            ) : (
              <div className="space-y-1">
                {filteredCustomers.map((cust) => (
                  <button
                    key={cust.id}
                    onClick={() => handleSelectCustomer(cust.id)}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800/80 flex items-center justify-between transition-colors group"
                  >
                    <div>
                      <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {cust.name} {cust.companyName ? `(${cust.companyName})` : ''}
                      </span>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {cust.customerCode} • {cust.phone}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
