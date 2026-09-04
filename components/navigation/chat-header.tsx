'use client';

import React from 'react';
import { LayoutList, Moon, Sun, LogOut, AlertTriangle } from 'lucide-react';
import { SiriOrb } from '@/components/ai/siri-orb';
import { useAuth } from '@/providers/auth-provider';
import { useTasks } from '@/providers/task-provider';
import { useTheme } from '@/providers/theme-provider';
import { cn } from '@/lib/utils';

interface ChatHeaderProps {
  onOpenTaskDrawer: () => void;
}

export function ChatHeader({ onOpenTaskDrawer }: ChatHeaderProps) {
  const { signOut, isDemoUser, user } = useAuth();
  const { stats } = useTasks();
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-200/70 bg-white/75 px-4 py-2.5 backdrop-blur-xl dark:border-gray-800/70 dark:bg-[#0c0e14]/75 safe-top">
      {/* Brand & Model Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {/* Mini Siri Orb as Brand Icon */}
          <SiriOrb size="sm" />
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold tracking-tight text-gray-900 dark:text-white">
              MovoTask
            </span>
            <span className="rounded-md bg-linear-to-r from-blue-600 to-indigo-600 px-1.5 py-0.5 text-[10px] font-extrabold text-white">
              AI
            </span>
          </div>
        </div>

        {/* Gemini Active Model Indicator */}
        <div className="hidden items-center gap-1.5 rounded-full border border-gray-200/80 bg-gray-50/80 px-2.5 py-1 text-[11px] font-medium text-gray-600 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-300 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Gemini 3.6 Flash</span>
        </div>

        {isDemoUser && (
          <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
            Demo
          </span>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Task Hub Drawer Trigger Button */}
        <button
          onClick={onOpenTaskDrawer}
          className={cn(
            'flex items-center gap-2 rounded-2xl border px-3 py-1.5 text-xs font-semibold shadow-2xs transition-all active:scale-95',
            stats.overdue > 0
              ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300'
              : 'border-gray-200/80 bg-white hover:bg-gray-50 text-gray-800 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800'
          )}
          title="Open Task Hub (Ctrl+T)"
        >
          <LayoutList className="h-3.5 w-3.5 text-blue-500" />
          <span className="hidden xs:inline font-bold">Tasks</span>
          <span
            className={cn(
              'rounded-full px-1.5 py-0.2 text-[10px] font-bold',
              stats.overdue > 0
                ? 'bg-red-600 text-white'
                : 'bg-blue-600 text-white'
            )}
          >
            {stats.total}
          </span>
          {stats.overdue > 0 && (
            <span className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400">
              <AlertTriangle className="h-3 w-3" />
              <span>{stats.overdue}</span>
            </span>
          )}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
          title="Toggle theme"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        {/* User Sign Out */}
        <button
          onClick={() => signOut()}
          className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-gray-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
          title={`Sign out (${user?.email || 'Demo'})`}
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
