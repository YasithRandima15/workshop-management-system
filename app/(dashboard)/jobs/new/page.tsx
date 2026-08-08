'use client';

import React from 'react';
import { NewJobWizard } from '@/components/jobs/NewJobWizard';

export default function NewJobPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Create New Workshop Job Order
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Fast progressive multi-step wizard for customer selection, part builder, parameters, and pricing.
        </p>
      </div>

      <NewJobWizard />
    </div>
  );
}
