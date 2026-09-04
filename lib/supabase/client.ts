import { createBrowserClient } from '@supabase/ssr';
import { Database } from '@/types/database.types';
import { getSupabaseCredentials, isSupabaseConfigured } from './config';

export function createClient() {
  const { url, anonKey } = getSupabaseCredentials();

  if (!isSupabaseConfigured()) {
    // Return dummy client if unconfigured to prevent hard runtime crashes on build / initial load
    return createBrowserClient<Database>(
      url || 'https://placeholder.supabase.co',
      anonKey || 'placeholder-anon-key'
    );
  }

  return createBrowserClient<Database>(url, anonKey);
}
