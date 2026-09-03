/* NAVPRARAMBH — additive PM Internship recommendation prototype catalog
   No rows are seeded. Only sourced, verified active records are student-readable.
*/

CREATE TABLE public.pm_internships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  organization text NOT NULL,
  description text,
  domain text,
  skills text[] NOT NULL DEFAULT '{}',
  location text,
  state text,
  work_mode text,
  duration_months numeric,
  stipend_monthly numeric,
  eligibility text,
  apply_url text,
  source_url text NOT NULL,
  source_type text NOT NULL,
  verified_at date NOT NULL,
  status text NOT NULL DEFAULT 'needs_review'
    CHECK (status IN ('active', 'expired', 'needs_review')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_pm_internships_active ON public.pm_internships (status);
CREATE INDEX idx_pm_internships_domain ON public.pm_internships (domain);

ALTER TABLE public.pm_internships ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.pm_internships FROM anon, authenticated;
GRANT SELECT ON public.pm_internships TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.pm_internships TO authenticated;

CREATE POLICY "pm_internships_active_verified_read"
  ON public.pm_internships FOR SELECT TO authenticated
  USING (status = 'active' AND source_url IS NOT NULL AND verified_at IS NOT NULL);

CREATE POLICY "pm_internships_admin_insert"
  ON public.pm_internships FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "pm_internships_admin_update"
  ON public.pm_internships FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "pm_internships_admin_delete"
  ON public.pm_internships FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

COMMENT ON TABLE public.pm_internships IS
  'Sourced PM internship prototype catalog. No row is student-visible without active status, source URL, and verification date.';
