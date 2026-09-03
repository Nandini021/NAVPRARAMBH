/*
# Migration 2: Jobs, Internships & Applications

## Summary
Creates the jobs and internships tables so companies/recruiters can post
opportunities and students can apply. Application records track who applied
to what, with status (pending / shortlisted / rejected / offered).

## New Tables

### companies
- id (uuid, PK)
- user_id (uuid, FK → profiles.id) — the company/recruiter who owns it
- name (text)
- logo_url (text)
- description (text)
- website (text)
- industry (text)
- location (text)
- created_at, updated_at

### jobs
- id (uuid, PK)
- company_id (uuid, FK → companies.id)
- posted_by (uuid, FK → profiles.id)
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
- company_id (uuid, FK → companies.id)
- posted_by (uuid, FK → profiles.id)
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
- user_id (uuid, FK → profiles.id) — the applicant
- job_id (uuid, FK → jobs.id, nullable)
- internship_id (uuid, FK → internships.id, nullable)
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

-- ─── ENUMS ───────────────────────────────────────────────────────
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

-- ─── COMPANIES ────────────────────────────────────────────────────
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

-- ─── JOBS ────────────────────────────────────────────────────────
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

-- ─── INTERNSHIPS ─────────────────────────────────────────────────
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

-- ─── APPLICATIONS ─────────────────────────────────────────────────
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

-- ─── TRIGGERS ─────────────────────────────────────────────────────
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
