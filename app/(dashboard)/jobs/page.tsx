'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Job, JobStatus, JobPriority, ManufacturingMethod } from '@/types/job';
import { JobsService } from '@/lib/services/jobs.service';
import { JobsKanban } from '@/components/jobs/JobsKanban';
import { JobsTable } from '@/components/jobs/JobsTable';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Plus, LayoutGrid, List, Search, Filter } from 'lucide-react';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');

  const loadJobs = async () => {
    const data = await JobsService.listJobs();
    setJobs(data);
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch =
      j.jobNumber.toLowerCase().includes(search.toLowerCase()) ||
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.customerName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || j.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || j.priority === priorityFilter;
    const matchesMethod =
      methodFilter === 'ALL' || j.manufacturingTypes.includes(methodFilter as ManufacturingMethod);

    return matchesSearch && matchesStatus && matchesPriority && matchesMethod;
  });

  return (
    <div className="space-y-6">
      {/* Top Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Job Orders & Production Pipeline
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Track 3D printing and CNC manufacturing orders from quotation to delivery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Switcher buttons */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <List className="h-3.5 w-3.5" /> Table
            </button>
          </div>

          <Link href="/jobs/new">
            <Button size="sm" leftIcon={<Plus className="h-4 w-4" />}>
              New Job Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
        <div className="sm:col-span-1">
          <Input
            placeholder="Search by JOB#, title, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Statuses' },
            { value: 'QUOTATION', label: 'Quotation' },
            { value: 'TO_BE_PRINTED', label: 'To Be Printed' },
            { value: 'PRINTING', label: '3D Printing' },
            { value: 'CNC_PROCESSING', label: 'CNC Processing' },
            { value: 'FINISHING', label: 'Finishing' },
            { value: 'QUALITY_CHECK', label: 'Quality Check' },
            { value: 'READY', label: 'Ready for Delivery' },
            { value: 'COMPLETED', label: 'Completed' },
          ]}
        />
        <Select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Priorities' },
            { value: 'URGENT', label: 'URGENT Express' },
            { value: 'HIGH', label: 'High Priority' },
            { value: 'NORMAL', label: 'Normal Priority' },
            { value: 'LOW', label: 'Low Priority' },
          ]}
        />
        <Select
          value={methodFilter}
          onChange={(e) => setMethodFilter(e.target.value)}
          options={[
            { value: 'ALL', label: 'All Manufacturing' },
            { value: '3D_PRINTING', label: '3D Printing Only' },
            { value: 'CNC', label: 'CNC Machining Only' },
          ]}
        />
      </div>

      {/* Main View Area */}
      {viewMode === 'kanban' ? (
        <JobsKanban jobs={filteredJobs} onJobStatusChange={loadJobs} />
      ) : (
        <JobsTable jobs={filteredJobs} />
      )}
    </div>
  );
}
