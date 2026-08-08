'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Box,
  Layers,
  Cpu,
  CreditCard,
  FileText,
  DollarSign,
  BarChart3,
  Settings,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { userProfile } = useAuth();
  const displayName = userProfile?.displayName || 'Workshop Operator';
  const role = userProfile?.role || 'ADMIN';

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Jobs', href: '/jobs', icon: Briefcase },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Products Catalog', href: '/products', icon: Box },
    { name: 'Materials & Inventory', href: '/materials', icon: Layers },
    { name: 'Machines & Maintenance', href: '/machines', icon: Cpu },
    { name: 'Payments', href: '/payments', icon: CreditCard },
    { name: 'Quotations', href: '/quotations', icon: FileText },
    { name: 'Expenses', href: '/expenses', icon: DollarSign },
    { name: 'Reports & Analytics', href: '/reports', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={cn(
        'w-64 bg-zinc-900 border-r border-zinc-800 text-zinc-300 flex flex-col justify-between h-screen sticky top-0 z-30 select-none',
        className
      )}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 flex items-center px-5 border-b border-zinc-800 gap-3">
          <div className="h-9 w-9 rounded-lg bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-400">
            <Printer className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-zinc-100 tracking-tight leading-tight">
              PRECISION LABS
            </h1>
            <p className="text-[10px] text-zinc-500 tracking-wider font-semibold uppercase">
              3D Print & CNC Works
            </p>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-zinc-800 text-zinc-100 font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn('h-4 w-4', isActive ? 'text-brand-400' : 'text-zinc-500')} />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight className="h-3.5 w-3.5 text-zinc-500" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Profile Badge at bottom */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-950/40">
        <div className="flex items-center gap-3 px-2 py-1.5">
          <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-200 uppercase">
            {displayName.slice(0, 2)}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-medium text-zinc-200 truncate">{displayName}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wide font-mono">{role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
