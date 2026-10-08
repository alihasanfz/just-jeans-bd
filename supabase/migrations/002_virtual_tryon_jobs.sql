-- =========================================================
-- JEANS BD - VIRTUAL TRY-ON JOBS TABLE MIGRATION
-- =========================================================

CREATE TABLE IF NOT EXISTS public.virtual_tryon_jobs (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL DEFAULT '',
  input_image_url TEXT NOT NULL,
  garment_image_url TEXT NOT NULL,
  result_image_url TEXT,
  garment_type TEXT NOT NULL DEFAULT 'jacket',
  category TEXT NOT NULL DEFAULT 'tops',
  selected_size TEXT DEFAULT 'M',
  selected_color TEXT DEFAULT '',
  provider TEXT NOT NULL DEFAULT 'auto',
  provider_job_id TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed', 'expired')),
  step_description TEXT DEFAULT 'Queued for processing',
  progress_percent INT DEFAULT 0,
  error_message TEXT,
  processing_time_ms INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS idx_vto_status ON public.virtual_tryon_jobs(status);
CREATE INDEX IF NOT EXISTS idx_vto_created_at ON public.virtual_tryon_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_vto_user_id ON public.virtual_tryon_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_vto_product_id ON public.virtual_tryon_jobs(product_id);

-- Enable RLS
ALTER TABLE public.virtual_tryon_jobs ENABLE ROW LEVEL SECURITY;

-- Allow public read of non-expired jobs (for anonymous customer polling)
CREATE POLICY "Allow public read own jobs" ON public.virtual_tryon_jobs
  FOR SELECT USING (true);

-- Allow public insert of jobs
CREATE POLICY "Allow public insert jobs" ON public.virtual_tryon_jobs
  FOR INSERT WITH CHECK (true);

-- Allow updates (status changes)
CREATE POLICY "Allow update jobs" ON public.virtual_tryon_jobs
  FOR UPDATE USING (true);
