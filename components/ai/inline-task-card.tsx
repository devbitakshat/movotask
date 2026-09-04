'use client';

import React from 'react';
import { Check, Calendar, Edit3, Trash2 } from 'lucide-react';
import { Task } from '@/types/task';
import { useTasks } from '@/providers/task-provider';
import { cn, formatTaskDate, getPriorityStyles } from '@/lib/utils';

interface InlineTaskCardProps {
  task: Task;
}

export function InlineTaskCard({ task }: InlineTaskCardProps) {
  const { toggleComplete, setEditingTask, deleteTask } = useTasks();
  const priorityStyle = getPriorityStyles(task.priority);

  return (
    <div
      className={cn(
        'group my-2 flex flex-col gap-2.5 rounded-2xl border p-3.5 transition-all shadow-xs backdrop-blur-xs',
        task.completed
          ? 'border-emerald-200/80 bg-emerald-50/50 dark:border-emerald-900/50 dark:bg-emerald-950/20 opacity-80'
          : 'border-gray-200/80 bg-white/90 dark:border-gray-800/80 dark:bg-gray-900/80 hover:border-blue-300 dark:hover:border-blue-900'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Checkbox and Title */}
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => toggleComplete(task.id)}
            className={cn(
              'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-lg border transition-all',
              task.completed
                ? 'border-emerald-500 bg-emerald-500 text-white'
                : 'border-gray-300 hover:border-blue-500 dark:border-gray-600'
            )}
            title={task.completed ? 'Mark incomplete' : 'Mark complete'}
          >
            {task.completed && <Check className="h-3 w-3 stroke-[3]" />}
          </button>

          <div className="min-w-0 flex-1">
            <h4
              className={cn(
                'text-xs font-semibold leading-tight text-gray-900 dark:text-gray-100',
                task.completed && 'line-through text-gray-400 dark:text-gray-500'
              )}
            >
              {task.title}
            </h4>
            {task.description && (
              <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2">
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Priority Badge */}
        <span
          className={cn(
            'inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
            priorityStyle.badge
          )}
        >
          {task.priority}
        </span>
      </div>

      {/* Meta Bar: Date & Actions */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-[11px] text-gray-500 dark:border-gray-800/70 dark:text-gray-400">
        <div className="flex items-center gap-2">
          {task.due_date && (
            <span className="flex items-center gap-1 font-medium">
              <Calendar className="h-3 w-3 text-blue-500" />
              {formatTaskDate(task.due_date, task.due_time)}
            </span>
          )}
        </div>

        {/* Quick Edit & Delete */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
          <button
            onClick={() => setEditingTask(task)}
            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            title="Edit Task"
          >
            <Edit3 className="h-3 w-3" />
          </button>
          <button
            onClick={() => deleteTask(task.id)}
            className="rounded-md p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
            title="Delete Task"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
