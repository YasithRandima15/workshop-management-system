import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 text-zinc-400 dark:text-zinc-500 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full h-10 px-3 py-2 text-sm bg-white dark:bg-zinc-900 border rounded-md transition-colors placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 disabled:opacity-50 text-zinc-900 dark:text-zinc-100',
              error ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500' : 'border-zinc-200 dark:border-zinc-800',
              leftIcon ? 'pl-9' : '',
              rightIcon ? 'pr-9' : '',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 text-zinc-400 dark:text-zinc-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-500 mt-1 font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
