import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isBefore, isToday as dateFnsIsToday, parseISO, startOfDay } from 'date-fns';
import { Priority, Task } from '@/types/task';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns today's date formatted as YYYY-MM-DD
 */
export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Returns tomorrow's date formatted as YYYY-MM-DD
 */
export function getTomorrowDateString(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return format(tomorrow, 'yyyy-MM-dd');
}

/**
 * Checks if a YYYY-MM-DD string is today
 */
export function isTaskToday(dateString?: string | null): boolean {
  if (!dateString) return false;
  try {
    const parsed = parseISO(dateString);
    return dateFnsIsToday(parsed);
  } catch {
    return false;
  }
}

/**
 * Checks if a task is overdue (due before today and not completed)
 */
export function isTaskOverdue(dateString?: string | null, completed: boolean = false): boolean {
  if (completed || !dateString) return false;
  try {
    const taskDate = startOfDay(parseISO(dateString));
    const today = startOfDay(new Date());
    return isBefore(taskDate, today);
  } catch {
    return false;
  }
}

/**
 * Checks if a task is upcoming (due after today and not completed)
 */
export function isTaskUpcoming(dateString?: string | null, completed: boolean = false): boolean {
  if (completed) return false;
  if (!dateString) return false;
  try {
    const taskDate = startOfDay(parseISO(dateString));
    const today = startOfDay(new Date());
    return taskDate.getTime() > today.getTime();
  } catch {
    return false;
  }
}

/**
 * Format a due date for user-friendly display
 */
export function formatTaskDate(dateString?: string | null, timeString?: string | null): string {
  if (!dateString) return '';
  try {
    const parsed = parseISO(dateString);
    let dateFormatted = '';

    if (dateFnsIsToday(parsed)) {
      dateFormatted = 'Today';
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (format(parsed, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd')) {
        dateFormatted = 'Tomorrow';
      } else if (parsed.getFullYear() === new Date().getFullYear()) {
        dateFormatted = format(parsed, 'MMM d');
      } else {
        dateFormatted = format(parsed, 'MMM d, yyyy');
      }
    }

    if (timeString) {
      // timeString format could be "14:30:00" or "14:30"
      const [hours, minutes] = timeString.split(':');
      if (hours && minutes) {
        const d = new Date();
        d.setHours(parseInt(hours, 10), parseInt(minutes, 10));
        return `${dateFormatted} at ${format(d, 'h:mm a')}`;
      }
    }

    return dateFormatted;
  } catch {
    return dateString || '';
  }
}

/**
 * Priority color styling mapping
 */
export function getPriorityStyles(priority: Priority): {
  badge: string;
  dot: string;
  label: string;
} {
  switch (priority) {
    case 'high':
      return {
        badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        dot: 'bg-rose-500',
        label: 'High',
      };
    case 'medium':
      return {
        badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        dot: 'bg-amber-500',
        label: 'Medium',
      };
    case 'low':
    default:
      return {
        badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        dot: 'bg-blue-500',
        label: 'Low',
      };
  }
}

/**
 * Sort tasks logically:
 * 1. Incomplete first, completed last
 * 2. Overdue first
 * 3. Priority (High -> Medium -> Low)
 * 4. Due Date ascending
 */
export function sortTasks(tasks: Task[]): Task[] {
  const priorityWeight: Record<Priority, number> = {
    high: 3,
    medium: 2,
    low: 1,
  };

  return [...tasks].sort((a, b) => {
    // 1. Completion status
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }

    // 2. Overdue status (incomplete overdue tasks higher)
    if (!a.completed) {
      const aOverdue = isTaskOverdue(a.due_date, false);
      const bOverdue = isTaskOverdue(b.due_date, false);
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
    }

    // 3. Priority weight
    const weightDiff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
    if (weightDiff !== 0) return weightDiff;

    // 4. Due date
    if (a.due_date && b.due_date) {
      if (a.due_date !== b.due_date) {
        return a.due_date.localeCompare(b.due_date);
      }
      if (a.due_time && b.due_time) {
        return a.due_time.localeCompare(b.due_time);
      }
    } else if (a.due_date && !b.due_date) {
      return -1;
    } else if (!a.due_date && b.due_date) {
      return 1;
    }

    // 5. Created at fallback
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
