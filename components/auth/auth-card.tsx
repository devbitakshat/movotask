'use client';

import React, { useState } from 'react';
import { CheckSquare, ArrowRight, Lock, Mail, User, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function AuthCard() {
  const { signIn, signUp, enterDemoMode } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
        toast.success('Welcome back to MovoTask!');
      } else {
        await signUp(email, password, name);
        toast.success('Account created successfully! Check your email if verification is required.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 mb-3">
          <CheckSquare className="h-6 w-6 stroke-[2.2]" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          MovoTask
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Your minimalist personal productivity assistant
        </p>
      </div>

      {/* Card */}
      <div className="rounded-3xl border border-gray-200/80 bg-white p-6 sm:p-8 shadow-xl shadow-gray-200/40 dark:border-gray-800/80 dark:bg-[#11131a] dark:shadow-none">
        {/* Tab Switcher */}
        <div className="grid grid-cols-2 rounded-xl bg-gray-100 p-1 mb-6 dark:bg-gray-900">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            className={`rounded-lg py-2 text-xs font-semibold transition-all ${
              mode === 'signin'
                ? 'bg-white text-gray-900 shadow-xs dark:bg-gray-800 dark:text-white'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`rounded-lg py-2 text-xs font-semibold transition-all ${
              mode === 'signup'
                ? 'bg-white text-gray-900 shadow-xs dark:bg-gray-800 dark:text-white'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMsg}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="pl-9 text-xs"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Email Address
            </label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="pl-9 text-xs"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Password
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-9 text-xs"
                minLength={6}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full font-semibold shadow-xs gap-1.5 mt-2"
          >
            {isLoading ? (
              'Processing...'
            ) : mode === 'signin' ? (
              <>
                Sign In <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                Create Account <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Demo Mode Action */}
        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800/80 text-center">
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2.5">
            Testing without a Supabase project?
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={enterDemoMode}
            className="w-full gap-1.5 text-xs font-medium border-dashed hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-500" />
            Explore in Instant Demo Mode
          </Button>
        </div>
      </div>
    </div>
  );
}
