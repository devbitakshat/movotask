# Supabase Setup Guide for MovoTask

Follow these instructions to connect your Supabase project to MovoTask:

### 1. Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and create a new project.
2. Note your **Project URL** and **anon public API Key** from **Project Settings > API**.

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` in the root of your project:
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run the SQL Schema Migration
1. In your Supabase Dashboard, open the **SQL Editor**.
2. Click **New Query**.
3. Copy the contents of `supabase/schema.sql` and run it.
4. This will set up:
   - The `profiles` and `tasks` tables with proper types and primary keys.
   - Row Level Security (RLS) policies guaranteeing each user can only read/write their own tasks and profile.
   - Database indexes for sub-millisecond query performance.
   - Automatic triggers to provision user profiles and keep timestamps updated.

### 4. Authentication Configuration
1. In Supabase Dashboard, navigate to **Authentication > Providers > Email**.
2. Enable Email provider.
3. For development simplicity, you can disable "Confirm email" if you want instant login without verifying email tokens.
