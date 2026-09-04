'use client';

import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useTasks } from '@/providers/task-provider';
import { cn } from '@/lib/utils';

export function SummaryMetrics() {
  const { stats, todayTasks, overdueTasks, setActiveFilter } = useTasks();

  const totalToday = todayTasks.length;
  const completedToday = todayTasks.filter((t) => t.completed).length;
  const progressPercent = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 100;

  return (
    <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
      {/* Today Progress Card */}
      <div
        onClick={() => setActiveFilter('today')}
        className="cursor-pointer rounded-2xl border border-gray-200/80 bg-white p-3.5 shadow-xs transition-all hover:border-gray-300 dark:border-gray-800/80 dark:bg-[#12141c] dark:hover:border-gray-700"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Today
          </span>
          <Clock className="h-3.5 w-3.5 text-blue-500" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {completedToday}/{totalToday}
          </span>
          <span className="text-[11px] font-medium text-gray-400">done</span>
        </div>
        {/* Progress Bar */}
        <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${totalToday === 0 ? 0 : progressPercent}%` }}
          />
        </div>
      </div>

      {/* Overdue Card */}
      <div
        onClick={() => setActiveFilter('overdue')}
        className="cursor-pointer rounded-2xl border border-gray-200/80 bg-white p-3.5 shadow-xs transition-all hover:border-gray-300 dark:border-gray-800/80 dark:bg-[#12141c] dark:hover:border-gray-700"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Overdue
          </span>
          <AlertCircle className={cn('h-3.5 w-3.5', overdueTasks.length > 0 ? 'text-rose-500' : 'text-gray-400')} />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span
            className={cn(
              'text-xl sm:text-2xl font-bold tracking-tight',
              overdueTasks.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-900 dark:text-gray-100'
            )}
          >
            {overdueTasks.length}
          </span>
          <span className="text-[11px] font-medium text-gray-400">tasks</span>
        </div>
        <div className="mt-2.5">
          <span className={cn('text-[11px] font-medium', overdueTasks.length > 0 ? 'text-rose-500' : 'text-emerald-500')}>
            {overdueTasks.length > 0 ? 'Needs attention' : 'All clear'}
          </span>
        </div>
      </div>

      {/* Completed All-time / Today Card */}
      <div
        onClick={() => setActiveFilter('completed')}
        className="cursor-pointer rounded-2xl border border-gray-200/80 bg-white p-3.5 shadow-xs transition-all hover:border-gray-300 dark:border-gray-800/80 dark:bg-[#12141c] dark:hover:border-gray-700"
      >
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Completed
          </span>
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            {stats.completedToday}
          </span>
          <span className="text-[11px] font-medium text-gray-400">today</span>
        </div>
        <div className="mt-2.5">
          <span className="text-[11px] font-medium text-emerald-500">
            {progressPercent}% completed
          </span>
        </div>
      </div>
    </div>
  );
}
