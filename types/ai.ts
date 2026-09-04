import { Priority } from './task';

export type AIActionType =
  | 'CREATE_TASK'
  | 'UPDATE_TASK'
  | 'DELETE_TASK'
  | 'BREAKDOWN_TASK'
  | 'PRIORITIZE_TASKS'
  | 'DAILY_MOTIVATION';

export interface CreateTaskActionPayload {
  title: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  priority?: Priority;
}

export interface UpdateTaskActionPayload {
  taskId: string;
  title?: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  priority?: Priority;
  completed?: boolean;
}

export interface DeleteTaskActionPayload {
  taskId: string;
}

export interface BreakdownTaskActionPayload {
  taskId: string;
  subtasks: Array<{
    title: string;
    priority?: Priority;
    dueDate?: string;
  }>;
}

export type AIAction =
  | { type: 'CREATE_TASK'; payload: CreateTaskActionPayload }
  | { type: 'UPDATE_TASK'; payload: UpdateTaskActionPayload }
  | { type: 'DELETE_TASK'; payload: DeleteTaskActionPayload }
  | { type: 'BREAKDOWN_TASK'; payload: BreakdownTaskActionPayload };

export interface AIResponse {
  message: string;
  action?: AIAction;
  suggestions?: string[];
}

export interface AIMotivation {
  quote: string;
  author?: string;
  context: 'overdue' | 'productive' | 'morning' | 'evening';
}
