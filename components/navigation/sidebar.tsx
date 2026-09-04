'use client';

import React from 'react';
import {
  CheckCircle2,
  Calendar,
  Clock,
  AlertCircle,
  Settings,
  LogOut,
  Sun,
  Moon,
  LayoutGrid,
  CheckSquare,
} from 'lucide-react';
import { useTasks } from '@/providers/task-provider';
import { useAuth } from '@/providers/auth-provider';
import { useTheme } from '@/providers/theme-provider';
import { TaskFilter } from '@/types/task';
import { cn } from '@/lib/utils';

export function Sidebar() {
  const {
    activeFilter,
    setActiveFilter,
    activeSection,
    setActiveSection,
    todayTasks,
    overdueTasks,
    upcomingTasks,
    completedTasks,
    stats,
  } = useTasks();
  const { user, profile, signOut, isDemoUser } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  const navItems: {
    id: TaskFilter;
    label: string;
    icon: React.ReactNode;
    count: number;
    highlight?: boolean;
  }[] = [
    {
      id: 'all',
      label: 'Dashboard',
      icon: <LayoutGrid className="h-4 w-4" />,
      count: stats.total,
    },
    {
      id: 'today',
      label: 'Today',
      icon: <Clock className="h-4 w-4" />,
      count: todayTasks.filter((t) => !t.completed).length,
    },
    {
      id: 'upcoming',
      label: 'Upcoming',
      icon: <Calendar className="h-4 w-4" />,
      count: upcomingTasks.length,
    },
    {
      id: 'overdue',
      label: 'Overdue',
      icon: <AlertCircle className="h-4 w-4" />,
      count: overdueTasks.length,
      highlight: overdueTasks.length > 0,
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: <CheckCircle2 className="h-4 w-4" />,
      count: completedTasks.length,
    },
  ];

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col justify-between border-r border-gray-200/80 bg-white/70 backdrop-blur-md p-4 dark:border-gray-800/80 dark:bg-[#0c0e14]/90 select-none">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-gray-900 dark:text-white">
                MovoTask
              </span>
              <span className="ml-1.5 rounded-md bg-blue-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                AI MVP
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            Task Views
          </p>
          <div className="mt-2 space-y-1">
            {navItems.map((item) => {
              const isActive = activeSection === 'tasks' && activeFilter === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection('tasks');
                    setActiveFilter(item.id);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150',
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-xs dark:bg-blue-950/40 dark:text-blue-400'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/60 dark:hover:text-gray-200'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-blue-600 dark:text-blue-400' : ''}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.count > 0 && (
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-bold',
                        item.highlight
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                          : isActive
                          ? 'bg-blue-200/50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                      )}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Settings View Button */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            System
          </p>
          <button
            onClick={() => setActiveSection('settings')}
            className={cn(
              'flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150',
              activeSection === 'settings'
                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800/60 dark:hover:text-gray-200'
            )}
          >
            <div className="flex items-center gap-2.5">
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </div>
            {isDemoUser && (
              <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                Demo
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Footer / User Profile & Actions */}
      <div className="space-y-3 border-t border-gray-100 pt-3 dark:border-gray-800/80">
        {/* Theme Toggle & Demo indicator */}
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Appearance</span>
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100 transition-colors"
            title="Toggle theme"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* User Card & Logout */}
        <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-2.5 dark:bg-gray-900/60">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xs">
              {(profile?.name || user?.email || 'U')[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-gray-900 dark:text-gray-100">
                {profile?.name || 'User'}
              </p>
              <p className="truncate text-[10px] text-gray-500 dark:text-gray-400">
                {user?.email || 'demo@movotask.app'}
              </p>
            </div>
          </div>

          <button
            onClick={() => signOut()}
            title="Sign out"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-200/60 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
