-- ─── Settings table (portal configs, email config, etc.) ───
CREATE TABLE IF NOT EXISTS public.settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Email history table ───
CREATE TABLE IF NOT EXISTS public.email_history (
  id          BIGSERIAL PRIMARY KEY,
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  to_email    TEXT NOT NULL,
  to_name     TEXT,
  subject     TEXT NOT NULL,
  body        TEXT,
  property_id BIGINT REFERENCES public.properties(id) ON DELETE SET NULL,
  contact_id  BIGINT REFERENCES public.contacts(id) ON DELETE SET NULL,
  status      TEXT NOT NULL DEFAULT 'sent'  -- sent | failed
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_email_history_contact  ON public.email_history(contact_id);
CREATE INDEX IF NOT EXISTS idx_email_history_property ON public.email_history(property_id);
CREATE INDEX IF NOT EXISTS idx_email_history_sent_at  ON public.email_history(sent_at DESC);

-- RLS (keep permissive for now — admin-only app)
ALTER TABLE public.settings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users have full access to settings"
  ON public.settings FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users have full access to email_history"
  ON public.email_history FOR ALL
  USING (true)
  WITH CHECK (true);
