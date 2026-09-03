/*
# Migration 5: Placement Prep, Games & Gamification

## Summary
Creates the placement preparation layer (aptitude tests, coding challenges,
mock interviews with scores) and the knowledge games layer (12+ games with
XP, coins, badges, achievements, and a leaderboard).

## New Tables

### prep_tests
- id (uuid, PK)
- title (text)
- category (enum: aptitude / logical / verbal / coding / communication)
- duration_minutes (int)
- difficulty (text)
- questions (jsonb — array of question objects)
- created_by (uuid, FK → profiles.id)
- created_at

### test_results
- id (uuid, PK)
- user_id (uuid, FK → profiles.id)
- test_id (uuid, FK → prep_tests.id)
- score (int)
- total_questions (int)
- correct_answers (int)
- time_taken_seconds (int)
- completed_at

### games
- id (uuid, PK)
- name (text)
- emoji (text)
- description (text)
- difficulty (text)
- xp_reward (int)
- category (text)
- created_at

### game_sessions
- id (uuid, PK)
- user_id (uuid, FK → profiles.id)
- game_id (uuid, FK → games.id)
- score (int)
- xp_earned (int)
- coins_earned (int)
- completed_at

### badges
- id (uuid, PK)
- name (text)
- emoji (text)
- description (text)
- xp_required (int)
- created_at

### user_badges
- id (uuid, PK)
- user_id (uuid, FK → profiles.id)
- badge_id (uuid, FK → badges.id)
- earned_at
- UNIQUE (user_id, badge_id)

## Security
- Prep tests & games: public read; creators/admins write.
- Test results, game sessions, user badges: users own their records.
- Badges: public read; admin write.
*/

DO $$ BEGIN
  CREATE TYPE prep_category AS ENUM ('aptitude', 'logical', 'verbal', 'coding', 'communication');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── PREP TESTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prep_tests (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title             text NOT NULL,
  category          prep_category NOT NULL DEFAULT 'aptitude',
  duration_minutes  int NOT NULL DEFAULT 30,
  difficulty        text DEFAULT 'medium',
  questions         jsonb NOT NULL DEFAULT '[]',
  created_by        uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  created_at        timestamptz DEFAULT now()
);

ALTER TABLE prep_tests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "prep_tests_select_all" ON prep_tests;
CREATE POLICY "prep_tests_select_all" ON prep_tests FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "prep_tests_insert_own" ON prep_tests;
CREATE POLICY "prep_tests_insert_own" ON prep_tests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "prep_tests_update_own" ON prep_tests;
CREATE POLICY "prep_tests_update_own" ON prep_tests FOR UPDATE
  TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "prep_tests_delete_own" ON prep_tests;
CREATE POLICY "prep_tests_delete_own" ON prep_tests FOR DELETE
  TO authenticated USING (created_by = auth.uid());

CREATE INDEX IF NOT EXISTS idx_prep_tests_category ON prep_tests(category);

-- ─── TEST RESULTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS test_results (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  test_id             uuid NOT NULL REFERENCES prep_tests(id) ON DELETE CASCADE,
  score               int NOT NULL DEFAULT 0,
  total_questions     int NOT NULL DEFAULT 0,
  correct_answers     int NOT NULL DEFAULT 0,
  time_taken_seconds  int,
  completed_at        timestamptz DEFAULT now()
);

ALTER TABLE test_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "test_results_select_own" ON test_results;
CREATE POLICY "test_results_select_own" ON test_results FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "test_results_insert_own" ON test_results;
CREATE POLICY "test_results_insert_own" ON test_results FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "test_results_delete_own" ON test_results;
CREATE POLICY "test_results_delete_own" ON test_results FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_test_results_user ON test_results(user_id);

-- ─── GAMES ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS games (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  emoji       text,
  description text,
  difficulty  text DEFAULT 'medium',
  xp_reward   int NOT NULL DEFAULT 100,
  category    text,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "games_select_all" ON games;
CREATE POLICY "games_select_all" ON games FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "games_insert_admin" ON games;
CREATE POLICY "games_insert_admin" ON games FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'trainer'))
  );

DROP POLICY IF EXISTS "games_update_admin" ON games;
CREATE POLICY "games_update_admin" ON games FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'trainer'))
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'trainer'))
  );

-- ─── GAME SESSIONS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS game_sessions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  game_id       uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  score         int NOT NULL DEFAULT 0,
  xp_earned     int NOT NULL DEFAULT 0,
  coins_earned  int NOT NULL DEFAULT 0,
  completed_at  timestamptz DEFAULT now()
);

ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "game_sessions_select_own" ON game_sessions;
CREATE POLICY "game_sessions_select_own" ON game_sessions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "game_sessions_insert_own" ON game_sessions;
CREATE POLICY "game_sessions_insert_own" ON game_sessions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "game_sessions_delete_own" ON game_sessions;
CREATE POLICY "game_sessions_delete_own" ON game_sessions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_game_sessions_user ON game_sessions(user_id);

-- ─── BADGES ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS badges (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  emoji         text,
  description   text,
  xp_required   int NOT NULL DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "badges_select_all" ON badges;
CREATE POLICY "badges_select_all" ON badges FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "badges_insert_admin" ON badges;
CREATE POLICY "badges_insert_admin" ON badges FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "badges_update_admin" ON badges;
CREATE POLICY "badges_update_admin" ON badges FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ─── USER BADGES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_badges (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id    uuid NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at   timestamptz DEFAULT now(),
  UNIQUE (user_id, badge_id)
);

ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_badges_select_own" ON user_badges;
CREATE POLICY "user_badges_select_own" ON user_badges FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_badges_insert_own" ON user_badges;
CREATE POLICY "user_badges_insert_own" ON user_badges FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_badges_delete_own" ON user_badges;
CREATE POLICY "user_badges_delete_own" ON user_badges FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
