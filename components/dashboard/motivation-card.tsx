'use client';

import React, { useState, useMemo } from 'react';
import { Sparkles, RefreshCw, X, Zap } from 'lucide-react';
import { useTasks } from '@/providers/task-provider';
import { aiService } from '@/services/aiService';

export function MotivationCard() {
  const { todayTasks, overdueTasks } = useTasks();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);

  const unfinishedToday = todayTasks.filter((t) => !t.completed).length;
  const overdueCount = overdueTasks.length;

  const motivation = useMemo(() => {
    // refreshKey is in dependencies to trigger new quote selection
    if (refreshKey >= 0) {
      return aiService.getMotivation(unfinishedToday, overdueCount);
    }
    return null;
  }, [unfinishedToday, overdueCount, refreshKey]);

  if (isDismissed || !motivation) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-blue-100 bg-linear-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 p-4 dark:border-blue-900/30 dark:from-blue-950/20 dark:via-indigo-950/20 dark:to-purple-950/20 shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
            {overdueCount > 0 ? (
              <Zap className="h-4 w-4" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-800 dark:text-gray-200 italic leading-relaxed">
              &ldquo;{motivation.quote}&rdquo;
            </p>
            {motivation.author && (
              <p className="mt-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                — {motivation.author}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            title="Get new thought"
            className="rounded-lg p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            title="Dismiss"
            className="rounded-lg p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
