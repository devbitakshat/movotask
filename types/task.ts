export type Priority = 'low' | 'medium' | 'high';

export type TaskCategory = 'today' | 'overdue' | 'upcoming' | 'completed' | 'all';

export type TaskFilter = 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  due_date: string | null; // ISO Date string (YYYY-MM-DD)
  due_time?: string | null; // Time string (HH:mm:ss or HH:mm)
  priority: Priority;
  completed: boolean;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskDTO {
  title: string;
  description?: string | null;
  due_date?: string | null;
  due_time?: string | null;
  priority?: Priority;
  completed?: boolean;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string | null;
  due_date?: string | null;
  due_time?: string | null;
  priority?: Priority;
  completed?: boolean;
  completed_at?: string | null;
}

export interface TaskStats {
  total: number;
  completedToday: number;
  remainingToday: number;
  overdue: number;
  upcoming: number;
}
