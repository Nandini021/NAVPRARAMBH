/*
  NAVPRARAMBH — Stage 1 Secure Games

  APPROVED MIGRATION FILE — NOT EXECUTED.

  Adds protected game questions, server-created attempts, validated answers,
  attempt-linked sessions, owner-only RLS, and atomic start/finalization RPCs.

  Existing games, sessions, XP, badges, and career scores are preserved.
*/

BEGIN;

DO $$ BEGIN
  CREATE TYPE public.game_attempt_status AS ENUM ('started', 'submitted', 'expired', 'abandoned');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.game_reward_status AS ENUM ('pending', 'awarded', 'not_eligible', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.games
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS instructions text,
  ADD COLUMN IF NOT EXISTS game_type text NOT NULL DEFAULT 'mcq',
  ADD COLUMN IF NOT EXISTS question_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS time_limit_seconds integer,
  ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS version integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS games_slug_unique_idx
  ON public.games(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS games_category_idx ON public.games(category);
CREATE INDEX IF NOT EXISTS games_difficulty_idx ON public.games(difficulty);
CREATE INDEX IF NOT EXISTS games_active_idx ON public.games(is_active);

ALTER TABLE public.games DROP CONSTRAINT IF EXISTS games_question_count_check;
ALTER TABLE public.games ADD CONSTRAINT games_question_count_check CHECK (question_count >= 0);
ALTER TABLE public.games DROP CONSTRAINT IF EXISTS games_time_limit_check;
ALTER TABLE public.games ADD CONSTRAINT games_time_limit_check CHECK (time_limit_seconds IS NULL OR time_limit_seconds > 0);
ALTER TABLE public.games DROP CONSTRAINT IF EXISTS games_version_check;
ALTER TABLE public.games ADD CONSTRAINT games_version_check CHECK (version > 0);
ALTER TABLE public.games DROP CONSTRAINT IF EXISTS games_game_type_check;
ALTER TABLE public.games ADD CONSTRAINT games_game_type_check CHECK (game_type IN ('mcq','multi_select','text','code','ordering','matching','scenario','memory','data'));

CREATE TABLE IF NOT EXISTS public.game_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  prompt text NOT NULL,
  question_type text NOT NULL DEFAULT 'mcq',
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  answer_key jsonb NOT NULL,
  explanation text,
  difficulty text NOT NULL DEFAULT 'medium',
  points integer NOT NULL DEFAULT 1,
  time_limit_seconds integer,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT game_questions_points_check CHECK (points > 0),
  CONSTRAINT game_questions_sort_order_check CHECK (sort_order >= 0),
  CONSTRAINT game_questions_time_limit_check CHECK (time_limit_seconds IS NULL OR time_limit_seconds > 0),
  CONSTRAINT game_questions_type_check CHECK (question_type IN ('mcq','multi_select','text','code','ordering','matching','scenario','memory','data')),
  CONSTRAINT game_questions_difficulty_check CHECK (difficulty IN ('easy','medium','hard')),
  CONSTRAINT game_questions_options_array_check CHECK (jsonb_typeof(options) = 'array'),
  CONSTRAINT game_questions_content_object_check CHECK (jsonb_typeof(content) = 'object'),
  CONSTRAINT game_questions_answer_key_object_check CHECK (jsonb_typeof(answer_key) = 'object')
);

CREATE INDEX IF NOT EXISTS game_questions_game_active_idx ON public.game_questions(game_id, is_active);
CREATE INDEX IF NOT EXISTS game_questions_game_difficulty_idx ON public.game_questions(game_id, difficulty, is_active);
CREATE INDEX IF NOT EXISTS game_questions_game_order_idx ON public.game_questions(game_id, sort_order);

CREATE TABLE IF NOT EXISTS public.game_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  game_id uuid NOT NULL REFERENCES public.games(id) ON DELETE RESTRICT,
  game_version integer NOT NULL DEFAULT 1,
  question_ids uuid[] NOT NULL DEFAULT '{}'::uuid[],
  question_order jsonb NOT NULL DEFAULT '[]'::jsonb,
  status public.game_attempt_status NOT NULL DEFAULT 'started',
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  completed_at timestamptz,
  score integer,
  correct_answers integer,
  total_questions integer NOT NULL DEFAULT 0,
  total_points integer NOT NULL DEFAULT 0,
  earned_points integer,
  time_taken_seconds integer,
  xp_earned integer,
  coins_earned integer NOT NULL DEFAULT 0,
  reward_status public.game_reward_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT game_attempts_version_check CHECK (game_version > 0),
  CONSTRAINT game_attempts_question_count_check CHECK (total_questions >= 0),
  CONSTRAINT game_attempts_total_points_check CHECK (total_points >= 0),
  CONSTRAINT game_attempts_correct_check CHECK (correct_answers IS NULL OR (correct_answers >= 0 AND correct_answers <= total_questions)),
  CONSTRAINT game_attempts_score_check CHECK (score IS NULL OR score BETWEEN 0 AND 100),
  CONSTRAINT game_attempts_earned_points_check CHECK (earned_points IS NULL OR (earned_points >= 0 AND earned_points <= total_points)),
  CONSTRAINT game_attempts_time_check CHECK (time_taken_seconds IS NULL OR time_taken_seconds >= 0),
  CONSTRAINT game_attempts_xp_check CHECK (xp_earned IS NULL OR xp_earned >= 0),
  CONSTRAINT game_attempts_coins_check CHECK (coins_earned >= 0),
  CONSTRAINT game_attempts_order_array_check CHECK (jsonb_typeof(question_order) = 'array')
);

CREATE INDEX IF NOT EXISTS game_attempts_user_created_idx ON public.game_attempts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS game_attempts_user_game_idx ON public.game_attempts(user_id, game_id, created_at DESC);
CREATE INDEX IF NOT EXISTS game_attempts_status_idx ON public.game_attempts(status);
CREATE INDEX IF NOT EXISTS game_attempts_expiry_idx ON public.game_attempts(expires_at);

CREATE TABLE IF NOT EXISTS public.game_attempt_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid NOT NULL REFERENCES public.game_attempts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES public.game_questions(id) ON DELETE RESTRICT,
  selected_answer jsonb NOT NULL,
  is_correct boolean NOT NULL,
  points_awarded integer NOT NULL DEFAULT 0,
  answered_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT game_attempt_answers_points_check CHECK (points_awarded >= 0),
  CONSTRAINT game_attempt_answers_unique_question UNIQUE (attempt_id, question_id)
);

CREATE INDEX IF NOT EXISTS game_attempt_answers_attempt_idx ON public.game_attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS game_attempt_answers_user_idx ON public.game_attempt_answers(user_id, answered_at DESC);

ALTER TABLE public.game_sessions
  ADD COLUMN IF NOT EXISTS attempt_id uuid REFERENCES public.game_attempts(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS game_sessions_attempt_unique_idx
  ON public.game_sessions(attempt_id) WHERE attempt_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS game_sessions_user_completed_idx
  ON public.game_sessions(user_id, completed_at DESC);

DROP TRIGGER IF EXISTS games_updated_at ON public.games;
CREATE TRIGGER games_updated_at BEFORE UPDATE ON public.games
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS game_questions_updated_at ON public.game_questions;
CREATE TRIGGER game_questions_updated_at BEFORE UPDATE ON public.game_questions
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
DROP TRIGGER IF EXISTS game_attempts_updated_at ON public.game_attempts;
CREATE TRIGGER game_attempts_updated_at BEFORE UPDATE ON public.game_attempts
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "games_select_all" ON public.games;
DROP POLICY IF EXISTS "games_select_active" ON public.games;
CREATE POLICY "games_select_active" ON public.games
FOR SELECT TO authenticated USING (is_active = true);

DROP POLICY IF EXISTS "game_attempts_select_own" ON public.game_attempts;
CREATE POLICY "game_attempts_select_own" ON public.game_attempts
FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "game_attempt_answers_select_own" ON public.game_attempt_answers;
CREATE POLICY "game_attempt_answers_select_own" ON public.game_attempt_answers
FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "game_sessions_select_own" ON public.game_sessions;
CREATE POLICY "game_sessions_select_own" ON public.game_sessions
FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "badges_select_authenticated" ON public.badges;
CREATE POLICY "badges_select_authenticated" ON public.badges
FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "user_badges_select_own" ON public.user_badges;
CREATE POLICY "user_badges_select_own" ON public.user_badges
FOR SELECT TO authenticated USING (auth.uid() = user_id);

REVOKE ALL ON public.game_questions FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.game_attempts FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.game_attempt_answers FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.game_sessions FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.career_scores FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.user_badges FROM anon, authenticated;

/*
  The following RPC definitions are intentionally kept in this same approved
  Stage 1 file so start/finalize operations can be atomic and answer keys stay
  server-side. They are not executed until this migration is applied.
*/

CREATE OR REPLACE FUNCTION public.start_game_attempt(
  p_game_id uuid,
  p_difficulty text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_game public.games%ROWTYPE;
  v_attempt_id uuid := gen_random_uuid();
  v_question_ids uuid[];
  v_question_order jsonb;
  v_questions jsonb;
  v_expires_at timestamptz;
  v_limit integer;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  SELECT * INTO v_game FROM public.games WHERE id = p_game_id AND is_active = true;
  IF NOT FOUND THEN RAISE EXCEPTION 'Game not found or inactive'; END IF;

  v_limit := CASE WHEN v_game.question_count > 0 THEN v_game.question_count ELSE 10 END;
  WITH selected_questions AS (
    SELECT q.*, row_number() OVER (ORDER BY random())::integer AS question_position
    FROM public.game_questions q
    WHERE q.game_id = p_game_id
      AND q.is_active = true
      AND (p_difficulty IS NULL OR q.difficulty = p_difficulty)
    ORDER BY random()
    LIMIT v_limit
  )
  SELECT
    array_agg(sq.id ORDER BY sq.question_position),
    jsonb_agg(jsonb_build_object(
      'id', sq.id,
      'prompt', sq.prompt,
      'questionType', sq.question_type,
      'options', sq.options,
      'content', sq.content,
      'difficulty', sq.difficulty,
      'points', sq.points,
      'order', sq.question_position
    ) ORDER BY sq.question_position)
  INTO v_question_ids, v_questions
  FROM selected_questions sq;

  IF v_question_ids IS NULL OR cardinality(v_question_ids) = 0 THEN
    RAISE EXCEPTION 'This game has no published questions';
  END IF;

  v_question_order := to_jsonb(v_question_ids);
  IF v_game.time_limit_seconds IS NOT NULL THEN
    v_expires_at := now() + make_interval(secs => v_game.time_limit_seconds);
  END IF;

  INSERT INTO public.game_attempts(
    id, user_id, game_id, game_version, question_ids, question_order,
    total_questions, total_points, expires_at
  )
  SELECT v_attempt_id, v_user_id, p_game_id, v_game.version, v_question_ids,
         v_question_order, cardinality(v_question_ids), COALESCE(sum(points), 0), v_expires_at
  FROM public.game_questions WHERE id = ANY(v_question_ids);

  RETURN jsonb_build_object(
    'attemptId', v_attempt_id, 'gameId', v_game.id, 'name', v_game.name,
    'instructions', v_game.instructions, 'difficulty', v_game.difficulty,
    'timeLimitSeconds', v_game.time_limit_seconds, 'expiresAt', v_expires_at,
    'questions', v_questions
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.finalize_game_attempt(
  p_attempt_id uuid,
  p_answers jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_attempt public.game_attempts%ROWTYPE;
  v_question_id uuid;
  v_selected jsonb;
  v_key jsonb;
  v_correct boolean;
  v_points integer;
  v_correct_count integer := 0;
  v_earned_points integer := 0;
  v_score integer := 0;
  v_xp integer := 0;
  v_new_xp integer := 0;
  v_existing_score_id uuid;
  v_existing_xp integer := 0;
  v_session_id uuid;
  v_duplicate_count integer;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF jsonb_typeof(p_answers) <> 'array' THEN RAISE EXCEPTION 'Answers must be an array'; END IF;

  SELECT * INTO v_attempt FROM public.game_attempts
  WHERE id = p_attempt_id AND user_id = v_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Attempt not found'; END IF;

  IF v_attempt.status = 'submitted' THEN
    RETURN jsonb_build_object(
      'attemptId', v_attempt.id, 'status', v_attempt.status,
      'score', v_attempt.score, 'correctAnswers', v_attempt.correct_answers,
      'totalQuestions', v_attempt.total_questions, 'xpEarned', v_attempt.xp_earned,
      'coinsEarned', v_attempt.coins_earned
    );
  END IF;
  IF v_attempt.status <> 'started' THEN RAISE EXCEPTION 'Attempt is not submit-ready'; END IF;
  IF v_attempt.expires_at IS NOT NULL AND now() > v_attempt.expires_at THEN
    UPDATE public.game_attempts SET status = 'expired', completed_at = now() WHERE id = v_attempt.id;
    RAISE EXCEPTION 'Attempt has expired';
  END IF;

  SELECT count(*) INTO v_duplicate_count
  FROM jsonb_array_elements(p_answers) item;
  IF v_duplicate_count <> (
    SELECT count(DISTINCT item->>'questionId') FROM jsonb_array_elements(p_answers) item
  ) THEN RAISE EXCEPTION 'Duplicate question answers are not allowed'; END IF;

  IF EXISTS (
    SELECT 1
    FROM jsonb_array_elements(p_answers) item
    WHERE NOT EXISTS (
      SELECT 1
      FROM unnest(v_attempt.question_ids) allowed(question_id)
      WHERE allowed.question_id = (item->>'questionId')::uuid
    )
  ) THEN
    RAISE EXCEPTION 'An answer references a question outside this attempt';
  END IF;

  FOR v_question_id IN SELECT unnest(v_attempt.question_ids) LOOP
    SELECT item->'selectedAnswer' INTO v_selected
    FROM jsonb_array_elements(p_answers) item
    WHERE item->>'questionId' = v_question_id::text LIMIT 1;
    SELECT answer_key, points INTO v_key, v_points
    FROM public.game_questions WHERE id = v_question_id;
    v_correct := v_selected IS NOT NULL AND v_selected = v_key;
    IF v_correct THEN v_correct_count := v_correct_count + 1; v_earned_points := v_earned_points + v_points; END IF;
    INSERT INTO public.game_attempt_answers(attempt_id, user_id, question_id, selected_answer, is_correct, points_awarded)
    VALUES (v_attempt.id, v_user_id, v_question_id, COALESCE(v_selected, 'null'::jsonb), v_correct, CASE WHEN v_correct THEN v_points ELSE 0 END);
  END LOOP;

  IF v_attempt.total_points > 0 THEN v_score := round(v_earned_points::numeric / v_attempt.total_points::numeric * 100); END IF;
  v_xp := floor((SELECT xp_reward FROM public.games WHERE id = v_attempt.game_id) * v_score / 100.0);
  SELECT id, xp INTO v_existing_score_id, v_existing_xp FROM public.career_scores WHERE user_id = v_user_id FOR UPDATE;
  v_new_xp := COALESCE(v_existing_xp, 0) + v_xp;

  UPDATE public.game_attempts SET status = 'submitted', completed_at = now(), score = v_score,
    correct_answers = v_correct_count, earned_points = v_earned_points,
    time_taken_seconds = greatest(0, extract(epoch FROM (now() - started_at))::integer),
    xp_earned = v_xp, coins_earned = 0, reward_status = 'awarded' WHERE id = v_attempt.id;

  INSERT INTO public.game_sessions(attempt_id, user_id, game_id, score, xp_earned, coins_earned)
  VALUES (v_attempt.id, v_user_id, v_attempt.game_id, v_score, v_xp, 0)
  RETURNING id INTO v_session_id;

  IF v_existing_score_id IS NULL THEN
    INSERT INTO public.career_scores(user_id, xp) VALUES (v_user_id, v_new_xp);
  ELSE
    UPDATE public.career_scores SET xp = v_new_xp WHERE id = v_existing_score_id;
  END IF;

  INSERT INTO public.user_badges(user_id, badge_id)
  SELECT v_user_id, b.id FROM public.badges b
  WHERE b.xp_required <= v_new_xp
    AND NOT EXISTS (SELECT 1 FROM public.user_badges ub WHERE ub.user_id = v_user_id AND ub.badge_id = b.id)
  ON CONFLICT (user_id, badge_id) DO NOTHING;

  RETURN jsonb_build_object(
    'attemptId', v_attempt.id, 'sessionId', v_session_id, 'status', 'submitted',
    'score', v_score, 'correctAnswers', v_correct_count,
    'totalQuestions', v_attempt.total_questions, 'xpEarned', v_xp,
    'coinsEarned', 0
  );
END;
$$;

REVOKE ALL ON FUNCTION public.start_game_attempt(uuid, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.finalize_game_attempt(uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.start_game_attempt(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_game_attempt(uuid, jsonb) TO authenticated;

COMMENT ON TABLE public.game_questions IS
  'Answer keys are backend-only and must never be returned by normal frontend queries.';
COMMENT ON TABLE public.game_attempts IS
  'Created and finalized only by trusted backend functions; owner read access only.';
COMMENT ON COLUMN public.game_sessions.attempt_id IS
  'Nullable for historical sessions; new trusted sessions must reference an attempt.';

COMMIT;
