-- ==============================================================================
-- NEURALISO SUPABASE DATABASE SCHEMA WITH ROW LEVEL SECURITY (RLS)
-- ==============================================================================
-- Run these queries in your Supabase SQL Editor to initialize the database
-- tables, indexes, realtime subscriptions, and RLS security policies.
-- ==============================================================================

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Wellness Explorer',
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'inactive',
  subscription_expires_at TIMESTAMPTZ,
  dodo_customer_id TEXT,
  dodo_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- For existing databases: safely add subscription columns if they don't exist yet
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dodo_customer_id TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS dodo_subscription_id TEXT;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own profile"
  ON public.profiles
  FOR ALL
  USING (auth.uid() = id);

-- 2. MOODS TABLE
CREATE TABLE IF NOT EXISTS public.moods (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  note TEXT,
  date TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '😐',
  label TEXT NOT NULL DEFAULT 'Neutral',
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.moods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own moods"
  ON public.moods
  FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_moods_user_date ON public.moods(user_id, date DESC);

-- 3. THOUGHTS (CBT REFRAMES) TABLE
CREATE TABLE IF NOT EXISTS public.thoughts (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  situation TEXT NOT NULL,
  thought TEXT NOT NULL,
  truth TEXT,
  balanced_thought TEXT NOT NULL,
  belief_percent INTEGER NOT NULL DEFAULT 50,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.thoughts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own thoughts"
  ON public.thoughts
  FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_thoughts_user_date ON public.thoughts(user_id, date DESC);

-- 4. CHAT HISTORY TABLE
CREATE TABLE IF NOT EXISTS public.chat_history (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'ai', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own chat history"
  ON public.chat_history
  FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_chat_user_created ON public.chat_history(user_id, created_at ASC);

-- 5. ENABLE REALTIME SYNC ON MOODS AND THOUGHTS
-- This allows instant cross-device synchronization without page refresh
ALTER PUBLICATION supabase_realtime ADD TABLE public.moods;
ALTER PUBLICATION supabase_realtime ADD TABLE public.thoughts;

-- 6. TRIGGER: AUTO-UPDATE UPDATED_AT ON PROFILES
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
