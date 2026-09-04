'use client';

import React, { useState } from 'react';
import { Plus, SlidersHorizontal, Calendar, Flag } from 'lucide-react';
import { useTasks } from '@/providers/task-provider';
import { Priority } from '@/types/task';
import { getTodayDateString, getTomorrowDateString } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function QuickAddTask() {
  const { createTask, quickAddTask, setIsCreateModalOpen } = useTasks();
  const [input, setInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<'today' | 'tomorrow' | 'none'>('today');
  const [selectedPriority, setSelectedPriority] = useState<Priority>('medium');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Check if user used natural language parsing or manual chips
      if (input.includes('tomorrow') || input.includes('urgent') || input.includes('at ') || input.includes('!')) {
        await quickAddTask(input);
      } else {
        let dueDate: string | null = null;
        if (selectedDate === 'today') dueDate = getTodayDateString();
        if (selectedDate === 'tomorrow') dueDate = getTomorrowDateString();

        await createTask({
          title: input.trim(),
          due_date: dueDate,
          priority: selectedPriority,
        });
      }
      setInput('');
      setIsExpanded(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'group relative rounded-2xl border transition-all duration-200 shadow-xs',
        'border-gray-200/90 bg-white dark:border-gray-800/90 dark:bg-[#12141c]',
        'focus-within:border-blue-500/80 focus-within:ring-2 focus-within:ring-blue-500/20 dark:focus-within:border-blue-500/60'
      )}
    >
      <div className="flex items-center px-3.5 py-2.5">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center text-blue-600 dark:text-blue-400">
          <Plus className="h-5 w-5" />
        </div>

        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            if (e.target.value.length > 0 && !isExpanded) {
              setIsExpanded(true);
            }
          }}
          onFocus={() => setIsExpanded(true)}
          placeholder="Add a new task... (e.g. 'Review design tomorrow at 4pm !high')"
          className="flex-1 bg-transparent px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-gray-100 dark:placeholder:text-gray-500"
          disabled={isSubmitting}
        />

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            title="Open detailed modal"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>

          <button
            type="submit"
            disabled={!input.trim() || isSubmitting}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 disabled:opacity-40 disabled:hover:bg-blue-600 transition-all active:scale-95"
          >
            {isSubmitting ? 'Adding...' : 'Add'}
          </button>
        </div>
      </div>

      {/* Expanded Quick Options */}
      {isExpanded && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 px-3.5 py-2 text-xs dark:border-gray-800/60 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex flex-wrap items-center gap-1.5">
            {/* Quick Date Presets */}
            <span className="text-gray-400 text-[11px] flex items-center gap-1 mr-1">
              <Calendar className="h-3 w-3" /> Due:
            </span>
            <button
              type="button"
              onClick={() => setSelectedDate('today')}
              className={cn(
                'rounded-lg px-2 py-0.5 text-[11px] font-medium transition-colors',
                selectedDate === 'today'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-semibold'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate('tomorrow')}
              className={cn(
                'rounded-lg px-2 py-0.5 text-[11px] font-medium transition-colors',
                selectedDate === 'tomorrow'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-semibold'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate('none')}
              className={cn(
                'rounded-lg px-2 py-0.5 text-[11px] font-medium transition-colors',
                selectedDate === 'none'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 font-semibold'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              No Date
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Priority Selector */}
            <span className="text-gray-400 text-[11px] flex items-center gap-1 mr-0.5">
              <Flag className="h-3 w-3" /> Priority:
            </span>
            {(['low', 'medium', 'high'] as Priority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setSelectedPriority(p)}
                className={cn(
                  'capitalize rounded-lg px-2 py-0.5 text-[11px] font-medium transition-colors',
                  selectedPriority === p
                    ? p === 'high'
                      ? 'bg-rose-50 text-rose-600 font-bold dark:bg-rose-950/40 dark:text-rose-400'
                      : p === 'medium'
                      ? 'bg-amber-50 text-amber-600 font-bold dark:bg-amber-950/40 dark:text-amber-400'
                      : 'bg-blue-50 text-blue-600 font-bold dark:bg-blue-950/40 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
