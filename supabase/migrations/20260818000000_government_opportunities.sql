/* NAVPRARAMBH — verified government opportunity catalog
   Forward-only: creates only this catalog table, its indexes, policies, and seeds.
*/

CREATE TABLE public.government_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  category text NOT NULL,
  opportunity_type text NOT NULL CHECK (opportunity_type IN ('portal', 'scheme', 'program', 'scholarship', 'initiative')),
  official_source_name text NOT NULL,
  official_source_url text NOT NULL,
  application_url text,
  eligibility text,
  benefits text,
  amount text,
  deadline date,
  is_active boolean NOT NULL DEFAULT true,
  last_verified_at date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_government_opportunities_active ON public.government_opportunities (is_active);
CREATE INDEX idx_government_opportunities_category ON public.government_opportunities (category);
CREATE INDEX idx_government_opportunities_type ON public.government_opportunities (opportunity_type);

ALTER TABLE public.government_opportunities ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.government_opportunities FROM anon, authenticated;
GRANT SELECT ON public.government_opportunities TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.government_opportunities TO authenticated;

CREATE POLICY "government_opportunities_active_read_anon"
  ON public.government_opportunities FOR SELECT TO anon
  USING (is_active = true);

CREATE POLICY "government_opportunities_active_read_authenticated"
  ON public.government_opportunities FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "government_opportunities_admin_insert"
  ON public.government_opportunities FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "government_opportunities_admin_update"
  ON public.government_opportunities FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "government_opportunities_admin_delete"
  ON public.government_opportunities FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

INSERT INTO public.government_opportunities
  (id, title, slug, description, category, opportunity_type, official_source_name, official_source_url, is_active, last_verified_at)
VALUES
  ('00000000-0000-4000-8000-000000001001', 'National Career Service', 'national-career-service', 'A one-stop platform for jobseekers, employers, and career counsellors to connect with employment and career services.', 'Jobs & employment', 'portal', 'National Career Service', 'https://ncs.gov.in/', true, '2026-08-18'),
  ('00000000-0000-4000-8000-000000001002', 'National Scholarship Portal', 'national-scholarship-portal', 'The official portal for discovering and applying for scholarship schemes, including services for students and one-time registration.', 'Scholarships', 'portal', 'National Scholarship Portal', 'https://scholarships.gov.in/', true, '2026-08-18'),
  ('00000000-0000-4000-8000-000000001003', 'myScheme', 'myscheme', 'A national platform for searching and discovering government schemes based on a citizen’s details and eligibility.', 'Government schemes', 'portal', 'myScheme', 'https://www.myscheme.gov.in/', true, '2026-08-18'),
  ('00000000-0000-4000-8000-000000001004', 'Skill India Digital Hub', 'skill-india-digital-hub', 'An online platform for skill development, reskilling, upskilling, courses, schemes, jobs, and apprenticeship opportunities.', 'Skills & training', 'portal', 'Skill India Digital Hub', 'https://www.skillindiadigital.gov.in/', true, '2026-08-18')
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE public.government_opportunities IS 'Official-source catalog for government portals and individual opportunities. Only active rows are publicly readable.';
