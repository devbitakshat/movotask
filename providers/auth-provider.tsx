'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { authService } from '@/services/authService';
import { UserProfile } from '@/types/auth';

interface UserInfo {
  id: string;
  email?: string;
}

interface AuthContextType {
  user: UserInfo | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isDemoUser: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  enterDemoMode: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: UserInfo = {
  id: 'demo-user-123',
  email: 'demo@movotask.app',
};

const DEMO_PROFILE: UserProfile = {
  id: 'demo-user-123',
  user_id: 'demo-user-123',
  name: 'Demo Productivity User',
  email: 'demo@movotask.app',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoUser, setIsDemoUser] = useState<boolean>(false);
  const configured = isSupabaseConfigured();

  const fetchUserProfile = async (userId: string) => {
    try {
      const p = await authService.getProfile(userId);
      setProfile(p);
    } catch (err) {
      console.warn('Could not fetch user profile:', err);
    }
  };

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      // Check if user was previously in demo mode
      const savedDemo = localStorage.getItem('movotask_is_demo') === 'true';

      if (!configured || savedDemo) {
        if (mounted) {
          setUser(DEMO_USER);
          setProfile(DEMO_PROFILE);
          setIsDemoUser(true);
          setIsLoading(false);
        }
        return;
      }

      const supabase = createClient();
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          setUser({ id: session.user.id, email: session.user.email });
          setIsDemoUser(false);
          await fetchUserProfile(session.user.id);
        } else if (mounted) {
          setUser(null);
          setProfile(null);
          setIsDemoUser(false);
        }
      } catch (err) {
        console.error('Error fetching auth session:', err);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }

      // Listen to auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (!mounted) return;
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email });
          setIsDemoUser(false);
          localStorage.removeItem('movotask_is_demo');
          await fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setIsLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    }

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, [configured]);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await authService.signIn(email, password);
      localStorage.removeItem('movotask_is_demo');
      setIsDemoUser(false);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    try {
      await authService.signUp(email, password, name);
      localStorage.removeItem('movotask_is_demo');
      setIsDemoUser(false);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      if (configured && !isDemoUser) {
        await authService.signOut();
      }
      localStorage.removeItem('movotask_is_demo');
      setUser(null);
      setProfile(null);
      setIsDemoUser(false);
    } finally {
      setIsLoading(false);
    }
  };

  const enterDemoMode = () => {
    localStorage.setItem('movotask_is_demo', 'true');
    setUser(DEMO_USER);
    setProfile(DEMO_PROFILE);
    setIsDemoUser(true);
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isDemoUser,
        isConfigured: configured,
        signIn,
        signUp,
        signOut,
        enterDemoMode,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
