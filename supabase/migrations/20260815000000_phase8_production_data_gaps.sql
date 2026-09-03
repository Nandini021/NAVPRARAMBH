/* NAVPRARAMBH Phase 8 data gaps
   New catalog/history/owned tables only. Existing tables and records remain intact.
*/

-- Public roadmap templates; student progress remains in existing roadmaps.
CREATE TABLE IF NOT EXISTS public.roadmap_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  career_id uuid REFERENCES public.careers(id) ON DELETE SET NULL,
  steps jsonb NOT NULL DEFAULT '[]',
  is_development_seed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.roadmap_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roadmap_templates_read" ON public.roadmap_templates FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "roadmap_templates_admin_write" ON public.roadmap_templates FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

-- Append-only facts used for truthful current/history analytics.
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  entity_id uuid,
  value numeric,
  metadata jsonb NOT NULL DEFAULT '{}',
  occurred_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "analytics_events_own" ON public.analytics_events FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "analytics_events_insert_own" ON public.analytics_events FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE INDEX idx_analytics_events_user_time ON public.analytics_events(user_id, occurred_at DESC);

-- Student-owned skill records.
CREATE TABLE IF NOT EXISTS public.student_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  proficiency int NOT NULL DEFAULT 0 CHECK (proficiency BETWEEN 0 AND 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);
ALTER TABLE public.student_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "student_skills_own" ON public.student_skills FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Resume versions and informational ATS analyses. Trusted decisions must not use client scores.
CREATE TABLE IF NOT EXISTS public.resume_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Resume',
  content text,
  file_url text,
  is_current boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "resume_versions_own" ON public.resume_versions FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.resume_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  resume_version_id uuid NOT NULL REFERENCES public.resume_versions(id) ON DELETE CASCADE,
  ats_score int CHECK (ats_score BETWEEN 0 AND 100),
  recommendations jsonb NOT NULL DEFAULT '[]',
  is_trusted boolean NOT NULL DEFAULT false,
  analyzed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "resume_analyses_own" ON public.resume_analyses FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- User-owned mock interview sessions; client scores are informational until server validation exists.
CREATE TABLE IF NOT EXISTS public.mock_interview_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  interview_type text NOT NULL DEFAULT 'general',
  metadata jsonb NOT NULL DEFAULT '{}',
  score int CHECK (score BETWEEN 0 AND 100),
  feedback jsonb NOT NULL DEFAULT '[]',
  completed boolean NOT NULL DEFAULT false,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);
ALTER TABLE public.mock_interview_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mock_interviews_own" ON public.mock_interview_sessions FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Public certification catalog, separate from earned user_certifications.
CREATE TABLE IF NOT EXISTS public.certification_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  name text NOT NULL,
  description text,
  level text,
  domain text,
  credential_url text,
  is_development_seed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.certification_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "certification_catalog_read" ON public.certification_catalog FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "certification_catalog_admin_write" ON public.certification_catalog FOR ALL TO authenticated USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER TABLE public.user_certifications ADD COLUMN IF NOT EXISTS catalog_id uuid REFERENCES public.certification_catalog(id) ON DELETE SET NULL;

CREATE INDEX idx_student_skills_user ON public.student_skills(user_id);
CREATE INDEX idx_resume_versions_user ON public.resume_versions(user_id, created_at DESC);
CREATE INDEX idx_resume_analyses_user ON public.resume_analyses(user_id, analyzed_at DESC);
CREATE INDEX idx_mock_interviews_user ON public.mock_interview_sessions(user_id, started_at DESC);

-- Small, clearly labelled catalog seeds. No historical activity is fabricated.
INSERT INTO public.certification_catalog (id, provider, name, description, level, domain, is_development_seed)
VALUES
 ('00000000-0000-4000-8000-000000000901','[DEV] Google','[DEV] Data Analytics','Development catalog record.','beginner','Data',true),
 ('00000000-0000-4000-8000-000000000902','[DEV] AWS','[DEV] Cloud Practitioner','Development catalog record.','beginner','Cloud',true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.roadmap_templates (id, title, description, steps, is_development_seed)
VALUES
 ('00000000-0000-4000-8000-000000000911','[DEV] Frontend Engineer Roadmap','Development roadmap template.', '[{"title":"HTML and CSS","description":"Build accessible web foundations.","completed":false},{"title":"JavaScript","description":"Learn browser programming.","completed":false},{"title":"React project","description":"Build and publish a portfolio project.","completed":false}]'::jsonb, true),
 ('00000000-0000-4000-8000-000000000912','[DEV] Data Analyst Roadmap','Development roadmap template.', '[{"title":"SQL foundations","description":"Learn querying and joins.","completed":false},{"title":"Data cleaning","description":"Prepare reliable datasets.","completed":false},{"title":"Dashboard project","description":"Explain insights with a dashboard.","completed":false}]'::jsonb, true)
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE public.resume_analyses IS 'User-owned analysis records. is_trusted=false for client informational results.';
COMMENT ON TABLE public.mock_interview_sessions IS 'User-owned sessions. Client-submitted scores are informational until server validation exists.';
COMMENT ON TABLE public.analytics_events IS 'Real activity facts only; do not backfill fabricated history.';

-- Service role is not granted through the browser API; RLS governs authenticated access.
REVOKE ALL ON public.roadmap_templates, public.analytics_events, public.student_skills, public.resume_versions, public.resume_analyses, public.mock_interview_sessions, public.certification_catalog FROM anon;
GRANT SELECT ON public.roadmap_templates, public.certification_catalog TO anon;
REVOKE INSERT, UPDATE, DELETE ON public.certification_catalog, public.roadmap_templates FROM authenticated;
GRANT SELECT ON public.certification_catalog, public.roadmap_templates TO authenticated;

DROP TRIGGER IF EXISTS roadmap_templates_updated_at ON public.roadmap_templates;
CREATE TRIGGER roadmap_templates_updated_at BEFORE UPDATE ON public.roadmap_templates FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS student_skills_updated_at ON public.student_skills;
CREATE TRIGGER student_skills_updated_at BEFORE UPDATE ON public.student_skills FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
