-- BEGIN supabase\migrations\20260804114237_01_core_users_profiles.sql
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
- college (text)  â€” for students
- degree (text)
- graduation_year (int)
- company_name (text)  â€” for company/recruiter roles
- created_at, updated_at (timestamps)

### user_settings
- id (uuid, PK)
- user_id (uuid, FK â†’ profiles.id, unique)
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

-- â”€â”€â”€ ENUM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'student', 'company', 'recruiter', 'college',
    'placement_officer', 'mentor', 'trainer', 'admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- â”€â”€â”€ PROFILES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€ USER SETTINGS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€ AUTO-CREATE PROFILE ON SIGN UP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€ UPDATED_AT HELPER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
-- END supabase\migrations\20260804114237_01_core_users_profiles.sql

-- BEGIN supabase\migrations\20260804114312_02_jobs_internships.sql
/*
# Migration 2: Jobs, Internships & Applications

## Summary
Creates the jobs and internships tables so companies/recruiters can post
opportunities and students can apply. Application records track who applied
to what, with status (pending / shortlisted / rejected / offered).

## New Tables

### companies
- id (uuid, PK)
- user_id (uuid, FK â†’ profiles.id) â€” the company/recruiter who owns it
- name (text)
- logo_url (text)
- description (text)
- website (text)
- industry (text)
- location (text)
- created_at, updated_at

### jobs
- id (uuid, PK)
- company_id (uuid, FK â†’ companies.id)
- posted_by (uuid, FK â†’ profiles.id)
- title, description (text)
- mode (enum: remote / hybrid / onsite)
- type (enum: full_time / part_time / contract)
- category (enum: government / private / international)
- location (text)
- salary_min, salary_max (numeric, in LPA)
- experience_min, experience_max (int)
- skills (text[])
- education (text)
- apply_url (text)
- status (enum: active / closed)
- created_at, updated_at

### internships
- id (uuid, PK)
- company_id (uuid, FK â†’ companies.id)
- posted_by (uuid, FK â†’ profiles.id)
- title, description (text)
- mode (enum: remote / hybrid / onsite)
- duration_months (int)
- stipend_monthly (numeric)
- has_ppo (bool)
- skills (text[])
- deadline (date)
- apply_url (text)
- status (enum: active / closed)
- created_at, updated_at

### applications
- id (uuid, PK)
- user_id (uuid, FK â†’ profiles.id) â€” the applicant
- job_id (uuid, FK â†’ jobs.id, nullable)
- internship_id (uuid, FK â†’ internships.id, nullable)
- status (enum: pending / shortlisted / rejected / offered)
- cover_letter (text)
- resume_url (text)
- created_at, updated_at

## Security
- RLS on all tables.
- Companies can CRUD their own jobs/internships.
- Anyone authenticated can read active jobs/internships (public listing).
- Students can read/create/update their own applications.
- Companies can read applications for their own jobs/internships.
*/

-- â”€â”€â”€ ENUMS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
DO $$ BEGIN
  CREATE TYPE work_mode AS ENUM ('remote', 'hybrid', 'onsite');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE job_type AS ENUM ('full_time', 'part_time', 'contract');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE job_category AS ENUM ('government', 'private', 'international');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE listing_status AS ENUM ('active', 'closed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE application_status AS ENUM ('pending', 'shortlisted', 'rejected', 'offered');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- â”€â”€â”€ COMPANIES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE IF NOT EXISTS companies (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  name        text NOT NULL,
  logo_url    text,
  description text,
  website     text,
  industry    text,
  location    text,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "companies_select_all" ON companies;
CREATE POLICY "companies_select_all" ON companies FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "companies_insert_own" ON companies;
CREATE POLICY "companies_insert_own" ON companies FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "companies_update_own" ON companies;
CREATE POLICY "companies_update_own" ON companies FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "companies_delete_own" ON companies;
CREATE POLICY "companies_delete_own" ON companies FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- â”€â”€â”€ JOBS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE IF NOT EXISTS jobs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      uuid REFERENCES companies(id) ON DELETE SET NULL,
  posted_by       uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title           text NOT NULL,
  description     text,
  mode            work_mode NOT NULL DEFAULT 'onsite',
  type            job_type NOT NULL DEFAULT 'full_time',
  category        job_category NOT NULL DEFAULT 'private',
  location        text,
  salary_min      numeric,
  salary_max      numeric,
  experience_min  int,
  experience_max  int,
  skills          text[] DEFAULT '{}',
  education       text,
  apply_url       text,
  status          listing_status NOT NULL DEFAULT 'active',
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "jobs_select_all" ON jobs;
CREATE POLICY "jobs_select_all" ON jobs FOR SELECT
  TO authenticated USING (status = 'active' OR posted_by = auth.uid());

DROP POLICY IF EXISTS "jobs_insert_own" ON jobs;
CREATE POLICY "jobs_insert_own" ON jobs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = posted_by);

DROP POLICY IF EXISTS "jobs_update_own" ON jobs;
CREATE POLICY "jobs_update_own" ON jobs FOR UPDATE
  TO authenticated USING (posted_by = auth.uid()) WITH CHECK (posted_by = auth.uid());

DROP POLICY IF EXISTS "jobs_delete_own" ON jobs;
CREATE POLICY "jobs_delete_own" ON jobs FOR DELETE
  TO authenticated USING (posted_by = auth.uid());

CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_mode ON jobs(mode);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);

-- â”€â”€â”€ INTERNSHIPS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE IF NOT EXISTS internships (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      uuid REFERENCES companies(id) ON DELETE SET NULL,
  posted_by       uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  title           text NOT NULL,
  description     text,
  mode            work_mode NOT NULL DEFAULT 'remote',
  duration_months int,
  stipend_monthly numeric,
  has_ppo        boolean NOT NULL DEFAULT false,
  skills          text[] DEFAULT '{}',
  deadline        date,
  apply_url       text,
  status          listing_status NOT NULL DEFAULT 'active',
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

ALTER TABLE internships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "internships_select_all" ON internships;
CREATE POLICY "internships_select_all" ON internships FOR SELECT
  TO authenticated USING (status = 'active' OR posted_by = auth.uid());

DROP POLICY IF EXISTS "internships_insert_own" ON internships;
CREATE POLICY "internships_insert_own" ON internships FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = posted_by);

DROP POLICY IF EXISTS "internships_update_own" ON internships;
CREATE POLICY "internships_update_own" ON internships FOR UPDATE
  TO authenticated USING (posted_by = auth.uid()) WITH CHECK (posted_by = auth.uid());

DROP POLICY IF EXISTS "internships_delete_own" ON internships;
CREATE POLICY "internships_delete_own" ON internships FOR DELETE
  TO authenticated USING (posted_by = auth.uid());

CREATE INDEX IF NOT EXISTS idx_internships_status ON internships(status);
CREATE INDEX IF NOT EXISTS idx_internships_mode ON internships(mode);

-- â”€â”€â”€ APPLICATIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE IF NOT EXISTS applications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  job_id          uuid REFERENCES jobs(id) ON DELETE CASCADE,
  internship_id   uuid REFERENCES internships(id) ON DELETE CASCADE,
  status          application_status NOT NULL DEFAULT 'pending',
  cover_letter    text,
  resume_url      text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  CONSTRAINT chk_application_target CHECK (job_id IS NOT NULL OR internship_id IS NOT NULL)
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Students see their own applications
DROP POLICY IF EXISTS "applications_select_own_or_company" ON applications;
CREATE POLICY "applications_select_own_or_company" ON applications FOR SELECT
  TO authenticated USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM jobs j WHERE j.id = applications.job_id AND j.posted_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM internships i WHERE i.id = applications.internship_id AND i.posted_by = auth.uid()
    )
  );

DROP POLICY IF EXISTS "applications_insert_own" ON applications;
CREATE POLICY "applications_insert_own" ON applications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "applications_update_own" ON applications;
CREATE POLICY "applications_update_own" ON applications FOR UPDATE
  TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "applications_delete_own" ON applications;
CREATE POLICY "applications_delete_own" ON applications FOR DELETE
  TO authenticated USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_internship ON applications(internship_id);

-- â”€â”€â”€ TRIGGERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
DROP TRIGGER IF EXISTS companies_updated_at ON companies;
CREATE TRIGGER companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS jobs_updated_at ON jobs;
CREATE TRIGGER jobs_updated_at BEFORE UPDATE ON jobs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS internships_updated_at ON internships;
CREATE TRIGGER internships_updated_at BEFORE UPDATE ON internships
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS applications_updated_at ON applications;
CREATE TRIGGER applications_updated_at BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
-- END supabase\migrations\20260804114312_02_jobs_internships.sql

-- BEGIN supabase\migrations\20260804114330_03_courses_certs.sql
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
- created_by (uuid, FK â†’ profiles.id)
- title, description (text)
- category (text)
- instructor (text)
- level (enum: beginner / intermediate / advanced)
- duration_hours (numeric)
- rating (numeric)
- price (numeric, nullable â€” null = free)
- thumbnail_url (text)
- skills (text[])
- created_at, updated_at

### enrollments
- id (uuid, PK)
- user_id (uuid, FK â†’ profiles.id)
- course_id (uuid, FK â†’ courses.id)
- progress (int, 0â€“100)
- completed (bool)
- enrolled_at, completed_at, updated_at

### certifications
- id (uuid, PK)
- user_id (uuid, FK â†’ profiles.id)
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

-- â”€â”€â”€ COURSES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€ ENROLLMENTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€ USER CERTIFICATIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€ TRIGGERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
DROP TRIGGER IF EXISTS courses_updated_at ON courses;
CREATE TRIGGER courses_updated_at BEFORE UPDATE ON courses
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS enrollments_updated_at ON enrollments;
CREATE TRIGGER enrollments_updated_at BEFORE UPDATE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
-- END supabase\migrations\20260804114330_03_courses_certs.sql

-- BEGIN supabase\migrations\20260804114349_04_careers_roadmaps.sql
/*
# Migration 4: Career Explorer & Roadmaps

## Summary
Creates the career paths catalog (40+ careers) and personalized roadmaps
generated by SIDDHI AI. Each career has a category, salary range, growth
projection, required skills, and steps. Users can save careers they're
interested in and generate personalized roadmaps.

## New Tables

### careers
- id (uuid, PK)
- title (text)
- category (text)
- emoji (text)
- description (text)
- salary_min, salary_max (numeric, LPA)
- growth (text: Very High / High / Moderate / Stable)
- skills (text[])
- roadmap_steps (text[])
- created_at

### saved_careers
- id (uuid, PK)
- user_id (uuid, FK â†’ profiles.id)
- career_id (uuid, FK â†’ careers.id)
- created_at
- UNIQUE (user_id, career_id)

### roadmaps
- id (uuid, PK)
- user_id (uuid, FK â†’ profiles.id)
- career_id (uuid, FK â†’ careers.id, nullable)
- title (text)
- steps (jsonb â€” array of {step, description, completed})
- progress (int, 0â€“100)
- created_at, updated_at

## Security
- Careers: public read for all authenticated users; only admins can write.
- Saved careers: users own their saves.
- Roadmaps: users own their roadmaps.
*/

-- â”€â”€â”€ CAREERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE IF NOT EXISTS careers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  category      text,
  emoji         text,
  description   text,
  salary_min    numeric,
  salary_max    numeric,
  growth        text,
  skills        text[] DEFAULT '{}',
  roadmap_steps text[] DEFAULT '{}',
  created_at    timestamptz DEFAULT now()
);

ALTER TABLE careers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "careers_select_all" ON careers;
CREATE POLICY "careers_select_all" ON careers FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "careers_insert_admin" ON careers;
CREATE POLICY "careers_insert_admin" ON careers FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "careers_update_admin" ON careers;
CREATE POLICY "careers_update_admin" ON careers FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  ) WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

DROP POLICY IF EXISTS "careers_delete_admin" ON careers;
CREATE POLICY "careers_delete_admin" ON careers FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE INDEX IF NOT EXISTS idx_careers_category ON careers(category);

-- â”€â”€â”€ SAVED CAREERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE IF NOT EXISTS saved_careers (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  career_id   uuid NOT NULL REFERENCES careers(id) ON DELETE CASCADE,
  created_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, career_id)
);

ALTER TABLE saved_careers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "saved_careers_select_own" ON saved_careers;
CREATE POLICY "saved_careers_select_own" ON saved_careers FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_careers_insert_own" ON saved_careers;
CREATE POLICY "saved_careers_insert_own" ON saved_careers FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_careers_delete_own" ON saved_careers;
CREATE POLICY "saved_careers_delete_own" ON saved_careers FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_saved_careers_user ON saved_careers(user_id);

-- â”€â”€â”€ ROADMAPS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
CREATE TABLE IF NOT EXISTS roadmaps (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL DEFAULT auth.uid() REFERENCES profiles(id) ON DELETE CASCADE,
  career_id   uuid REFERENCES careers(id) ON DELETE SET NULL,
  title       text NOT NULL,
  steps       jsonb NOT NULL DEFAULT '[]',
  progress    int NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "roadmaps_select_own" ON roadmaps;
CREATE POLICY "roadmaps_select_own" ON roadmaps FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "roadmaps_insert_own" ON roadmaps;
CREATE POLICY "roadmaps_insert_own" ON roadmaps FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "roadmaps_update_own" ON roadmaps;
CREATE POLICY "roadmaps_update_own" ON roadmaps FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "roadmaps_delete_own" ON roadmaps;
CREATE POLICY "roadmaps_delete_own" ON roadmaps FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_roadmaps_user ON roadmaps(user_id);

DROP TRIGGER IF EXISTS roadmaps_updated_at ON roadmaps;
CREATE TRIGGER roadmaps_updated_at BEFORE UPDATE ON roadmaps
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
-- END supabase\migrations\20260804114349_04_careers_roadmaps.sql

-- BEGIN supabase\migrations\20260804114410_05_prep_games.sql
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
- questions (jsonb â€” array of question objects)
- created_by (uuid, FK â†’ profiles.id)
- created_at

### test_results
- id (uuid, PK)
- user_id (uuid, FK â†’ profiles.id)
- test_id (uuid, FK â†’ prep_tests.id)
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
- user_id (uuid, FK â†’ profiles.id)
- game_id (uuid, FK â†’ games.id)
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
- user_id (uuid, FK â†’ profiles.id)
- badge_id (uuid, FK â†’ badges.id)
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

-- â”€â”€â”€ PREP TESTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€ TEST RESULTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€ GAMES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€ GAME SESSIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€ BADGES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€ USER BADGES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
-- END supabase\migrations\20260804114410_05_prep_games.sql

-- BEGIN supabase\migrations\20260804114436_06_dashboard_scores_goals.sql
/*
# Migration 6: Dashboard â€” Scores, Goals, Bookmarks, Notifications, Projects

## Summary
Creates the final dashboard layer: career scores (placement readiness,
resume score, ATS score, interview readiness), daily/weekly goals with
completion tracking, bookmarks for jobs/courses/internships, notifications,
and user projects (for the profile page).

## New Tables

### career_scores
- id (uuid, PK)
- user_id (uuid, FK â†’ profiles.id, unique)
- career_score (int, 0â€“100)
- placement_readiness (int)
- resume_score (int)
- ats_score (int)
- interview_readiness (int)
- xp (int)
- updated_at

### goals
- id (uuid, PK)
- user_id (uuid, FK â†’ profiles.id)
- title (text)
- type (enum: daily / weekly)
- completed (bool)
- due_date (date)
- created_at, updated_at

### bookmarks
- id (uuid, PK)
- user_id (uuid, FK â†’ profiles.id)
- job_id (uuid, FK â†’ jobs.id, nullable)
- internship_id (uuid, FK â†’ internships.id, nullable)
- course_id (uuid, FK â†’ courses.id, nullable)
- created_at
- UNIQUE constraints per type

### notifications
- id (uuid, PK)
- user_id (uuid, FK â†’ profiles.id)
- text (text)
- type (text: job / ai / interview / course)
- read (bool)
- created_at

### projects
- id (uuid, PK)
- user_id (uuid, FK â†’ profiles.id)
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

-- â”€â”€â”€ CAREER SCORES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€ GOALS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€ BOOKMARKS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€ NOTIFICATIONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€ PROJECTS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

-- â”€â”€â”€ TRIGGERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
DROP TRIGGER IF EXISTS career_scores_updated_at ON career_scores;
CREATE TRIGGER career_scores_updated_at BEFORE UPDATE ON career_scores
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS goals_updated_at ON goals;
CREATE TRIGGER goals_updated_at BEFORE UPDATE ON goals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS projects_updated_at ON projects;
CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
-- END supabase\migrations\20260804114436_06_dashboard_scores_goals.sql
