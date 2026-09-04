import { createClient } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { UserProfile } from '@/types/auth';
import { Database } from '@/types/database.types';

type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

const DEMO_USER_ID = 'demo-user-123';
const DEMO_PROFILE: UserProfile = {
  id: DEMO_USER_ID,
  user_id: DEMO_USER_ID,
  name: 'Demo Productivity User',
  email: 'demo@movotask.app',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const authService = {
  /**
   * Check if Supabase auth is available
   */
  isConfigured(): boolean {
    return isSupabaseConfigured();
  },

  /**
   * Get the current user session
   */
  async getCurrentUser() {
    if (!isSupabaseConfigured()) {
      return { user: null, isDemo: true };
    }

    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return { user: null, isDemo: false };
    }

    return { user, isDemo: false };
  },

  /**
   * Sign up with email and password
   */
  async signUp(email: string, password: string, name?: string) {
    if (!isSupabaseConfigured()) {
      throw new Error(
        'Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local, or use Demo Mode.'
      );
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0],
        },
      },
    });

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured()) {
      throw new Error(
        'Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local, or use Demo Mode.'
      );
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return data;
  },

  /**
   * Sign out the current user
   */
  async signOut() {
    if (!isSupabaseConfigured()) {
      return;
    }

    const supabase = createClient();
    await supabase.auth.signOut();
  },

  /**
   * Get user profile from public.profiles
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured() || userId === DEMO_USER_ID) {
      return DEMO_PROFILE;
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Profile fetch warning:', error.message);
      return null;
    }

    if (!data) {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          const defaultProfile = {
            user_id: userId,
            name: authData.user.user_metadata?.full_name || authData.user.email?.split('@')[0] || 'User',
            email: authData.user.email || '',
          };
          const { data: createdProfile } = await supabase
            .from('profiles')
            .upsert(defaultProfile as never)
            .select()
            .maybeSingle();
          if (createdProfile) {
            return createdProfile as UserProfile;
          }
        }
      } catch (upsertErr) {
        console.warn('Could not auto-create profile:', upsertErr);
      }
      return null;
    }

    return data as UserProfile;
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    if (!isSupabaseConfigured() || userId === DEMO_USER_ID) {
      return { ...DEMO_PROFILE, ...updates };
    }

    const supabase = createClient();
    const updateData: ProfileUpdate = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData as never)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as UserProfile;
  },
};
