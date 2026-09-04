'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, AlertCircle, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { TaskItem } from './task-item';
import { EmptyState } from '../empty-states/empty-state';
import { Skeleton } from '../ui/skeleton';
import { useTasks } from '@/providers/task-provider';
import { cn } from '@/lib/utils';

export function TaskList() {
  const {
    tasks,
    filteredTasks,
    todayTasks,
    overdueTasks,
    upcomingTasks,
    completedTasks,
    activeFilter,
    searchQuery,
    isLoading,
  } = useTasks();

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    completed: true,
  });

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-3 pt-2">
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
      </div>
    );
  }

  // If a specific filter is selected or search query is active, render single flat list
  if (activeFilter !== 'all' || searchQuery.trim() !== '') {
    if (filteredTasks.length === 0) {
      return <EmptyState filter={activeFilter} searchQuery={searchQuery} />;
    }

    return (
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center justify-between pb-1">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {activeFilter} tasks ({filteredTasks.length})
          </span>
        </div>
        <div className="space-y-2.5">
          {filteredTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      </div>
    );
  }

  // Default Dashboard View: Grouped by Overdue, Today, Upcoming, and Completed
  const hasNoTasks = tasks.length === 0;

  if (hasNoTasks) {
    return <EmptyState filter="all" />;
  }

  const renderSectionHeader = (
    title: string,
    icon: React.ReactNode,
    count: number,
    sectionKey: string,
    badgeColor: string,
    isCollapsible: boolean = false
  ) => {
    const isCollapsed = collapsedSections[sectionKey];

    return (
      <div
        className={cn(
          'flex items-center justify-between py-2',
          isCollapsible && 'cursor-pointer select-none'
        )}
        onClick={() => isCollapsible && toggleSection(sectionKey)}
      >
        <div className="flex items-center gap-2">
          {isCollapsible && (
            <span className="text-gray-400">
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </span>
          )}
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
            {icon}
            <span>{title}</span>
          </div>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-bold',
              badgeColor
            )}
          >
            {count}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pt-2">
      {/* 1. OVERDUE SECTION (if any exist) */}
      {overdueTasks.length > 0 && (
        <section className="space-y-2">
          {renderSectionHeader(
            'Overdue',
            <AlertCircle className="h-3.5 w-3.5 text-rose-500" />,
            overdueTasks.length,
            'overdue',
            'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
          )}
          <div className="space-y-2.5">
            {overdueTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </section>
      )}

      {/* 2. TODAY SECTION */}
      <section className="space-y-2">
        {renderSectionHeader(
          'Today',
          <Clock className="h-3.5 w-3.5 text-blue-500" />,
          todayTasks.length,
          'today',
          'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
        )}

        {todayTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200/80 p-5 text-center dark:border-gray-800/80">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              No tasks scheduled for today. Add one above or plan ahead!
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {todayTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )}
      </section>

      {/* 3. UPCOMING SECTION */}
      {upcomingTasks.length > 0 && (
        <section className="space-y-2">
          {renderSectionHeader(
            'Upcoming',
            <Calendar className="h-3.5 w-3.5 text-indigo-500" />,
            upcomingTasks.length,
            'upcoming',
            'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
          )}
          <div className="space-y-2.5">
            {upcomingTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </section>
      )}

      {/* 4. COMPLETED SECTION */}
      {completedTasks.length > 0 && (
        <section className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-800/60">
          {renderSectionHeader(
            'Completed',
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
            completedTasks.length,
            'completed',
            'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300',
            true
          )}
          {!collapsedSections['completed'] && (
            <div className="space-y-2.5 pt-1 animate-in fade-in duration-200">
              {completedTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
