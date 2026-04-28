
CREATE TABLE public.resume_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  resume_text TEXT NOT NULL,
  score INTEGER NOT NULL,
  summary TEXT,
  strengths JSONB NOT NULL DEFAULT '[]'::jsonb,
  weaknesses JSONB NOT NULL DEFAULT '[]'::jsonb,
  suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
  keywords_found JSONB NOT NULL DEFAULT '[]'::jsonb,
  keywords_missing JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.resume_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own analyses"
  ON public.resume_analyses FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own analyses"
  ON public.resume_analyses FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own analyses"
  ON public.resume_analyses FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_resume_analyses_user_created ON public.resume_analyses(user_id, created_at DESC);
