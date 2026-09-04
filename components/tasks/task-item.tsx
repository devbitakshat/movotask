'use client';

import React from 'react';
import { Check, Calendar, MoreVertical, Trash2, Edit3, AlertCircle } from 'lucide-react';
import { Priority, Task } from '@/types/task';
import { useTasks } from '@/providers/task-provider';
import { formatTaskDate, getPriorityStyles, isTaskOverdue } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const { toggleComplete, deleteTask, setEditingTask, updateTask } = useTasks();
  const isOverdue = isTaskOverdue(task.due_date, task.completed);
  const priorityStyle = getPriorityStyles(task.priority);
  const [showActions, setShowActions] = React.useState(false);

  const handlePriorityCycle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cycle: Record<Priority, Priority> = {
      low: 'medium',
      medium: 'high',
      high: 'low',
    };
    updateTask(task.id, { priority: cycle[task.priority] });
  };

  return (
    <div
      className={cn(
        'group relative flex items-start gap-3 rounded-2xl border p-3.5 sm:p-4 transition-all duration-200',
        task.completed
          ? 'border-gray-100 bg-gray-50/50 opacity-65 dark:border-gray-900 dark:bg-gray-950/30'
          : 'border-gray-200/80 bg-white shadow-xs hover:border-gray-300 hover:shadow-sm dark:border-gray-800/80 dark:bg-[#12141c] dark:hover:border-gray-700/80'
      )}
    >
      {/* Custom Checkbox */}
      <button
        onClick={() => toggleComplete(task.id)}
        aria-label={task.completed ? 'Mark task incomplete' : 'Mark task complete'}
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900',
          task.completed
            ? 'border-emerald-500 bg-emerald-500 text-white dark:border-emerald-500 dark:bg-emerald-500'
            : 'border-gray-300 bg-white hover:border-blue-500 hover:bg-blue-50/40 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-400'
        )}
      >
        {task.completed && <Check className="h-3.5 w-3.5 stroke-[2.5]" />}
      </button>

      {/* Task Content */}
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => setEditingTask(task)}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <p
            className={cn(
              'text-sm font-medium leading-snug break-words transition-all duration-150',
              task.completed
                ? 'text-gray-400 line-through dark:text-gray-500'
                : 'text-gray-900 dark:text-gray-100'
            )}
          >
            {task.title}
          </p>
        </div>

        {task.description && (
          <p
            className={cn(
              'mt-1 text-xs line-clamp-2 leading-relaxed break-words',
              task.completed
                ? 'text-gray-400/80 line-through dark:text-gray-600'
                : 'text-gray-500 dark:text-gray-400'
            )}
          >
            {task.description}
          </p>
        )}

        {/* Badges & Meta Info */}
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          {/* Priority Pill */}
          <button
            onClick={handlePriorityCycle}
            title="Click to cycle priority"
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium transition-colors hover:opacity-80',
              priorityStyle.badge
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full', priorityStyle.dot)} />
            {priorityStyle.label}
          </button>

          {/* Due Date & Time Badge */}
          {task.due_date && (
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium',
                isOverdue
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800/80 dark:text-gray-300'
              )}
            >
              {isOverdue ? (
                <AlertCircle className="h-3 w-3 text-rose-500" />
              ) : (
                <Calendar className="h-3 w-3 text-gray-400" />
              )}
              {formatTaskDate(task.due_date, task.due_time)}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons (Desktop hover / Mobile tap) */}
      <div className="relative flex items-center gap-1">
        {/* Desktop Quick Actions */}
        <div className="hidden items-center gap-1 sm:flex opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setEditingTask(task)}
            title="Edit task"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => deleteTask(task.id)}
            title="Delete task"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30 dark:hover:text-rose-400 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile Quick Dropdown */}
        <div className="sm:hidden relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            className="rounded-lg p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {showActions && (
            <div
              className="absolute right-0 top-8 z-30 flex flex-col rounded-xl border border-gray-200 bg-white p-1 shadow-lg dark:border-gray-800 dark:bg-gray-900 min-w-[120px]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setShowActions(false);
                  setEditingTask(task);
                }}
                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 text-left"
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit
              </button>
              <button
                onClick={() => {
                  setShowActions(false);
                  deleteTask(task.id);
                }}
                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 text-left"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
