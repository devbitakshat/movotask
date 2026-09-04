'use client';

import React from 'react';
import { CheckCircle2, Calendar, Sparkles, Inbox, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskFilter } from '@/types/task';
import { useTasks } from '@/providers/task-provider';

interface EmptyStateProps {
  filter: TaskFilter;
  searchQuery?: string;
}

export function EmptyState({ filter, searchQuery }: EmptyStateProps) {
  const { setIsCreateModalOpen, setSearchQuery } = useTasks();

  if (searchQuery) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center dark:border-gray-800 dark:bg-gray-900/20 my-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500">
          <Inbox className="h-6 w-6" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
          No tasks matching &quot;{searchQuery}&quot;
        </h3>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-sm">
          Try searching for a different keyword or clear your search query.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSearchQuery('')}
          className="mt-4 text-xs"
        >
          Clear search
        </Button>
      </div>
    );
  }

  const getContent = () => {
    switch (filter) {
      case 'today':
        return {
          icon: <CheckCircle2 className="h-7 w-7 text-emerald-500" />,
          title: 'All caught up for Today!',
          description: 'You have no pending tasks due today. Relax or plan ahead for tomorrow.',
          action: 'Plan a task',
        };
      case 'overdue':
        return {
          icon: <Sparkles className="h-7 w-7 text-blue-500" />,
          title: 'No overdue tasks',
          description: 'Awesome job! You have kept up with all your deadlines.',
          action: 'Add new task',
        };
      case 'upcoming':
        return {
          icon: <Calendar className="h-7 w-7 text-indigo-500" />,
          title: 'No upcoming tasks',
          description: 'Your future schedule is clear. Add items you need to accomplish later.',
          action: 'Schedule task',
        };
      case 'completed':
        return {
          icon: <CheckCircle2 className="h-7 w-7 text-gray-400" />,
          title: 'No completed tasks yet',
          description: 'Tasks you mark as done will appear here for your reference.',
          action: null,
        };
      default:
        return {
          icon: <Inbox className="h-7 w-7 text-blue-500" />,
          title: 'Your task list is empty',
          description: 'Start your productive day by adding your first task or goal.',
          action: 'Add your first task',
        };
    }
  };

  const content = getContent();

  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-gray-200/80 bg-white/40 p-10 text-center dark:border-gray-800/80 dark:bg-gray-900/10 my-4 transition-all">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100/80 dark:bg-gray-800/60 shadow-xs mb-1">
        {content.icon}
      </div>
      <h3 className="mt-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
        {content.title}
      </h3>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 max-w-sm">
        {content.description}
      </p>
      {content.action && (
        <Button
          size="sm"
          onClick={() => setIsCreateModalOpen(true)}
          className="mt-4 gap-1 text-xs font-semibold"
        >
          <Plus className="h-3.5 w-3.5" />
          {content.action}
        </Button>
      )}
    </div>
  );
}
