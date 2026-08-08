import React, { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, children, id, ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'w-full h-10 pl-3 pr-8 py-2 text-sm bg-white dark:bg-zinc-900 border rounded-md appearance-none transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 disabled:opacity-50 text-zinc-900 dark:text-zinc-100',
              error ? 'border-red-500' : 'border-zinc-200 dark:border-zinc-800',
              className
            )}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDown className="absolute right-3 h-4 w-4 text-zinc-400 pointer-events-none" />
        </div>
        {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
