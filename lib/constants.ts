import { AIMotivation } from '@/types/ai';
import { Task } from '@/types/task';

export const MOTIVATIONAL_MESSAGES: AIMotivation[] = [
  {
    quote: 'Action is the foundational key to all success.',
    author: 'Pablo Picasso',
    context: 'morning',
  },
  {
    quote: 'You don’t have to see the whole staircase, just take the first step.',
    author: 'Martin Luther King Jr.',
    context: 'overdue',
  },
  {
    quote: 'Small daily improvements over time lead to stunning results.',
    author: 'Robin Sharma',
    context: 'productive',
  },
  {
    quote: 'The secret of getting ahead is getting started. Break your complex tasks into small manageable tasks.',
    author: 'Mark Twain',
    context: 'overdue',
  },
  {
    quote: 'Focus on being productive instead of busy.',
    author: 'Tim Ferriss',
    context: 'morning',
  },
  {
    quote: 'Done is better than perfect. Knock out one quick task now.',
    author: 'Sheryl Sandberg',
    context: 'overdue',
  },
];

export const INITIAL_DEMO_TASKS: Task[] = [
  {
    id: 'demo-task-1',
    user_id: 'demo-user',
    title: 'Review MovoTask product roadmap',
    description: 'Review high-priority upcoming items and future AI integration points.',
    due_date: new Date().toISOString().split('T')[0],
    due_time: '11:00',
    priority: 'high',
    completed: false,
    completed_at: null,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'demo-task-2',
    user_id: 'demo-user',
    title: 'Design mobile Capacitor layout',
    description: 'Ensure bottom navigation and touch-friendly controls feel native.',
    due_date: new Date().toISOString().split('T')[0],
    due_time: '15:30',
    priority: 'medium',
    completed: false,
    completed_at: null,
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'demo-task-3',
    user_id: 'demo-user',
    title: 'Follow up on Supabase schema migration',
    description: 'Run SQL migration in Supabase SQL editor to verify RLS policies.',
    due_date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday (Overdue)
    due_time: '18:00',
    priority: 'high',
    completed: false,
    completed_at: null,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'demo-task-4',
    user_id: 'demo-user',
    title: 'Explore OpenAI structured action schemas',
    description: 'Prepare function calling interface for natural language task additions.',
    due_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // Upcoming
    due_time: '10:00',
    priority: 'low',
    completed: false,
    completed_at: null,
    created_at: new Date(Date.now() - 3600000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 10).toISOString(),
  },
  {
    id: 'demo-task-5',
    user_id: 'demo-user',
    title: 'Setup Next.js 16 App Router project',
    description: 'Initial repository setup with TypeScript and Tailwind CSS.',
    due_date: new Date().toISOString().split('T')[0],
    due_time: '09:00',
    priority: 'medium',
    completed: true,
    completed_at: new Date().toISOString(),
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    updated_at: new Date().toISOString(),
  },
];
