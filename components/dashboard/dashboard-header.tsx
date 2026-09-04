'use client';

import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { Search, Plus, Sparkles, X } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider';
import { useTasks } from '@/providers/task-provider';
import { Button } from '@/components/ui/button';
import { TaskFilters } from '../tasks/task-filters';

export function DashboardHeader() {
  const { user, profile } = useAuth();
  const { searchQuery, setSearchQuery, setIsCreateModalOpen } = useTasks();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const formattedDate = useMemo(() => {
    return format(new Date(), 'EEEE, MMMM d');
  }, []);

  const displayName = profile?.name || user?.email?.split('@')[0] || 'there';

  return (
    <div className="space-y-4">
      {/* Top Welcome Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              {greeting}, {displayName}
            </h1>
            <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
            {formattedDate}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            size="sm"
            className="gap-1.5 rounded-xl font-semibold shadow-xs"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Task</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Search and Filter Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="h-9 w-full rounded-xl border border-gray-200 bg-white pl-9 pr-8 text-xs text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-800 dark:bg-[#12141c] dark:text-gray-100 dark:placeholder:text-gray-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="shrink-0">
          <TaskFilters />
        </div>
      </div>
    </div>
  );
}
