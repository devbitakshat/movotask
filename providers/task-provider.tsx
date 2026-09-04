'use client';

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { CreateTaskDTO, Task, TaskFilter, TaskStats, UpdateTaskDTO } from '@/types/task';
import { taskService } from '@/services/taskService';
import { aiService } from '@/services/aiService';
import { useAuth } from './auth-provider';
import { isTaskOverdue, isTaskToday, isTaskUpcoming, sortTasks } from '@/lib/utils';

interface TaskContextType {
  tasks: Task[];
  filteredTasks: Task[];
  todayTasks: Task[];
  overdueTasks: Task[];
  upcomingTasks: Task[];
  completedTasks: Task[];
  activeFilter: TaskFilter;
  setActiveFilter: (filter: TaskFilter) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  stats: TaskStats;
  createTask: (dto: CreateTaskDTO) => Promise<Task>;
  updateTask: (id: string, dto: UpdateTaskDTO) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  quickAddTask: (naturalInput: string) => Promise<Task>;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;
  activeSection: 'tasks' | 'settings';
  setActiveSection: (section: 'tasks' | 'settings') => void;
  refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeSection, setActiveSection] = useState<'tasks' | 'settings'>('tasks');

  const userId = user?.id;

  // Load tasks on mount and when user session changes
  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await taskService.getTasks(userId);
      setTasks(sortTasks(data));
    } catch (err) {
      console.error('Failed to load tasks:', err);
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    let active = true;
    taskService.getTasks(userId).then((data) => {
      if (active) {
        setTasks(sortTasks(data));
        setIsLoading(false);
      }
    }).catch((err) => {
      if (active) {
        console.error('Failed to load tasks:', err);
        setIsLoading(false);
      }
    });

    return () => {
      active = false;
    };
  }, [userId]);

  // Derived Task Collections
  const todayTasks = useMemo(() => {
    return tasks.filter((t) => isTaskToday(t.due_date));
  }, [tasks]);

  const overdueTasks = useMemo(() => {
    return tasks.filter((t) => isTaskOverdue(t.due_date, t.completed));
  }, [tasks]);

  const upcomingTasks = useMemo(() => {
    return tasks.filter((t) => isTaskUpcoming(t.due_date, t.completed));
  }, [tasks]);

  const completedTasks = useMemo(() => {
    return tasks.filter((t) => t.completed);
  }, [tasks]);

  // Overall Stats
  const stats = useMemo(() => {
    return taskService.getStats(tasks);
  }, [tasks]);

  // Filtered tasks based on activeFilter & searchQuery
  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Filter by view
    if (activeFilter === 'today') {
      result = todayTasks;
    } else if (activeFilter === 'overdue') {
      result = overdueTasks;
    } else if (activeFilter === 'upcoming') {
      result = upcomingTasks;
    } else if (activeFilter === 'completed') {
      result = completedTasks;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          (t.description && t.description.toLowerCase().includes(query))
      );
    }

    return sortTasks(result);
  }, [tasks, activeFilter, searchQuery, todayTasks, overdueTasks, upcomingTasks, completedTasks]);

  // Trigger celebratory confetti when finishing all today tasks
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b'],
      });
    } catch {
      // Ignore if canvas isn't ready
    }
  };

  // Create Task
  const createTask = async (dto: CreateTaskDTO): Promise<Task> => {
    const activeUserId = userId || 'demo-user';
    try {
      const newTask = await taskService.createTask(dto, activeUserId);
      setTasks((prev) => sortTasks([newTask, ...prev]));
      toast.success('Task added successfully');
      return newTask;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not create task';
      toast.error(msg);
      throw err;
    }
  };

  // Quick Add Task with Natural Language Parser
  const quickAddTask = async (naturalInput: string): Promise<Task> => {
    const parsed = aiService.parseNaturalLanguageTask(naturalInput);
    return createTask(parsed);
  };

  // Update Task
  const updateTask = async (id: string, dto: UpdateTaskDTO): Promise<Task> => {
    const previousTasks = [...tasks];
    // Optimistic update
    setTasks((prev) =>
      sortTasks(
        prev.map((t) => {
          if (t.id === id) {
            return {
              ...t,
              ...dto,
              updated_at: new Date().toISOString(),
            };
          }
          return t;
        })
      )
    );

    try {
      const updated = await taskService.updateTask(id, dto, userId);
      setTasks((prev) =>
        sortTasks(prev.map((t) => (t.id === id ? updated : t)))
      );
      toast.success('Task updated');
      return updated;
    } catch (err: unknown) {
      setTasks(previousTasks);
      const msg = err instanceof Error ? err.message : 'Could not update task';
      toast.error(msg);
      throw err;
    }
  };

  // Toggle Task Completion
  const toggleComplete = async (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;

    const newCompleted = !target.completed;
    const previousTasks = [...tasks];

    // Optimistic UI Update
    setTasks((prev) =>
      sortTasks(
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                completed: newCompleted,
                completed_at: newCompleted ? new Date().toISOString() : null,
              }
            : t
        )
      )
    );

    if (newCompleted) {
      toast.success('Task marked as complete', {
        action: {
          label: 'Undo',
          onClick: () => toggleComplete(id),
        },
      });

      // If user finished all remaining tasks for today, trigger confetti
      const remainingToday = todayTasks.filter((t) => t.id !== id && !t.completed).length;
      if (isTaskToday(target.due_date) && remainingToday === 0) {
        triggerConfetti();
      }
    }

    try {
      await taskService.toggleTaskComplete(id, newCompleted, userId);
    } catch (err: unknown) {
      setTasks(previousTasks);
      const msg = err instanceof Error ? err.message : 'Could not update task status';
      toast.error(msg);
    }
  };

  // Delete Task
  const deleteTask = async (id: string) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    const previousTasks = [...tasks];

    // Optimistic UI update
    setTasks((prev) => prev.filter((t) => t.id !== id));

    toast.success('Task deleted', {
      action: {
        label: 'Undo',
        onClick: async () => {
          if (taskToDelete) {
            await createTask({
              title: taskToDelete.title,
              description: taskToDelete.description,
              due_date: taskToDelete.due_date,
              due_time: taskToDelete.due_time,
              priority: taskToDelete.priority,
              completed: taskToDelete.completed,
            });
          }
        },
      },
    });

    try {
      await taskService.deleteTask(id, userId);
    } catch (err: unknown) {
      setTasks(previousTasks);
      const msg = err instanceof Error ? err.message : 'Could not delete task';
      toast.error(msg);
    }
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        filteredTasks,
        todayTasks,
        overdueTasks,
        upcomingTasks,
        completedTasks,
        activeFilter,
        setActiveFilter,
        searchQuery,
        setSearchQuery,
        isLoading,
        stats,
        createTask,
        updateTask,
        deleteTask,
        toggleComplete,
        quickAddTask,
        isCreateModalOpen,
        setIsCreateModalOpen,
        editingTask,
        setEditingTask,
        activeSection,
        setActiveSection,
        refreshTasks: loadTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
