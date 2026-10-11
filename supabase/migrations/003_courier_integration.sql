-- =========================================================
-- JEANS BD - COURIER INTEGRATION MIGRATION (STEADFAST & PATHAO)
-- =========================================================

-- Ensure tracking columns exist on public.orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'consignment_id'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN consignment_id TEXT DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'courier_name'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN courier_name TEXT DEFAULT '';
  END IF;
END $$;

-- Optional dedicated courier_settings table for server-side key management
CREATE TABLE IF NOT EXISTS public.courier_settings (
  id INT PRIMARY KEY DEFAULT 1,
  default_dhaka TEXT NOT NULL DEFAULT 'Steadfast',
  default_outside_dhaka TEXT NOT NULL DEFAULT 'Pathao',
  auto_dispatch BOOLEAN NOT NULL DEFAULT FALSE,
  steadfast_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  steadfast_api_key TEXT DEFAULT '',
  steadfast_secret_key TEXT DEFAULT '',
  steadfast_base_url TEXT DEFAULT 'https://portal.steadfast.com.bd/api/v1',
  pathao_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  pathao_client_id TEXT DEFAULT '',
  pathao_client_secret TEXT DEFAULT '',
  pathao_username TEXT DEFAULT '',
  pathao_password TEXT DEFAULT '',
  pathao_store_id TEXT DEFAULT '',
  pathao_is_sandbox BOOLEAN NOT NULL DEFAULT FALSE,
  raw_config JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS and public/admin policies
ALTER TABLE public.courier_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Full access courier_settings" ON public.courier_settings;
CREATE POLICY "Full access courier_settings" ON public.courier_settings FOR ALL USING (true) WITH CHECK (true);
