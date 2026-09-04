'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Loader2, CheckCircle2 } from 'lucide-react';
import { callGemini } from '@/services/aiService';
import { useTasks } from '@/providers/task-provider';
import { AIResponse } from '@/types/ai';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  action?: AIResponse['action'];
  timestamp: Date;
}

export function AIChat() {
  const { tasks, createTask } = useTasks();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm your MovoTask AI. Try:\n• \"Remind me to call the dentist tomorrow at 10am\"\n• \"What tasks are overdue?\"\n• \"Add a high priority task to review the report today\"",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [executedAction, setExecutedAction] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setExecutedAction(null);

    try {
      // Call Gemini with current task context
      const response = await callGemini(input.trim(), tasks);

      // Execute task action if Gemini wants to create/update/delete a task
      if (response.action?.type === 'CREATE_TASK' && response.action.payload) {
        const payload = response.action.payload;
        await createTask({
          title: payload.title,
          description: payload.description,
          due_date: payload.dueDate || null,
          due_time: payload.dueTime ? `${payload.dueTime}:00` : null,
          priority: payload.priority || 'medium',
        });
        setExecutedAction(`Task "${payload.title}" created ✓`);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message,
        action: response.action,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Something went wrong. Is GEMINI_API_KEY set?';
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: `❌ Error: ${errorMsg}`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed bottom-20 right-4 z-50 flex items-center gap-2 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 px-4 py-2.5 text-white shadow-xl shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 md:bottom-6 md:right-6',
          isOpen && 'hidden'
        )}
      >
        <Sparkles className="h-4 w-4" />
        <span className="text-xs font-semibold">Ask AI</span>
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 flex w-[340px] flex-col rounded-3xl border border-gray-200/80 bg-white shadow-2xl shadow-gray-900/20 dark:border-gray-800/80 dark:bg-[#11131a] md:bottom-6 md:right-6">
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-3xl border-b border-gray-100 bg-linear-to-r from-blue-500/10 to-indigo-500/10 px-4 py-3 dark:border-gray-800/80">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">MovoTask AI</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Powered by Gemini</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex max-h-80 flex-col gap-3 overflow-y-auto p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  'flex flex-col gap-1',
                  msg.role === 'user' ? 'items-end' : 'items-start'
                )}
              >
                <div
                  className={cn(
                    'rounded-2xl px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap max-w-[85%]',
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-sm'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-tl-sm'
                  )}
                >
                  {msg.content}
                </div>
                {msg.action?.type === 'CREATE_TASK' && (
                  <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    Task created in your list
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-start gap-1">
                <div className="rounded-2xl rounded-tl-sm bg-gray-100 px-3 py-2 dark:bg-gray-800">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-500" />
                </div>
              </div>
            )}

            {executedAction && (
              <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-2.5 py-1.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {executedAction}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-gray-100 p-3 dark:border-gray-800/80">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask me to add or manage tasks..."
              disabled={isLoading}
              className="flex-1 rounded-xl bg-gray-100 px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white disabled:opacity-40 transition-all active:scale-95 hover:bg-blue-700"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
