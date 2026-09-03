/*
# Migration 3: Courses, Enrollments & Certifications

## Summary
Creates the learning layer: courses (created by mentors/trainers/admins),
enrollments (students joining courses, with progress tracking), and
certifications (globally recognized badges from Google, Microsoft, etc.)
that users can add to their profile.

## New Tables

### courses
- id (uuid, PK)
- created_by (uuid, FK → profiles.id)
- title, description (text)
- category (text)
- instructor (text)
- level (enum: beginner / intermediate / advanced)
- duration_hours (numeric)
- rating (numeric)
- price (numeric, nullable — null = free)
- thumbnail_url (text)
- skills (text[])
- created_at, updated_at

### enrollments
- id (uuid, PK)
- user_id (uuid, FK → profiles.id)
- course_id (uuid, FK → courses.id)
- progress (int, 0–100)
- completed (bool)
- enrolled_at, completed_at, updated_at

### certifications
- id (uuid, PK)
- user_id (uuid, FK → profiles.id)
- name (text)
- provider (text)
- issue_date (date)
- credential_url (text)
- verified (bool)
- created_at

## Security
- RLS on all tables.
- Courses: anyone authenticated can read; creators can manage their own.
- Enrollments: students own their enrollments; course creators can view enrollments for their courses.
- Certifications: users own their certifications.
*/

DO $$ BEGIN
  CREATE TYPE course_level AS ENUM ('beginner', 'intermediate', 'advanced');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── COURSES ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by      uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title           text NOT NULL,
  description     text,
  category        text,
  instructor      text,
  level           course_level NOT NULL DEFAULT 'beginner',
  duration_hours  numeric,
  rating          numeric DEFAULT 0,
  price           numeric,
  thumbnail_url   text,
  skills          text[] DEFAULT '{}',
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "courses_select_all" ON courses;
CREATE POLICY "courses_select_all" ON courses FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "courses_insert_own" ON courses;
CREATE POLICY "courses_insert_own" ON courses FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "courses_update_own" ON courses;
CREATE POLICY "courses_update_own" ON courses FOR UPDATE
  TO authenticated USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "courses_delete_own" ON courses;
CREATE POLICY "courses_delete_own" ON courses FOR DELETE
  TO authenticated USING (created_by = auth.uid());

CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);

-- ─── ENROLLMENTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enrollments (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  course_id     uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress      int NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed     boolean NOT NULL DEFAULT false,
  enrolled_at   timestamptz DEFAULT now(),
  completed_at  timestamptz,
  updated_at    timestamptz DEFAULT now(),
  UNIQUE (user_id, course_id)
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "enrollments_select_own_or_creator" ON enrollments;
CREATE POLICY "enrollments_select_own_or_creator" ON enrollments FOR SELECT
  TO authenticated USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM courses c WHERE c.id = enrollments.course_id AND c.created_by = auth.uid())
  );

DROP POLICY IF EXISTS "enrollments_insert_own" ON enrollments;
CREATE POLICY "enrollments_insert_own" ON enrollments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "enrollments_update_own" ON enrollments;
CREATE POLICY "enrollments_update_own" ON enrollments FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "enrollments_delete_own" ON enrollments;
CREATE POLICY "enrollments_delete_own" ON enrollments FOR DELETE
  TO authenticated USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments(course_id);

-- ─── USER CERTIFICATIONS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_certifications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  name            text NOT NULL,
  provider       text NOT NULL,
  issue_date      date,
  credential_url  text,
  verified        boolean NOT NULL DEFAULT false,
  created_at      timestamptz DEFAULT now()
);

ALTER TABLE user_certifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "certs_select_own" ON user_certifications;
CREATE POLICY "certs_select_own" ON user_certifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "certs_insert_own" ON user_certifications;
CREATE POLICY "certs_insert_own" ON user_certifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "certs_update_own" ON user_certifications;
CREATE POLICY "certs_update_own" ON user_certifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "certs_delete_own" ON user_certifications;
CREATE POLICY "certs_delete_own" ON user_certifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ─── TRIGGERS ─────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS courses_updated_at ON courses;
CREATE TRIGGER courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS enrollments_updated_at ON enrollments;
CREATE TRIGGER enrollments_updated_at BEFORE UPDATE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
