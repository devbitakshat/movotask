'use client';

import React, { useState } from 'react';
import { Sparkles, Calendar, Clock, Flag, Trash2, CheckCircle2, ListPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useTasks } from '@/providers/task-provider';
import { Priority, Task } from '@/types/task';
import { aiService } from '@/services/aiService';
import { getTodayDateString, getTomorrowDateString } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface TaskFormContentProps {
  initialTask: Task | null;
  onClose: () => void;
}

function TaskFormContent({ initialTask, onClose }: TaskFormContentProps) {
  const { createTask, updateTask, deleteTask, toggleComplete } = useTasks();
  const isEditing = initialTask !== null;

  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [dueDate, setDueDate] = useState<string>(
    initialTask ? initialTask.due_date || '' : getTodayDateString()
  );
  const [dueTime, setDueTime] = useState<string>(
    initialTask?.due_time ? initialTask.due_time.substring(0, 5) : ''
  );
  const [priority, setPriority] = useState<Priority>(initialTask?.priority || 'medium');
  const [suggestedSubtasks, setSuggestedSubtasks] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGenerateSuggestions = () => {
    if (!title.trim()) return;
    const subtasks = aiService.suggestSubtasks(title);
    setSuggestedSubtasks(subtasks);
  };

  const handleAddSubtaskToDescription = (subtask: string) => {
    setDescription((prev) => (prev ? `${prev}\n• ${subtask}` : `• ${subtask}`));
    setSuggestedSubtasks((prev) => prev.filter((s) => s !== subtask));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (isEditing && initialTask) {
        await updateTask(initialTask.id, {
          title: title.trim(),
          description: description.trim() || null,
          due_date: dueDate || null,
          due_time: dueTime ? `${dueTime}:00` : null,
          priority,
        });
      } else {
        await createTask({
          title: title.trim(),
          description: description.trim() || null,
          due_date: dueDate || null,
          due_time: dueTime ? `${dueTime}:00` : null,
          priority,
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!initialTask) return;
    setIsSubmitting(true);
    try {
      await deleteTask(initialTask.id);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <div className="flex items-center justify-between pr-6">
          <DialogTitle>
            {isEditing ? 'Task Details' : 'Create New Task'}
          </DialogTitle>
          {isEditing && (
            <Button
              type="button"
              variant={initialTask?.completed ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => {
                if (initialTask) toggleComplete(initialTask.id);
              }}
              className="gap-1.5 text-xs"
            >
              <CheckCircle2
                className={cn(
                  'h-3.5 w-3.5',
                  initialTask?.completed ? 'text-emerald-500' : 'text-gray-400'
                )}
              />
              {initialTask?.completed ? 'Completed' : 'Mark Done'}
            </Button>
          )}
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Title input */}
        <div>
          <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Title
          </label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="mt-1 font-medium"
            required
            autoFocus
          />
        </div>

        {/* Description input */}
        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Notes & Description
            </label>
            {title.trim().length > 3 && (
              <button
                type="button"
                onClick={handleGenerateSuggestions}
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
              >
                <Sparkles className="h-3 w-3" /> Suggest Steps
              </button>
            )}
          </div>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details, checklists, links, or context..."
            rows={3}
            className="mt-1"
          />
        </div>

        {/* AI Subtask Suggestions Chips */}
        {suggestedSubtasks.length > 0 && (
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 dark:border-blue-900/40 dark:bg-blue-950/20 animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
              <Sparkles className="h-3.5 w-3.5" /> AI Suggested Subtasks
            </div>
            <div className="mt-2 flex flex-col gap-1.5">
              {suggestedSubtasks.map((subtask, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg bg-white/80 px-2.5 py-1.5 text-xs text-gray-800 shadow-xs dark:bg-gray-900/80 dark:text-gray-200"
                >
                  <span className="truncate pr-2">{subtask}</span>
                  <button
                    type="button"
                    onClick={() => handleAddSubtaskToDescription(subtask)}
                    className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
                  >
                    <ListPlus className="h-3 w-3" /> Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Date and Time Row */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <Calendar className="h-3.5 w-3.5" /> Due Date
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 text-xs"
            />
            <div className="mt-1.5 flex gap-1">
              <button
                type="button"
                onClick={() => setDueDate(getTodayDateString())}
                className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setDueDate(getTomorrowDateString())}
                className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={() => setDueDate('')}
                className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400"
              >
                Clear
              </button>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              <Clock className="h-3.5 w-3.5" /> Due Time (Optional)
            </label>
            <Input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="mt-1 text-xs"
            />
          </div>
        </div>

        {/* Priority Selection */}
        <div>
          <label className="flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
            <Flag className="h-3.5 w-3.5" /> Priority
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['low', 'medium', 'high'] as Priority[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={cn(
                  'flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold capitalize transition-all',
                  priority === p
                    ? p === 'high'
                      ? 'border-rose-500 bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                      : p === 'medium'
                      ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                      : 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                    : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-400'
                )}
              >
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    p === 'high' ? 'bg-rose-500' : p === 'medium' ? 'bg-amber-500' : 'bg-blue-500'
                  )}
                />
                {p}
              </button>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t border-gray-100 dark:border-gray-800/80">
          {isEditing && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 gap-1 mr-auto"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!title.trim() || isSubmitting}
            className="font-semibold shadow-sm"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Task'}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function TaskModal() {
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    editingTask,
    setEditingTask,
  } = useTasks();

  const isOpen = isCreateModalOpen || editingTask !== null;

  const handleClose = () => {
    setIsCreateModalOpen(false);
    setEditingTask(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[500px]">
        {isOpen && (
          <TaskFormContent
            key={editingTask?.id ?? 'new-task'}
            initialTask={editingTask}
            onClose={handleClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
