-- ─── migration_v21_assets ─────────────────────────────────────────────────────
-- Pipeline de mídia: tabela de assets + bucket temporário para uploads

-- Bucket temporário privado (arquivos são deletados após processamento)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads-temp',
  'uploads-temp',
  false,
  104857600,
  ARRAY[
    'image/jpeg','image/jpg','image/png','image/webp','image/avif','image/heic',
    'image/gif',
    'video/mp4','video/quicktime','video/x-msvideo','video/x-matroska',
    'application/pdf'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para o bucket temporário
CREATE POLICY "uploads_temp_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'uploads-temp');

CREATE POLICY "uploads_temp_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'uploads-temp');

CREATE POLICY "uploads_temp_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'uploads-temp');

-- ─── Tabela de assets ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.assets (
  id                uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid          NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  owner_type        text          NOT NULL CHECK (owner_type IN ('property','organization','profile','development','pending')),
  owner_id          uuid,
  type              text          NOT NULL CHECK (type IN ('image','video','pdf','document')),
  mime              text          NOT NULL,
  original_name     text          NOT NULL,
  size_original     bigint        NOT NULL,
  size_optimized    bigint,
  compression_ratio numeric(5,2),
  width             integer,
  height            integer,
  duration          integer,
  pages             integer,
  hash              text          NOT NULL,
  storage_bucket    text          NOT NULL,
  storage_key       text          NOT NULL,
  variants          jsonb         NOT NULL DEFAULT '{}',
  status            text          NOT NULL DEFAULT 'processing'
                    CHECK (status IN ('processing','ready','error','deleted')),
  error_msg         text,
  metadata          jsonb         NOT NULL DEFAULT '{}',
  deleted_at        timestamptz,
  created_at        timestamptz   NOT NULL DEFAULT now(),
  updated_at        timestamptz   NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_assets_owner   ON public.assets(owner_type, owner_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_assets_tenant  ON public.assets(tenant_id)             WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_assets_hash    ON public.assets(hash)                  WHERE deleted_at IS NULL AND status = 'ready';
CREATE INDEX IF NOT EXISTS idx_assets_status  ON public.assets(status, created_at)    WHERE deleted_at IS NULL;

-- RLS
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assets_select_own_org" ON public.assets FOR SELECT
  USING (
    tenant_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND organization_id IS NOT NULL
    )
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "assets_insert_own_org" ON public.assets FOR INSERT
  WITH CHECK (
    tenant_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND organization_id IS NOT NULL
    )
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "assets_update_own_org" ON public.assets FOR UPDATE
  USING (
    tenant_id IN (
      SELECT organization_id FROM public.profiles WHERE id = auth.uid() AND organization_id IS NOT NULL
    )
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Trigger para updated_at
CREATE TRIGGER assets_updated_at
  BEFORE UPDATE ON public.assets
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
