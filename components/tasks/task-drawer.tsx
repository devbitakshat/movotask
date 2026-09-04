'use client';

import React, { useEffect } from 'react';
import { X, Plus, CheckCircle2, Clock, AlertTriangle, Search } from 'lucide-react';
import { useTasks } from '@/providers/task-provider';
import { TaskList } from './task-list';
import { QuickAddTask } from './quick-add-task';
import { TaskFilters } from './task-filters';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TaskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TaskDrawer({ isOpen, onClose }: TaskDrawerProps) {
  const {
    stats,
    todayTasks,
    completedTasks,
    setIsCreateModalOpen,
    searchQuery,
    setSearchQuery,
  } = useTasks();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background body scroll when open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-[#0f1118] border-l border-gray-200/80 dark:border-gray-800/80',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Drawer Top Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              Task Hub
            </h2>
            <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <span>{stats.total} total</span>
            </div>
            {stats.overdue > 0 && (
              <div className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600 dark:bg-red-950/40 dark:text-red-400">
                <AlertTriangle className="h-3 w-3" />
                <span>{stats.overdue} overdue</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => setIsCreateModalOpen(true)}
              className="h-8 gap-1 rounded-xl bg-blue-600 px-3 text-xs font-medium text-white shadow-sm hover:bg-blue-700"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New</span>
            </Button>
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              title="Close (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Metric Overview Strip */}
        <div className="grid grid-cols-3 gap-2 border-b border-gray-100 bg-gray-50/50 p-3 text-center dark:border-gray-800/80 dark:bg-gray-900/40">
          <div className="flex flex-col items-center justify-center rounded-xl bg-white p-2 shadow-2xs dark:bg-gray-800/60">
            <div className="flex items-center gap-1 text-[11px] font-medium text-gray-500 dark:text-gray-400">
              <Clock className="h-3 w-3 text-blue-500" />
              <span>Today</span>
            </div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {stats.completedToday}/{todayTasks.length}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl bg-white p-2 shadow-2xs dark:bg-gray-800/60">
            <div className="flex items-center gap-1 text-[11px] font-medium text-gray-500 dark:text-gray-400">
              <AlertTriangle className="h-3 w-3 text-rose-500" />
              <span>Overdue</span>
            </div>
            <span
              className={cn(
                'text-sm font-bold',
                stats.overdue > 0
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-gray-900 dark:text-white'
              )}
            >
              {stats.overdue}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center rounded-xl bg-white p-2 shadow-2xs dark:bg-gray-800/60">
            <div className="flex items-center gap-1 text-[11px] font-medium text-gray-500 dark:text-gray-400">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
              <span>Done</span>
            </div>
            <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {completedTasks.length}
            </span>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="space-y-2.5 border-b border-gray-100 p-4 dark:border-gray-800/80">
          {/* Quick Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-3 text-xs text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-hidden dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-100 dark:focus:bg-gray-900"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                ×
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <TaskFilters />
        </div>

        {/* Scrollable Tasks Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {/* Quick Add Bar */}
          <QuickAddTask />

          {/* Categorized / Filtered Task List */}
          <TaskList />
        </div>
      </aside>
    </>
  );
}
