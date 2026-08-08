'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Cpu, Printer, Lock, Mail, User as UserIcon, AlertCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithEmail, signupWithEmail, loginWithGoogle, isFirebaseReady } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        await loginWithEmail(email, password);
      } else {
        if (!displayName.trim()) {
          setError('Please enter your full name');
          setLoading(false);
          return;
        }
        await signupWithEmail(email, password, displayName, 'OPERATOR');
      }
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Authentication failed. Please check credentials.');
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Google Sign-In failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Header Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 shadow-xl">
            <Printer className="h-4 w-4 text-cyan-400" />
            <Cpu className="h-4 w-4 text-amber-400" />
            <span>Precision Labs SaaS</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Workshop Operating System
          </h1>
          <p className="text-xs text-zinc-400">
            Real-time management for 3D Printing & CNC Machining
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-zinc-900/90 backdrop-blur-md border border-zinc-800 p-6 rounded-xl shadow-2xl space-y-5">
          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-zinc-950 rounded-lg border border-zinc-800 text-xs font-medium text-center">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`py-1.5 rounded-md transition-all ${
                mode === 'signin'
                  ? 'bg-brand-600 text-white font-bold shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`py-1.5 rounded-md transition-all ${
                mode === 'signup'
                  ? 'bg-brand-600 text-white font-bold shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Register Account
            </button>
          </div>

          {!isFirebaseReady && (
            <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-lg text-xs text-amber-300">
              <span className="font-bold">Demo Mode Active:</span> Firebase API keys not set in environment. Clicking Sign In will log you in with default Admin permissions.
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-950/50 border border-red-800 rounded-lg text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <Input
                label="Full Name *"
                placeholder="e.g. Ruwan Perera"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                leftIcon={<UserIcon className="h-4 w-4 text-zinc-400" />}
                required
              />
            )}

            <Input
              label="Email Address *"
              type="email"
              placeholder="operator@precisionlabs.lk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="h-4 w-4 text-zinc-400" />}
              required
            />

            <Input
              label="Password *"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="h-4 w-4 text-zinc-400" />}
              required
            />

            <Button
              type="submit"
              className="w-full justify-center"
              isLoading={loading}
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              {mode === 'signin' ? 'Sign In to Dashboard' : 'Create Operator Account'}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider font-semibold">
              <span className="bg-zinc-900 px-2 text-zinc-500">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full justify-center text-xs"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            Google Workspace Sign-In
          </Button>
        </div>

        <p className="text-center text-[11px] text-zinc-500">
          Powered by Firebase Authentication & Firestore DB
        </p>
      </div>
    </div>
  );
}
