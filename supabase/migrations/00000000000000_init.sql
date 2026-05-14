-- InterviewIQ core schema
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT NOT NULL,
  interview_type TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  mode TEXT NOT NULL,
  company_intel_json JSONB,
  questions_json JSONB,
  status TEXT NOT NULL DEFAULT 'setup',
  overall_score NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  transcript TEXT NOT NULL,
  mode TEXT NOT NULL,
  content_score NUMERIC,
  structure_score NUMERIC,
  depth_score NUMERIC,
  confidence_score NUMERIC,
  overall_score NUMERIC,
  feedback_json JSONB,
  confidence_metrics_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  overall_score NUMERIC NOT NULL,
  grade TEXT NOT NULL,
  strengths_json JSONB,
  improvements_json JSONB,
  verdict TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON public.sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_answers_session_id ON public.answers(session_id);
CREATE INDEX IF NOT EXISTS idx_answers_created_at ON public.answers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_session_id ON public.reports(session_id);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their profile" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their profile" ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their profile" ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can read their sessions" ON public.sessions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their sessions" ON public.sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their sessions" ON public.sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read answers for their sessions" ON public.answers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = answers.session_id
        AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert answers for their sessions" ON public.answers
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = answers.session_id
        AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update answers for their sessions" ON public.answers
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = answers.session_id
        AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read reports for their sessions" ON public.reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = reports.session_id
        AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert reports for their sessions" ON public.reports
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = reports.session_id
        AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update reports for their sessions" ON public.reports
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.sessions s
      WHERE s.id = reports.session_id
        AND s.user_id = auth.uid()
    )
  );
