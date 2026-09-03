-- Repeatable fictional development seed mechanism.
-- Auth must create the owner first; this migration creates the seed function only.
-- The function is callable by the server-side seed runner, not the browser.

CREATE OR REPLACE FUNCTION public.seed_development_catalog(owner_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = owner_id AND role = 'student'
  ) THEN
    RAISE EXCEPTION 'Seed owner must be an existing student profile';
  END IF;

  INSERT INTO public.companies (id, user_id, name, description, website, industry, location)
  VALUES
    ('00000000-0000-4000-8000-000000000101', owner_id, '[DEV] Sunbird Labs', 'Fictional product engineering studio.', 'https://example.com/sunbird', 'Software', 'Bengaluru'),
    ('00000000-0000-4000-8000-000000000102', owner_id, '[DEV] Northstar Analytics', 'Fictional data and analytics company.', 'https://example.com/northstar', 'Analytics', 'Remote')
  ON CONFLICT (id) DO UPDATE SET
    user_id = EXCLUDED.user_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    website = EXCLUDED.website,
    industry = EXCLUDED.industry,
    location = EXCLUDED.location;

  INSERT INTO public.jobs (id, company_id, posted_by, title, description, mode, type, category, location, skills, education, apply_url)
  VALUES
    ('00000000-0000-4000-8000-000000000201', '00000000-0000-4000-8000-000000000101', owner_id, '[DEV] Frontend Engineer', 'Build accessible product interfaces with React and TypeScript.', 'remote', 'full_time', 'private', 'Remote', ARRAY['React','TypeScript','CSS'], 'Bachelor degree or equivalent experience', 'https://example.com/jobs/frontend'),
    ('00000000-0000-4000-8000-000000000202', '00000000-0000-4000-8000-000000000102', owner_id, '[DEV] Junior Data Analyst', 'Create dashboards and explain product metrics to partner teams.', 'hybrid', 'full_time', 'private', 'Hyderabad', ARRAY['SQL','Excel','Analytics'], 'Bachelor degree or equivalent experience', 'https://example.com/jobs/analyst')
  ON CONFLICT (id) DO UPDATE SET
    company_id = EXCLUDED.company_id,
    posted_by = EXCLUDED.posted_by,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    mode = EXCLUDED.mode,
    type = EXCLUDED.type,
    category = EXCLUDED.category,
    location = EXCLUDED.location,
    skills = EXCLUDED.skills,
    education = EXCLUDED.education,
    apply_url = EXCLUDED.apply_url;

  INSERT INTO public.internships (id, company_id, posted_by, title, description, mode, duration_months, stipend_monthly, has_ppo, skills, deadline, apply_url)
  VALUES
    ('00000000-0000-4000-8000-000000000301', '00000000-0000-4000-8000-000000000101', owner_id, '[DEV] React Product Intern', 'Work with a fictional product team on responsive React features.', 'remote', 3, 25000, true, ARRAY['React','JavaScript','Git'], '2027-12-31', 'https://example.com/internships/react'),
    ('00000000-0000-4000-8000-000000000302', '00000000-0000-4000-8000-000000000102', owner_id, '[DEV] Analytics Intern', 'Support fictional analysts with SQL queries and weekly reports.', 'hybrid', 6, 22000, false, ARRAY['SQL','Python','Communication'], '2027-12-31', 'https://example.com/internships/analytics')
  ON CONFLICT (id) DO UPDATE SET
    company_id = EXCLUDED.company_id,
    posted_by = EXCLUDED.posted_by,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    mode = EXCLUDED.mode,
    duration_months = EXCLUDED.duration_months,
    stipend_monthly = EXCLUDED.stipend_monthly,
    has_ppo = EXCLUDED.has_ppo,
    skills = EXCLUDED.skills,
    deadline = EXCLUDED.deadline,
    apply_url = EXCLUDED.apply_url;

  INSERT INTO public.courses (id, created_by, title, description, category, instructor, level, duration_hours, rating, price, skills)
  VALUES
    ('00000000-0000-4000-8000-000000000401', owner_id, '[DEV] React Foundations', 'Fictional course covering components, state, and accessible UI.', 'Frontend', 'NavPrarambh Learning Team', 'beginner', 18, 4.8, 0, ARRAY['React','TypeScript','Accessibility']),
    ('00000000-0000-4000-8000-000000000402', owner_id, '[DEV] SQL for Career Starters', 'Fictional course covering joins and practical queries.', 'Data', 'NavPrarambh Learning Team', 'beginner', 12, 4.7, 0, ARRAY['SQL','PostgreSQL','Analytics'])
  ON CONFLICT (id) DO UPDATE SET
    created_by = EXCLUDED.created_by,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    instructor = EXCLUDED.instructor,
    level = EXCLUDED.level,
    duration_hours = EXCLUDED.duration_hours,
    rating = EXCLUDED.rating,
    price = EXCLUDED.price,
    skills = EXCLUDED.skills;

  INSERT INTO public.careers (id, title, category, emoji, description, salary_min, salary_max, growth, skills, roadmap_steps)
  VALUES
    ('00000000-0000-4000-8000-000000000501', '[DEV] Frontend Engineer', 'Technology', '🧩', 'Fictional frontend product career profile.', 6, 24, 'Very High', ARRAY['React','TypeScript','Testing'], ARRAY['HTML and CSS','JavaScript','React projects','Interview preparation']),
    ('00000000-0000-4000-8000-000000000502', '[DEV] Data Analyst', 'Analytics', '📊', 'Fictional analytics career profile.', 5, 20, 'High', ARRAY['SQL','Spreadsheets','Visualization'], ARRAY['SQL foundations','Data cleaning','Dashboards','Case-study practice'])
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    emoji = EXCLUDED.emoji,
    description = EXCLUDED.description,
    salary_min = EXCLUDED.salary_min,
    salary_max = EXCLUDED.salary_max,
    growth = EXCLUDED.growth,
    skills = EXCLUDED.skills,
    roadmap_steps = EXCLUDED.roadmap_steps;

  INSERT INTO public.prep_tests (id, title, category, duration_minutes, difficulty, questions, created_by)
  VALUES
    ('00000000-0000-4000-8000-000000000601', '[DEV] Aptitude Warm-up', 'aptitude', 15, 'easy', '[{"question":"What is 20% of 150?","answer":"30"}]'::jsonb, owner_id),
    ('00000000-0000-4000-8000-000000000602', '[DEV] SQL Interview Warm-up', 'coding', 20, 'medium', '[{"question":"Explain an inner join.","answer":"Returns matching rows"}]'::jsonb, owner_id)
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    category = EXCLUDED.category,
    duration_minutes = EXCLUDED.duration_minutes,
    difficulty = EXCLUDED.difficulty,
    questions = EXCLUDED.questions,
    created_by = EXCLUDED.created_by;

  INSERT INTO public.games (id, name, emoji, description, difficulty, xp_reward, category)
  VALUES
    ('00000000-0000-4000-8000-000000000701', '[DEV] SQL Sprint', '🧠', 'Fictional timed SQL practice game.', 'easy', 100, 'coding'),
    ('00000000-0000-4000-8000-000000000702', '[DEV] Career Compass', '🧭', 'Fictional career decision challenge.', 'medium', 120, 'career')
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    emoji = EXCLUDED.emoji,
    description = EXCLUDED.description,
    difficulty = EXCLUDED.difficulty,
    xp_reward = EXCLUDED.xp_reward,
    category = EXCLUDED.category;

  INSERT INTO public.badges (id, name, emoji, description, xp_required)
  VALUES
    ('00000000-0000-4000-8000-000000000801', '[DEV] First Learning Step', '🌱', 'Fictional development learning badge.', 100),
    ('00000000-0000-4000-8000-000000000802', '[DEV] Practice Builder', '🔥', 'Fictional development practice badge.', 500)
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    emoji = EXCLUDED.emoji,
    description = EXCLUDED.description,
    xp_required = EXCLUDED.xp_required;
END;
$$;

REVOKE ALL ON FUNCTION public.seed_development_catalog(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.seed_development_catalog(uuid) TO service_role;
