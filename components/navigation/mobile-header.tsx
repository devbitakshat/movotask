'use client';

import React from 'react';
import { CheckSquare, Moon, Sun, LogOut } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { useTheme } from '@/providers/theme-provider';

export function MobileHeader() {
  const { signOut, isDemoUser } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header className="flex md:hidden items-center justify-between border-b border-gray-200/80 bg-white/80 backdrop-blur-md px-4 py-3 dark:border-gray-800/80 dark:bg-[#0c0e14]/90 safe-top sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-xs">
          <CheckSquare className="h-4 w-4" />
        </div>
        <span className="text-sm font-bold tracking-tight text-gray-900 dark:text-white">
          MovoTask
        </span>
        {isDemoUser && (
          <span className="rounded-md bg-amber-500/10 px-1.5 py-0.2 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
            Demo
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          title="Toggle theme"
        >
          {resolvedTheme === 'dark' ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </button>

        <button
          onClick={() => signOut()}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
