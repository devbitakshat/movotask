'use client';

import React from 'react';
import { useTasks } from '@/providers/task-provider';
import { TaskFilter } from '@/types/task';
import { cn } from '@/lib/utils';

export function TaskFilters() {
  const { activeFilter, setActiveFilter, stats, overdueTasks, todayTasks, upcomingTasks, completedTasks } = useTasks();

  const filters: { id: TaskFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: stats.total },
    { id: 'today', label: 'Today', count: todayTasks.length },
    { id: 'overdue', label: 'Overdue', count: overdueTasks.length },
    { id: 'upcoming', label: 'Upcoming', count: upcomingTasks.length },
    { id: 'completed', label: 'Done', count: completedTasks.length },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar select-none">
      {filters.map((f) => {
        const isActive = activeFilter === f.id;
        return (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-150',
              isActive
                ? 'bg-blue-600 text-white shadow-xs dark:bg-blue-600'
                : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:bg-[#12141c] dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 border border-gray-200/80 dark:border-gray-800'
            )}
          >
            <span>{f.label}</span>
            {f.count > 0 && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.2 text-[10px] font-bold',
                  isActive
                    ? 'bg-white/20 text-white'
                    : f.id === 'overdue'
                    ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                )}
              >
                {f.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
