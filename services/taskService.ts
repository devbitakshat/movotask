import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { CreateTaskDTO, Task, TaskStats, UpdateTaskDTO } from '@/types/task';
import { INITIAL_DEMO_TASKS } from '@/lib/constants';
import { isTaskOverdue, isTaskToday, isTaskUpcoming } from '@/lib/utils';
import { Database } from '@/types/database.types';

type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

const LOCAL_STORAGE_TASKS_KEY = 'movotask_local_tasks';

function getLocalTasks(): Task[] {
  if (typeof window === 'undefined') return INITIAL_DEMO_TASKS;
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_TASKS_KEY);
    if (!saved) {
      localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(INITIAL_DEMO_TASKS));
      return INITIAL_DEMO_TASKS;
    }
    return JSON.parse(saved);
  } catch {
    return INITIAL_DEMO_TASKS;
  }
}

function saveLocalTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error('Failed to save tasks to localStorage:', err);
  }
}

export const taskService = {
  /**
   * Fetch all tasks for a specific user
   */
  async getTasks(userId?: string): Promise<Task[]> {
    if (!isSupabaseConfigured() || !userId || userId.startsWith('demo-user')) {
      return getLocalTasks();
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch tasks error, falling back to local:', error.message);
      return getLocalTasks();
    }

    return (data as Task[]) || [];
  },

  /**
   * Create a new task
   */
  async createTask(dto: CreateTaskDTO, userId: string): Promise<Task> {
    const now = new Date().toISOString();

    if (!isSupabaseConfigured() || !userId || userId.startsWith('demo-user')) {
      const newTask: Task = {
        id: 'local-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        user_id: userId || 'demo-user',
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        due_date: dto.due_date || null,
        due_time: dto.due_time || null,
        priority: dto.priority || 'medium',
        completed: Boolean(dto.completed),
        completed_at: dto.completed ? now : null,
        created_at: now,
        updated_at: now,
      };

      const tasks = getLocalTasks();
      const updated = [newTask, ...tasks];
      saveLocalTasks(updated);
      return newTask;
    }

    const supabase = createClient();
    const insertData: TaskInsert = {
      user_id: userId,
      title: dto.title.trim(),
      description: dto.description?.trim() || null,
      due_date: dto.due_date || null,
      due_time: dto.due_time || null,
      priority: dto.priority || 'medium',
      completed: Boolean(dto.completed),
      completed_at: dto.completed ? now : null,
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert(insertData as never)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Task;
  },

  /**
   * Update an existing task
   */
  async updateTask(id: string, dto: UpdateTaskDTO, userId?: string): Promise<Task> {
    const now = new Date().toISOString();

    if (!isSupabaseConfigured() || !userId || userId.startsWith('demo-user')) {
      const tasks = getLocalTasks();
      const index = tasks.findIndex((t) => t.id === id);
      if (index === -1) {
        throw new Error('Task not found');
      }

      const updatedTask: Task = {
        ...tasks[index],
        ...dto,
        updated_at: now,
        completed_at:
          dto.completed !== undefined
            ? dto.completed
              ? dto.completed_at || now
              : null
            : tasks[index].completed_at,
      };

      tasks[index] = updatedTask;
      saveLocalTasks(tasks);
      return updatedTask;
    }

    const supabase = createClient();
    const updatePayload: TaskUpdate = {
      ...dto,
      updated_at: now,
    };

    if (dto.completed !== undefined) {
      updatePayload.completed_at = dto.completed ? dto.completed_at || now : null;
    }

    const { data, error } = await supabase
      .from('tasks')
      .update(updatePayload as never)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Task;
  },

  /**
   * Toggle task completion status
   */
  async toggleTaskComplete(id: string, completed: boolean, userId?: string): Promise<Task> {
    return this.updateTask(
      id,
      {
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      },
      userId
    );
  },

  /**
   * Delete a task
   */
  async deleteTask(id: string, userId?: string): Promise<void> {
    if (!isSupabaseConfigured() || !userId || userId.startsWith('demo-user')) {
      const tasks = getLocalTasks();
      const updated = tasks.filter((t) => t.id !== id);
      saveLocalTasks(updated);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.from('tasks').delete().eq('id', id);

    if (error) {
      throw error;
    }
  },

  /**
   * Calculate task statistics for dashboard widgets
   */
  getStats(tasks: Task[]): TaskStats {
    let completedToday = 0;
    let remainingToday = 0;
    let overdue = 0;
    let upcoming = 0;

    for (const task of tasks) {
      const isToday = isTaskToday(task.due_date);
      const isOver = isTaskOverdue(task.due_date, task.completed);
      const isUp = isTaskUpcoming(task.due_date, task.completed);

      if (isToday) {
        if (task.completed) {
          completedToday++;
        } else {
          remainingToday++;
        }
      }

      if (isOver) {
        overdue++;
      }

      if (isUp) {
        upcoming++;
      }
    }

    return {
      total: tasks.length,
      completedToday,
      remainingToday,
      overdue,
      upcoming,
    };
  },
};
