export interface UserProfile {
  id: string;
  user_id: string;
  name: string | null;
  email: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: {
    id: string;
    email?: string;
  } | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isDemoUser: boolean;
}
