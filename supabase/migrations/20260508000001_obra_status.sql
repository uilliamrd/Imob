-- 1. Adicionar campos de status de obra na tabela developments
ALTER TABLE developments
  ADD COLUMN IF NOT EXISTS obra_fase text
    CHECK (obra_fase IN (
      'pre_lancamento','lancamento','fundacao',
      'estrutura','alvenaria','acabamento','entregue'
    )),
  ADD COLUMN IF NOT EXISTS obra_percent integer
    DEFAULT 0 CHECK (obra_percent >= 0 AND obra_percent <= 100),
  ADD COLUMN IF NOT EXISTS obra_prazo date;

-- 2. Criar tabela de atualizações de obra
CREATE TABLE IF NOT EXISTS development_updates (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  development_id uuid NOT NULL REFERENCES developments(id) ON DELETE CASCADE,
  org_id         uuid REFERENCES organizations(id) ON DELETE SET NULL,
  title          text NOT NULL,
  body           text,
  image_url      text,
  created_at     timestamptz DEFAULT now()
);

-- 3. RLS na tabela de atualizações
ALTER TABLE development_updates ENABLE ROW LEVEL SECURITY;

-- Leitura pública
CREATE POLICY "public_read_updates"
  ON development_updates FOR SELECT
  USING (true);

-- Inserção/edição apenas pela própria org
CREATE POLICY "org_insert_updates"
  ON development_updates FOR INSERT
  WITH CHECK (
    org_id = (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "org_update_updates"
  ON development_updates FOR UPDATE
  USING (
    org_id = (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid()
    )
  );

CREATE POLICY "org_delete_updates"
  ON development_updates FOR DELETE
  USING (
    org_id = (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid()
    )
  );

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_dev_updates_development_id
  ON development_updates(development_id);
CREATE INDEX IF NOT EXISTS idx_dev_updates_created_at
  ON development_updates(created_at DESC);
