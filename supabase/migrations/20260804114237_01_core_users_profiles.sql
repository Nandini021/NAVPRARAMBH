/*
# Migration 1: Core User Profiles & Settings

## Summary
Sets up the foundational user layer for NAVPRARAMBH. All authenticated users from
Supabase Auth (auth.users) get a corresponding profile row created automatically
via a database trigger. Profiles store display info, role (student / company /
recruiter / college / placement_officer / mentor / trainer / admin), and avatar.
Settings stores per-user preferences (language, notifications, etc.).

## New Tables

### profiles
- id (uuid, PK, mirrors auth.users.id)
- full_name (text)
- email (text)
- avatar_url (text)
- role (enum: student / company / recruiter / college / placement_officer / mentor / trainer / admin)
- bio (text)
- phone (text)
- location (text)
- website (text)
- github_url (text)
- linkedin_url (text)
- college (text)  — for students
- degree (text)
- graduation_year (int)
- company_name (text)  — for company/recruiter roles
- created_at, updated_at (timestamps)

### user_settings
- id (uuid, PK)
- user_id (uuid, FK → profiles.id, unique)
- language (text, default 'English')
- notifications_jobs (bool)
- notifications_courses (bool)
- notifications_ai (bool)
- notifications_email (bool)
- notifications_sms (bool)
- created_at, updated_at

## Security
- RLS enabled on both tables.
- Users can only read/update their own profile and settings.
- A trigger auto-creates a profile row on new auth.users insert.
*/

-- ─── ENUM ────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'student', 'company', 'recruiter', 'college',
    'placement_officer', 'mentor', 'trainer', 'admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── PROFILES ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       text,
  email           text,
  avatar_url      text,
  role            user_role NOT NULL DEFAULT 'student',
  bio             text,
  phone           text,
  location        text,
  website         text,
  github_url      text,
  linkedin_url    text,
  college         text,
  degree          text,
  graduation_year int,
  company_name    text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- ─── USER SETTINGS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_settings (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid NOT NULL UNIQUE DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  language                text NOT NULL DEFAULT 'English',
  notifications_jobs      boolean NOT NULL DEFAULT true,
  notifications_courses   boolean NOT NULL DEFAULT true,
  notifications_ai        boolean NOT NULL DEFAULT true,
  notifications_email     boolean NOT NULL DEFAULT true,
  notifications_sms       boolean NOT NULL DEFAULT false,
  created_at              timestamptz DEFAULT now(),
  updated_at              timestamptz DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_select_own" ON user_settings;
CREATE POLICY "settings_select_own" ON user_settings FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "settings_insert_own" ON user_settings;
CREATE POLICY "settings_insert_own" ON user_settings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "settings_update_own" ON user_settings;
CREATE POLICY "settings_update_own" ON user_settings FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "settings_delete_own" ON user_settings;
CREATE POLICY "settings_delete_own" ON user_settings FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ─── AUTO-CREATE PROFILE ON SIGN UP ──────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── UPDATED_AT HELPER ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS user_settings_updated_at ON user_settings;
CREATE TRIGGER user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
