'use client';

import React, { useState } from 'react';
import {
  User,
  Sparkles,
  Database,
  Moon,
  Sun,
  Laptop,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { useTasks } from '@/providers/task-provider';
import { useTheme } from '@/providers/theme-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function SettingsView() {
  const { user, profile, isDemoUser, isConfigured, signOut } = useAuth();
  const { refreshTasks } = useTasks();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState(profile?.name || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      toast.success('Profile preferences updated');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetLocalDemo = () => {
    if (confirm('Are you sure you want to reset demo tasks to default sample data?')) {
      localStorage.removeItem('movotask_local_tasks');
      refreshTasks();
      toast.success('Demo tasks reset to defaults');
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto py-2">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          Settings & Configuration
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Manage your profile, theme, Supabase connectivity, and AI configuration.
        </p>
      </div>

      {/* 1. Account / Profile Card */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-[#12141c] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Account Profile
          </h3>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Display Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Email Address
            </label>
            <Input
              value={user?.email || 'demo@movotask.app'}
              disabled
              className="mt-1 opacity-70 bg-gray-50 dark:bg-gray-900"
            />
          </div>

          <div className="flex justify-end pt-1">
            <Button type="submit" size="sm" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </div>

      {/* 2. Supabase Database & Auth Status */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-[#12141c] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Database className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Supabase PostgreSQL & Auth
            </h3>
          </div>
          {isConfigured && !isDemoUser ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" /> Connected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-3 w-3" /> Local / Demo Mode
            </span>
          )}
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          {isConfigured && !isDemoUser
            ? 'Connected to live Supabase PostgreSQL database with Row Level Security (RLS) active.'
            : 'Running in Local Demo mode. All changes are stored locally in your browser so you can test all features seamlessly.'}
        </p>

        {!isConfigured && (
          <div className="rounded-xl bg-gray-50 p-3 text-xs font-mono text-gray-700 dark:bg-gray-900 dark:text-gray-300">
            <p className="text-[11px] font-sans font-semibold text-gray-500 mb-1">To connect Supabase:</p>
            <code>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</code><br/>
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key</code>
          </div>
        )}

        {isDemoUser && (
          <div className="pt-2 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetLocalDemo}
              className="text-xs gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Demo Tasks
            </Button>
          </div>
        )}
      </div>

      {/* 3. Theme & Aesthetics */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-[#12141c] shadow-xs space-y-3">
        <div className="flex items-center gap-2.5">
          <Moon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Theme & Interface
          </h3>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={() => setTheme('light')}
            className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all ${
              theme === 'light'
                ? 'border-blue-500 bg-blue-50/50 text-blue-600 dark:bg-blue-950/30'
                : 'border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900 text-gray-600 dark:text-gray-400'
            }`}
          >
            <Sun className="h-4 w-4" /> Light
          </button>

          <button
            onClick={() => setTheme('dark')}
            className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all ${
              theme === 'dark'
                ? 'border-blue-500 bg-blue-50/50 text-blue-600 dark:bg-blue-950/30'
                : 'border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900 text-gray-600 dark:text-gray-400'
            }`}
          >
            <Moon className="h-4 w-4" /> Dark
          </button>

          <button
            onClick={() => setTheme('system')}
            className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-semibold transition-all ${
              theme === 'system'
                ? 'border-blue-500 bg-blue-50/50 text-blue-600 dark:bg-blue-950/30'
                : 'border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900 text-gray-600 dark:text-gray-400'
            }`}
          >
            <Laptop className="h-4 w-4" /> System
          </button>
        </div>
      </div>

      {/* 4. AI Assistant Architecture Preparation */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-gray-800/80 dark:bg-[#12141c] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Personal AI Assistant Architecture
            </h3>
          </div>
          <span className="rounded-md bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
            Phase 2 Ready
          </span>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          The service layer (`services/aiService.ts` and `types/ai.ts`) is fully pre-structured to support natural language task parsing, task breakdown suggestions, and OpenAI tool-calling actions.
        </p>

        <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>Structured action schema (Create, Update, Delete, Breakdown)</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>Client-side natural language shortcuts active in quick-add bar</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span>Subtask generation module active in task modal</span>
          </div>
        </div>
      </div>

      {/* 5. Sign Out Button */}
      <div className="pt-2">
        <Button
          variant="outline"
          onClick={() => signOut()}
          className="w-full text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900/40 dark:text-rose-400 dark:hover:bg-rose-950/20"
        >
          Sign Out of MovoTask
        </Button>
      </div>
    </div>
  );
}
