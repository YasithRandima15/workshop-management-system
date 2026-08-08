'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { SeedService } from '@/lib/services/seed.service';
import { isFirebaseConfigured } from '@/lib/firebase/config';
import { Database, Shield, Sun, RefreshCw, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

export default function SettingsPage() {
  const { userProfile } = useAuth();
  const { theme, setTheme } = useTheme();
  const isFirebaseReady = isFirebaseConfigured();

  const [seedLoading, setSeedLoading] = useState(false);
  const [seedMessage, setSeedMessage] = useState<{ success: boolean; text: string } | null>(null);

  const handleSeedFirebase = async () => {
    setSeedLoading(true);
    setSeedMessage(null);
    try {
      const res = await SeedService.seedDatabaseToFirebase();
      setSeedMessage({ success: res.success, text: res.message });
    } catch (err: any) {
      setSeedMessage({ success: false, text: err.message || 'Seeding failed' });
    } finally {
      setSeedLoading(false);
    }
  };

  const handleResetCache = () => {
    if (confirm('Are you sure you want to reset local state cache? Page will reload.')) {
      SeedService.resetLocalStorage();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          System & Backend Infrastructure Settings
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Firebase credentials status, database initializers, and theme preferences.
        </p>
      </div>

      {/* Backend Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Database className="h-4 w-4 text-brand-500" /> Firebase Backend & Firestore DB
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-800">
            <div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                Connection Status:
              </span>
              <p className="text-zinc-500 mt-0.5">
                {isFirebaseReady
                  ? 'Firebase web client SDK active with environment keys'
                  : 'Operating in local mode. Add NEXT_PUBLIC_FIREBASE_* variables to .env.local for live cloud persistence.'}
              </p>
            </div>
            <div
              className={`px-3 py-1 rounded-full font-bold flex items-center gap-1.5 shrink-0 ${
                isFirebaseReady
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}
            >
              {isFirebaseReady ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" /> Firebase Live
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3.5 w-3.5" /> Demo Mode
                </>
              )}
            </div>
          </div>

          {seedMessage && (
            <div
              className={`p-3 rounded-lg flex items-center gap-2 ${
                seedMessage.success
                  ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                  : 'bg-red-950/60 border border-red-800 text-red-300'
              }`}
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{seedMessage.text}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              size="sm"
              isLoading={seedLoading}
              onClick={handleSeedFirebase}
              leftIcon={<Layers className="h-4 w-4" />}
            >
              Seed Manufacturing Materials & Machines to Firestore
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleResetCache}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              Clear Local Cache & Reset State
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Shield className="h-4 w-4 text-brand-500" /> Account & Role Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <p className="text-zinc-600 dark:text-zinc-400">
            Authenticated User:{' '}
            <strong className="text-zinc-900 dark:text-zinc-100">
              {userProfile?.displayName || 'Operator'}
            </strong>{' '}
            ({userProfile?.role || 'ADMIN'})
          </p>
          <p className="text-zinc-500">
            Firestore document rules enforce role validation for write/delete operations across collections.
          </p>
        </CardContent>
      </Card>

      {/* Appearance Preference Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Sun className="h-4 w-4 text-amber-500" /> Interface Theme
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-3">
          <Button
            variant={theme === 'dark' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTheme('dark')}
          >
            Dark Mode
          </Button>
          <Button
            variant={theme === 'light' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTheme('light')}
          >
            Light Mode
          </Button>
          <Button
            variant={theme === 'system' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setTheme('system')}
          >
            System Default
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
