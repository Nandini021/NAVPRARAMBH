/*
  NAVPRARAMBH — production security hardening

  This migration closes client-side privilege-escalation paths while keeping
  trusted writes available to backend/service-role code.
*/

-- ─── EXACTLY ONE TARGET ──────────────────────────────────────────
ALTER TABLE applications
  DROP CONSTRAINT IF EXISTS chk_application_target;
ALTER TABLE applications
  ADD CONSTRAINT chk_application_exactly_one_target CHECK (
    (job_id IS NOT NULL AND internship_id IS NULL)
    OR (job_id IS NULL AND internship_id IS NOT NULL)
  );

ALTER TABLE bookmarks
  DROP CONSTRAINT IF EXISTS chk_bookmark_target;
ALTER TABLE bookmarks
  ADD CONSTRAINT chk_bookmark_exactly_one_target CHECK (
    (job_id IS NOT NULL)::int
    + (internship_id IS NOT NULL)::int
    + (course_id IS NOT NULL)::int = 1
  );

-- ─── ROLE PROTECTION ─────────────────────────────────────────────
-- Users may edit their profile, but cannot promote themselves. Admins and
-- service-role backend operations may assign elevated roles.
CREATE OR REPLACE FUNCTION public.prevent_privileged_role_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND COALESCE(current_setting('request.jwt.claim.role', true), '') <> 'service_role'
     AND NOT EXISTS (
       SELECT 1 FROM public.profiles
       WHERE id = auth.uid() AND role = 'admin'
     )
  THEN
    RAISE EXCEPTION 'Only an administrator or trusted backend may change profile roles';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_profile_role ON public.profiles;
CREATE TRIGGER protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_privileged_role_changes();

-- ─── ROLE-AWARE LISTING POLICIES ─────────────────────────────────
DROP POLICY IF EXISTS "companies_insert_own" ON companies;
CREATE POLICY "companies_insert_own" ON companies FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('company', 'recruiter', 'admin')
    )
  );

DROP POLICY IF EXISTS "jobs_insert_own" ON jobs;
CREATE POLICY "jobs_insert_own" ON jobs FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = posted_by
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('company', 'recruiter', 'admin')
    )
    AND (
      company_id IS NULL
      OR EXISTS (SELECT 1 FROM companies c WHERE c.id = company_id AND c.user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "internships_insert_own" ON internships;
CREATE POLICY "internships_insert_own" ON internships FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = posted_by
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('company', 'recruiter', 'admin')
    )
    AND (
      company_id IS NULL
      OR EXISTS (SELECT 1 FROM companies c WHERE c.id = company_id AND c.user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "applications_insert_own" ON applications;
CREATE POLICY "applications_insert_own" ON applications FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'student')
  );

-- ─── APPLICATION STATUS PROTECTION ───────────────────────────────
-- Students may not mark their own application as shortlisted, rejected,
-- or offered. A trusted backend workflow must perform status transitions.
CREATE OR REPLACE FUNCTION public.prevent_student_application_status_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status
     AND EXISTS (
       SELECT 1 FROM public.profiles
       WHERE id = auth.uid() AND role = 'student'
     )
     AND COALESCE(current_setting('request.jwt.claim.role', true), '') <> 'service_role'
  THEN
    RAISE EXCEPTION 'Students cannot change application status';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_application_status ON public.applications;
CREATE TRIGGER protect_application_status
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.prevent_student_application_status_changes();

DROP POLICY IF EXISTS "applications_insert_own" ON applications;
CREATE POLICY "applications_insert_own" ON applications FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'student')
    AND (
      EXISTS (SELECT 1 FROM jobs j WHERE j.id = job_id AND j.status = 'active')
      OR EXISTS (SELECT 1 FROM internships i WHERE i.id = internship_id AND i.status = 'active')
    )
  );

-- ─── SERVER-CONTROLLED SCORES AND REWARDS ─────────────────────────
-- These tables remain readable by their owner. Writes must come from a
-- trusted backend/service-role transaction, never from the browser client.
DROP POLICY IF EXISTS "scores_insert_own" ON career_scores;
DROP POLICY IF EXISTS "scores_update_own" ON career_scores;
DROP POLICY IF EXISTS "scores_delete_own" ON career_scores;

DROP POLICY IF EXISTS "game_sessions_insert_own" ON game_sessions;
DROP POLICY IF EXISTS "game_sessions_delete_own" ON game_sessions;

DROP POLICY IF EXISTS "user_badges_insert_own" ON user_badges;
DROP POLICY IF EXISTS "user_badges_delete_own" ON user_badges;

COMMENT ON TABLE career_scores IS
  'Readable by the owner; score and XP writes are restricted to trusted backend code.';
COMMENT ON TABLE game_sessions IS
  'Readable by the owner; session rewards are calculated and written by trusted backend code.';
COMMENT ON TABLE user_badges IS
  'Readable by the owner; badge awards are written by trusted backend code.';

-- ─── ROLE-AWARE LISTING UPDATES ─────────────────────────────────
DROP POLICY IF EXISTS "companies_update_own" ON companies;
CREATE POLICY "companies_update_own" ON companies FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('company', 'recruiter', 'admin'))
  )
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "companies_delete_own" ON companies;
CREATE POLICY "companies_delete_own" ON companies FOR DELETE TO authenticated
  USING (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('company', 'recruiter', 'admin'))
  );

DROP POLICY IF EXISTS "jobs_update_own" ON jobs;
CREATE POLICY "jobs_update_own" ON jobs FOR UPDATE TO authenticated
  USING (
    posted_by = auth.uid()
    AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('company', 'recruiter', 'admin'))
  )
  WITH CHECK (posted_by = auth.uid());

DROP POLICY IF EXISTS "jobs_delete_own" ON jobs;
CREATE POLICY "jobs_delete_own" ON jobs FOR DELETE TO authenticated
  USING (
    posted_by = auth.uid()
    AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('company', 'recruiter', 'admin'))
  );

DROP POLICY IF EXISTS "internships_update_own" ON internships;
CREATE POLICY "internships_update_own" ON internships FOR UPDATE TO authenticated
  USING (
    posted_by = auth.uid()
    AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('company', 'recruiter', 'admin'))
  )
  WITH CHECK (posted_by = auth.uid());

DROP POLICY IF EXISTS "internships_delete_own" ON internships;
CREATE POLICY "internships_delete_own" ON internships FOR DELETE TO authenticated
  USING (
    posted_by = auth.uid()
    AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('company', 'recruiter', 'admin'))
  );

-- ─── ROLE-AWARE PREP TEST CREATION ───────────────────────────────
DROP POLICY IF EXISTS "prep_tests_insert_own" ON prep_tests;
CREATE POLICY "prep_tests_insert_own" ON prep_tests FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('mentor', 'trainer', 'admin')
    )
  );

DROP POLICY IF EXISTS "prep_tests_update_own" ON prep_tests;
CREATE POLICY "prep_tests_update_own" ON prep_tests FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('mentor', 'trainer', 'admin')
    )
  )
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "prep_tests_delete_own" ON prep_tests;
CREATE POLICY "prep_tests_delete_own" ON prep_tests FOR DELETE TO authenticated
  USING (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role IN ('mentor', 'trainer', 'admin')
    )
  );

-- Keep the migration explicit about the intended trusted-write boundary.
REVOKE INSERT, UPDATE, DELETE ON career_scores, game_sessions, user_badges FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON career_scores, game_sessions, user_badges FROM anon;

-- Ensure the trigger helper itself is not callable through the API.
REVOKE EXECUTE ON FUNCTION public.prevent_privileged_role_changes() FROM anon, authenticated, public;
