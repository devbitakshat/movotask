'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  LayoutList,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Zap,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { SiriOrb } from './siri-orb';
import { InlineTaskCard } from './inline-task-card';
import { callGemini } from '@/services/aiService';
import { useTasks } from '@/providers/task-provider';
import { useAuth } from '@/providers/auth-provider';
import { Task, UpdateTaskDTO } from '@/types/task';
import { AIResponse } from '@/types/ai';
import { cn, getTodayDateString } from '@/lib/utils';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  taskCard?: {
    task: Task;
    badgeText: string;
    badgeColor: 'emerald' | 'blue';
  };
  deletedTaskTitle?: string;
  action?: AIResponse['action'];
  time: string;
}

interface ChatViewProps {
  onOpenTaskDrawer: () => void;
}

export function ChatView({ onOpenTaskDrawer }: ChatViewProps) {
  const { tasks, createTask, updateTask, deleteTask, stats } = useTasks();
  const { user, isDemoUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const counterRef = useRef(0);

  // Compute greeting on mount to satisfy purity rules
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  });

  // Auto-scroll to bottom as new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking]);

  // Auto-adjust textarea height
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  };

  const executeSend = async (messageText: string) => {
    const trimmed = messageText.trim();
    if (!trimmed || isThinking) return;

    // Check if user is asking to open/show tasks directly
    if (/\b(show|open|view|see)\s+(my\s+)?tasks\b/i.test(trimmed)) {
      onOpenTaskDrawer();
    }

    counterRef.current += 1;
    const userMsgId = `user-${counterRef.current}`;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content: trimmed,
      time: nowTime,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    setIsThinking(true);

    try {
      // Call Gemini 3.6 Flash via server route
      const response = await callGemini(trimmed, tasks, isDemoUser);

      let taskCardObj:
        | { task: Task; badgeText: string; badgeColor: 'emerald' | 'blue' }
        | undefined = undefined;
      let deletedTitle: string | undefined = undefined;

      // Handle Task Actions from AI
      if (response.action) {
        if (response.action.type === 'CREATE_TASK' && response.action.payload) {
          const payload = response.action.payload;
          const created = await createTask({
            title: payload.title,
            description: payload.description,
            due_date: payload.dueDate || getTodayDateString(),
            due_time: payload.dueTime
              ? payload.dueTime.length === 5
                ? `${payload.dueTime}:00`
                : payload.dueTime
              : null,
            priority: payload.priority || 'medium',
          });
          taskCardObj = {
            task: created,
            badgeText: 'Task Added to Hub',
            badgeColor: 'emerald',
          };
        } else if (response.action.type === 'UPDATE_TASK' && response.action.payload) {
          const payload = response.action.payload;
          // Locate task by ID or fuzzy title match
          const target = tasks.find((t) => {
            if (payload.taskId && t.id === payload.taskId) return true;
            if (payload.taskId && t.title.toLowerCase() === payload.taskId.toLowerCase()) return true;
            if (payload.title && t.title.toLowerCase() === payload.title.toLowerCase()) return true;
            if (payload.taskId && t.title.toLowerCase().includes(payload.taskId.toLowerCase())) return true;
            if (payload.title && t.title.toLowerCase().includes(payload.title.toLowerCase())) return true;
            return false;
          });

          if (target) {
            const updateDto: UpdateTaskDTO = {};
            if (payload.title) updateDto.title = payload.title;
            if (payload.description !== undefined) updateDto.description = payload.description;
            if (payload.dueDate !== undefined) updateDto.due_date = payload.dueDate;
            if (payload.dueTime !== undefined) {
              updateDto.due_time = payload.dueTime
                ? payload.dueTime.length === 5
                  ? `${payload.dueTime}:00`
                  : payload.dueTime
                : null;
            }
            if (payload.priority) updateDto.priority = payload.priority;
            if (payload.completed !== undefined) updateDto.completed = payload.completed;

            const updated = await updateTask(target.id, updateDto);
            taskCardObj = {
              task: updated,
              badgeText: payload.dueDate || payload.dueTime ? 'Task Rescheduled in Hub' : 'Task Updated in Hub',
              badgeColor: 'blue',
            };
          }
        } else if (response.action.type === 'DELETE_TASK' && response.action.payload) {
          const payload = response.action.payload;
          const target = tasks.find((t) => {
            if (payload.taskId && t.id === payload.taskId) return true;
            if (payload.taskId && t.title.toLowerCase() === payload.taskId.toLowerCase()) return true;
            if (payload.taskId && t.title.toLowerCase().includes(payload.taskId.toLowerCase())) return true;
            return false;
          });

          if (target) {
            deletedTitle = target.title;
            await deleteTask(target.id);
          }
        }
      }

      counterRef.current += 1;
      const assistantMsg: ChatMessage = {
        id: `ai-${counterRef.current}`,
        role: 'assistant',
        content: response.message,
        taskCard: taskCardObj,
        deletedTaskTitle: deletedTitle,
        action: response.action,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Could not connect to Gemini AI. Check your GEMINI_API_KEY.';

      counterRef.current += 1;
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${counterRef.current}`,
          role: 'assistant',
          content: `⚠️ ${errorMsg}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      executeSend(input);
    }
  };

  const samplePrompts = [
    {
      title: 'Schedule my day',
      desc: 'Prioritize today’s tasks by urgency',
      icon: Calendar,
      prompt: 'Look at my current tasks and suggest an ideal schedule for today.',
    },
    {
      title: 'Add urgent task',
      desc: 'Create a high-priority todo with time',
      icon: Zap,
      prompt: 'Add a high priority task to review quarterly metrics today at 4pm',
    },
    {
      title: 'Check overdue',
      desc: 'Review what needs immediate attention',
      icon: AlertCircle,
      prompt: 'What tasks are currently overdue and how should I tackle them?',
    },
    {
      title: 'View all tasks',
      desc: 'Open the task hub drawer',
      icon: LayoutList,
      prompt: 'Show my tasks in the task hub',
    },
  ];

  return (
    <div className="relative flex flex-1 flex-col h-full overflow-hidden bg-radial from-transparent via-transparent to-black/5 dark:to-white/2">
      {/* Messages / Main View Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
        {messages.length === 0 ? (
          /* Empty / Hero State with Siri Orb Centerpiece */
          <div className="flex min-h-[75vh] flex-col items-center justify-center text-center max-w-2xl mx-auto px-2">
            {/* Pulsing Siri Sphere */}
            <div className="mb-8">
              <SiriOrb
                size="hero"
                isThinking={isThinking}
                className="drop-shadow-3xl"
              />
            </div>

            {/* Greeting */}
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-gray-900 dark:text-white">
              {greeting},{' '}
              <span className="bg-linear-to-r from-blue-600 via-indigo-600 to-pink-500 bg-clip-text text-transparent">
                {user?.email ? user.email.split('@')[0] : 'there'}
              </span>
            </h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md">
              I am your conversational productivity assistant. Tell me what needs
              to be done or ask me to schedule your day.
            </p>

            {/* Active Task Status Micro-Pill */}
            <div className="mt-5 flex items-center gap-2 rounded-full border border-gray-200/80 bg-white/60 px-3.5 py-1.5 text-xs text-gray-600 backdrop-blur-md shadow-2xs dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-300">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {stats.total} active tasks · {stats.overdue} overdue
              </span>
              <button
                onClick={onOpenTaskDrawer}
                className="ml-1 text-blue-600 font-semibold hover:underline dark:text-blue-400"
              >
                View Hub →
              </button>
            </div>

            {/* Prompt Suggestion Chips */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left">
              {samplePrompts.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => executeSend(item.prompt)}
                    className="group flex items-start gap-3 rounded-2xl border border-gray-200/80 bg-white/70 p-3.5 text-left transition-all duration-200 hover:border-blue-400 hover:bg-white hover:shadow-md dark:border-gray-800/80 dark:bg-gray-900/50 dark:hover:border-blue-700 dark:hover:bg-gray-900"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-950/50 dark:text-blue-400">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Active Conversational Message Stream */
          <div className="max-w-2xl mx-auto space-y-6 pb-28">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-3.5',
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {/* Assistant Avatar / Mini Siri Orb */}
                {msg.role === 'assistant' && (
                  <div className="mt-1 shrink-0">
                    <SiriOrb size="sm" isThinking={false} />
                  </div>
                )}

                <div
                  className={cn(
                    'flex flex-col max-w-[86%] sm:max-w-[80%]',
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  )}
                >
                  {/* Bubble Content */}
                  <div
                    className={cn(
                      'rounded-3xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-xs',
                      msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-md'
                        : 'bg-white text-gray-800 border border-gray-100 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-100 rounded-tl-md backdrop-blur-md'
                    )}
                  >
                    {msg.content}

                    {/* Inline Task Card when AI Creates or Modifies a Task */}
                    {msg.taskCard && (
                      <div className="mt-2.5">
                        <div
                          className={cn(
                            'flex items-center gap-1.5 text-[11px] font-semibold mb-1',
                            msg.taskCard.badgeColor === 'emerald'
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-blue-600 dark:text-blue-400'
                          )}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>{msg.taskCard.badgeText}</span>
                        </div>
                        <InlineTaskCard task={msg.taskCard.task} />
                      </div>
                    )}

                    {/* Deleted Task Confirmation Banner */}
                    {msg.deletedTaskTitle && (
                      <div className="mt-2.5 flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] font-medium text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400">
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Removed &ldquo;{msg.deletedTaskTitle}&rdquo; from Task Hub</span>
                      </div>
                    )}
                  </div>

                  {/* Timestamp */}
                  <span className="mt-1 px-2 text-[10px] text-gray-400">
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {/* Thinking / Generating State */}
            {isThinking && (
              <div className="flex items-center gap-3">
                <SiriOrb size="sm" isThinking={true} />
                <div className="flex items-center gap-1.5 rounded-2xl bg-white/80 px-4 py-2.5 text-xs text-gray-500 border border-gray-100 shadow-xs dark:bg-gray-900/80 dark:border-gray-800 dark:text-gray-400 backdrop-blur-md">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500 animate-bounce" />
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-pink-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-1 font-medium">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Bottom Prompt Bar (ChatGPT / Claude Style) */}
      <div className="sticky bottom-0 z-30 w-full p-4 md:pb-6 bg-linear-to-t from-background via-background/90 to-transparent">
        <div className="max-w-2xl mx-auto">
          <div className="relative flex flex-col rounded-3xl border border-gray-200/90 bg-white/85 p-2 shadow-xl shadow-gray-900/5 backdrop-blur-xl transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 dark:border-gray-800/90 dark:bg-[#12151d]/90 dark:shadow-black/20">
            <div className="flex items-end gap-2 px-2 py-1">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask MovoTask to add, schedule, or organize tasks..."
                disabled={isThinking}
                className="max-h-36 min-h-[24px] flex-1 resize-none bg-transparent py-1 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-hidden dark:text-white dark:placeholder:text-gray-500"
              />

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                {/* View Tasks Quick Trigger */}
                <button
                  type="button"
                  onClick={onOpenTaskDrawer}
                  className="flex h-8 items-center gap-1.5 rounded-2xl bg-gray-100 px-2.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  title="Open Task Hub"
                >
                  <LayoutList className="h-3.5 w-3.5 text-blue-500" />
                  <span className="hidden sm:inline">Tasks</span>
                  <span className="rounded-full bg-blue-600/15 px-1 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                    {stats.total}
                  </span>
                </button>

                {/* Send Button */}
                <button
                  type="button"
                  onClick={() => executeSend(input)}
                  disabled={!input.trim() || isThinking}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-2xl transition-all duration-200',
                    input.trim() && !isThinking
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30 hover:bg-blue-700 active:scale-95'
                      : 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 cursor-not-allowed'
                  )}
                  title="Send message (Enter)"
                >
                  <ArrowUp className="h-4 w-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Clear conversation shortcut if messages exist */}
            {messages.length > 0 && (
              <div className="flex items-center justify-between border-t border-gray-100 px-3 pt-1.5 text-[10px] text-gray-400 dark:border-gray-800">
                <span>Press Enter to send · Shift+Enter for newline</span>
                <button
                  onClick={() => setMessages([])}
                  className="flex items-center gap-1 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <RotateCcw className="h-2.5 w-2.5" />
                  <span>New Chat</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
