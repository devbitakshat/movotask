'use client';

import React from 'react';
import { Clock, Calendar, Plus, CheckCircle2, Settings } from 'lucide-react';
import { useTasks } from '@/providers/task-provider';
import { TaskFilter } from '@/types/task';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const {
    activeFilter,
    setActiveFilter,
    activeSection,
    setActiveSection,
    setIsCreateModalOpen,
    todayTasks,
    overdueTasks,
  } = useTasks();

  const handleNavClick = (filter: TaskFilter) => {
    setActiveSection('tasks');
    setActiveFilter(filter);
  };

  const pendingToday = todayTasks.filter((t) => !t.completed).length;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass-panel border-t border-gray-200/80 dark:border-gray-800/80 safe-bottom">
      <div className="flex h-16 items-center justify-around px-3">
        {/* Today Tab */}
        <button
          onClick={() => handleNavClick('today')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 py-1 px-3 transition-colors relative',
            activeSection === 'tasks' && activeFilter === 'today'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
          )}
        >
          <Clock className="h-5 w-5" />
          <span className="text-[10px]">Today</span>
          {pendingToday > 0 && (
            <span className="absolute top-1 right-2 flex h-2 w-2 rounded-full bg-blue-500" />
          )}
        </button>

        {/* Upcoming Tab */}
        <button
          onClick={() => handleNavClick('upcoming')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 py-1 px-3 transition-colors',
            activeSection === 'tasks' && activeFilter === 'upcoming'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
          )}
        >
          <Calendar className="h-5 w-5" />
          <span className="text-[10px]">Upcoming</span>
        </button>

        {/* Center Floating Quick Add Button */}
        <div className="relative -top-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            aria-label="Add new task"
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-700 active:scale-95 transition-all"
          >
            <Plus className="h-6 w-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Completed Tab */}
        <button
          onClick={() => handleNavClick('completed')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 py-1 px-3 transition-colors',
            activeSection === 'tasks' && activeFilter === 'completed'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
          )}
        >
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-[10px]">Done</span>
        </button>

        {/* Settings Tab */}
        <button
          onClick={() => setActiveSection('settings')}
          className={cn(
            'flex flex-col items-center justify-center gap-1 py-1 px-3 transition-colors relative',
            activeSection === 'settings'
              ? 'text-blue-600 dark:text-blue-400 font-semibold'
              : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
          )}
        >
          <Settings className="h-5 w-5" />
          <span className="text-[10px]">Settings</span>
          {overdueTasks.length > 0 && (
            <span className="absolute top-1 right-2 flex h-2 w-2 rounded-full bg-rose-500" />
          )}
        </button>
      </div>
    </nav>
  );
}
