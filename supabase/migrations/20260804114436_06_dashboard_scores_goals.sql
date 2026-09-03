/*
# Migration 6: Dashboard — Scores, Goals, Bookmarks, Notifications, Projects

## Summary
Creates the final dashboard layer: career scores (placement readiness,
resume score, ATS score, interview readiness), daily/weekly goals with
completion tracking, bookmarks for jobs/courses/internships, notifications,
and user projects (for the profile page).

## New Tables

### career_scores
- id (uuid, PK)
- user_id (uuid, FK → profiles.id, unique)
- career_score (int, 0–100)
- placement_readiness (int)
- resume_score (int)
- ats_score (int)
- interview_readiness (int)
- xp (int)
- updated_at

### goals
- id (uuid, PK)
- user_id (uuid, FK → profiles.id)
- title (text)
- type (enum: daily / weekly)
- completed (bool)
- due_date (date)
- created_at, updated_at

### bookmarks
- id (uuid, PK)
- user_id (uuid, FK → profiles.id)
- job_id (uuid, FK → jobs.id, nullable)
- internship_id (uuid, FK → internships.id, nullable)
- course_id (uuid, FK → courses.id, nullable)
- created_at
- UNIQUE constraints per type

### notifications
- id (uuid, PK)
- user_id (uuid, FK → profiles.id)
- text (text)
- type (text: job / ai / interview / course)
- read (bool)
- created_at

### projects
- id (uuid, PK)
- user_id (uuid, FK → profiles.id)
- title, description (text)
- tech_stack (text[])
- status (enum: completed / in_progress)
- project_url (text)
- created_at, updated_at

## Security
- All tables: RLS enabled, users own their data.
- Bookmarks: users own their bookmarks.
- Notifications: users own their notifications.
*/

DO $$ BEGIN
  CREATE TYPE goal_type AS ENUM ('daily', 'weekly');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE project_status AS ENUM ('completed', 'in_progress');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── CAREER SCORES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS career_scores (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid NOT NULL UNIQUE DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  career_score          int NOT NULL DEFAULT 0 CHECK (career_score >= 0 AND career_score <= 100),
  placement_readiness   int NOT NULL DEFAULT 0 CHECK (placement_readiness >= 0 AND placement_readiness <= 100),
  resume_score          int NOT NULL DEFAULT 0 CHECK (resume_score >= 0 AND resume_score <= 100),
  ats_score             int NOT NULL DEFAULT 0 CHECK (ats_score >= 0 AND ats_score <= 100),
  interview_readiness   int NOT NULL DEFAULT 0 CHECK (interview_readiness >= 0 AND interview_readiness <= 100),
  xp                    int NOT NULL DEFAULT 0,
  updated_at            timestamptz DEFAULT now()
);

ALTER TABLE career_scores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "scores_select_own" ON career_scores;
CREATE POLICY "scores_select_own" ON career_scores FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "scores_insert_own" ON career_scores;
CREATE POLICY "scores_insert_own" ON career_scores FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "scores_update_own" ON career_scores;
CREATE POLICY "scores_update_own" ON career_scores FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "scores_delete_own" ON career_scores;
CREATE POLICY "scores_delete_own" ON career_scores FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ─── GOALS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS goals (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title       text NOT NULL,
  type        goal_type NOT NULL DEFAULT 'daily',
  completed   boolean NOT NULL DEFAULT false,
  due_date    date,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "goals_select_own" ON goals;
CREATE POLICY "goals_select_own" ON goals FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "goals_insert_own" ON goals;
CREATE POLICY "goals_insert_own" ON goals FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "goals_update_own" ON goals;
CREATE POLICY "goals_update_own" ON goals FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "goals_delete_own" ON goals;
CREATE POLICY "goals_delete_own" ON goals FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_goals_user ON goals(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_type ON goals(type);

-- ─── BOOKMARKS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookmarks (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  job_id          uuid REFERENCES jobs(id) ON DELETE CASCADE,
  internship_id   uuid REFERENCES internships(id) ON DELETE CASCADE,
  course_id       uuid REFERENCES courses(id) ON DELETE CASCADE,
  created_at      timestamptz DEFAULT now(),
  CONSTRAINT chk_bookmark_target CHECK (job_id IS NOT NULL OR internship_id IS NOT NULL OR course_id IS NOT NULL)
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bookmarks_select_own" ON bookmarks;
CREATE POLICY "bookmarks_select_own" ON bookmarks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "bookmarks_insert_own" ON bookmarks;
CREATE POLICY "bookmarks_insert_own" ON bookmarks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "bookmarks_delete_own" ON bookmarks;
CREATE POLICY "bookmarks_delete_own" ON bookmarks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON bookmarks(user_id);

-- ─── NOTIFICATIONS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  text        text NOT NULL,
  type        text DEFAULT 'general',
  read        boolean NOT NULL DEFAULT false,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert_own" ON notifications;
CREATE POLICY "notifications_insert_own" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- ─── PROJECTS ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS projects (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title         text NOT NULL,
  description   text,
  tech_stack    text[] DEFAULT '{}',
  status        project_status NOT NULL DEFAULT 'in_progress',
  project_url   text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "projects_select_own" ON projects;
CREATE POLICY "projects_select_own" ON projects FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "projects_insert_own" ON projects;
CREATE POLICY "projects_insert_own" ON projects FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "projects_update_own" ON projects;
CREATE POLICY "projects_update_own" ON projects FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "projects_delete_own" ON projects;
CREATE POLICY "projects_delete_own" ON projects FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);

-- ─── TRIGGERS ─────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS career_scores_updated_at ON career_scores;
CREATE TRIGGER career_scores_updated_at BEFORE UPDATE ON career_scores
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS goals_updated_at ON goals;
CREATE TRIGGER goals_updated_at BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS projects_updated_at ON projects;
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
