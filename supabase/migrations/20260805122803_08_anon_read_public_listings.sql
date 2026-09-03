-- Allow anonymous (not-logged-in) visitors to read active public listings
-- so the homepage can show real jobs, internships, courses, and companies.

-- Jobs: anon can read active jobs
DROP POLICY IF EXISTS "jobs_select_anon" ON jobs;
CREATE POLICY "jobs_select_anon" ON jobs FOR SELECT
  TO anon USING (status = 'active');

-- Internships: anon can read active internships
DROP POLICY IF EXISTS "internships_select_anon" ON internships;
CREATE POLICY "internships_select_anon" ON internships FOR SELECT
  TO anon USING (status = 'active');

-- Courses: anon can read all courses
DROP POLICY IF EXISTS "courses_select_anon" ON courses;
CREATE POLICY "courses_select_anon" ON courses FOR SELECT
  TO anon USING (true);

-- Companies: anon can read all companies
DROP POLICY IF EXISTS "companies_select_anon" ON companies;
CREATE POLICY "companies_select_anon" ON companies FOR SELECT
  TO anon USING (true);

-- Careers: anon can read all careers
DROP POLICY IF EXISTS "careers_select_anon" ON careers;
CREATE POLICY "careers_select_anon" ON careers FOR SELECT
  TO anon USING (true);
