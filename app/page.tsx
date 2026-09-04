'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { AuthCard } from '@/components/auth/auth-card';
import { ChatHeader } from '@/components/navigation/chat-header';
import { ChatView } from '@/components/ai/chat-view';
import { TaskDrawer } from '@/components/tasks/task-drawer';
import { TaskModal } from '@/components/tasks/task-modal';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);

  // Global Keyboard Shortcut: Cmd/Ctrl + T to toggle Task Hub
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 't') {
        e.preventDefault();
        setIsTaskDrawerOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Initial Auth Loading State
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4 bg-background">
        <div className="w-full max-w-md space-y-4 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 animate-pulse">
            <div className="h-6 w-6 rounded-lg bg-blue-600" />
          </div>
          <Skeleton className="h-6 w-32 mx-auto rounded-lg" />
          <Skeleton className="h-4 w-48 mx-auto rounded-lg" />
        </div>
      </div>
    );
  }

  // Not Logged In -> Show Auth Screen
  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
        <AuthCard />
      </main>
    );
  }

  // AI-First LLM Conversational Interface
  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground overflow-hidden">
      {/* Top Header with mini Siri Orb, Model Status & Task Hub Trigger */}
      <ChatHeader onOpenTaskDrawer={() => setIsTaskDrawerOpen(true)} />

      {/* Centerpiece: AI Conversational Canvas with Apple Siri Fluid Sphere */}
      <main className="flex flex-1 min-h-0 w-full flex-col overflow-hidden">
        <ChatView onOpenTaskDrawer={() => setIsTaskDrawerOpen(true)} />
      </main>

      {/* Slide-out Task Hub Drawer */}
      <TaskDrawer
        isOpen={isTaskDrawerOpen}
        onClose={() => setIsTaskDrawerOpen(false)}
      />

      {/* Task Create / Edit Modal */}
      <TaskModal />
    </div>
  );
}
