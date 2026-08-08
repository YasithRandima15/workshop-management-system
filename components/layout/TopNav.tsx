'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Sun, Moon, Monitor, Menu, LogOut, User as UserIcon, Database } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/providers/ThemeProvider';
import { useAuth } from '@/providers/AuthProvider';
import { CommandMenu } from './CommandMenu';

export function TopNav({ onOpenMobileMenu }: { onOpenMobileMenu?: () => void }) {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { userProfile, logout, isFirebaseReady } = useAuth();
  const router = useRouter();

  // Keyboard shortcut listener for Ctrl+K and N
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      } else if (e.key.toLowerCase() === 'n' && !isCommandOpen) {
        e.preventDefault();
        router.push('/jobs/new');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandOpen, router]);

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Search Trigger & Mobile Toggle */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-md"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        <button
          onClick={() => setIsCommandOpen(true)}
          className="flex items-center gap-3 px-3 py-1.5 text-xs text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60 rounded-lg transition-colors w-44 sm:w-64 justify-between"
        >
          <div className="flex items-center gap-2">
            <Search className="h-3.5 w-3.5" />
            <span className="truncate">Search jobs, clients...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-500 dark:text-zinc-400">
            Ctrl K
          </kbd>
        </button>

        {/* Database Status Indicator */}
        <div
          title={isFirebaseReady ? 'Firebase Connected' : 'Demo Local Mode Active'}
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
            isFirebaseReady
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50'
              : 'bg-amber-950/40 text-amber-400 border-amber-800/50'
          }`}
        >
          <Database className="h-3 w-3 shrink-0" />
          <span>{isFirebaseReady ? 'Firebase Live' : 'Demo Mode'}</span>
        </div>
      </div>

      {/* Right: Theme Switcher, User & New Job Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          title={`Theme: ${theme}`}
          className="p-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          {theme === 'dark' ? (
            <Moon className="h-4 w-4 text-brand-400" />
          ) : theme === 'light' ? (
            <Sun className="h-4 w-4 text-amber-500" />
          ) : (
            <Monitor className="h-4 w-4 text-zinc-400" />
          )}
        </button>

        {userProfile && (
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-zinc-100 dark:bg-zinc-800/60 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs">
            <UserIcon className="h-3.5 w-3.5 text-brand-400" />
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[120px]">
              {userProfile.displayName}
            </span>
          </div>
        )}

        <Button
          onClick={() => router.push('/jobs/new')}
          size="sm"
          leftIcon={<Plus className="h-4 w-4" />}
          className="hidden sm:inline-flex"
        >
          New Job <span className="text-[10px] opacity-70 ml-1 font-mono">(N)</span>
        </Button>

        <button
          onClick={handleLogout}
          title="Sign Out"
          className="p-2 text-zinc-400 hover:text-rose-500 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>

      <CommandMenu isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
    </header>
  );
}
