-- migration_v18: property_highlights e property_boosts
--
-- Destaques avulsos (upsell):
--   destaque_simples | destaque_regional | destaque_topo | super_destaque
--   São complementares ao boost e respeitam os limites do plano.
--   Prioridade de exibição: super_destaque > destaque_topo > destaque_regional > destaque_simples
--
-- Boosts de anúncio:
--   boost_3_dias | boost_7_dias | boost_15_dias | boost_30_dias
--   Podem ser empilhados; expiram automaticamente por expires_at.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Enums ────────────────────────────────────────────────────────────────────

DO $$ BEGIN
  CREATE TYPE highlight_upsell_id AS ENUM (
    'destaque_simples',
    'destaque_regional',
    'destaque_topo',
    'super_destaque'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE boost_id AS ENUM (
    'boost_3_dias',
    'boost_7_dias',
    'boost_15_dias',
    'boost_30_dias'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── property_highlights ──────────────────────────────────────────────────────
-- Registra um destaque avulso comprado para um imóvel específico.
-- expires_at NULL = sem expiração (admin pode conceder destaques permanentes).

CREATE TABLE IF NOT EXISTS property_highlights (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id  uuid        NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  -- proprietário do destaque: corretor avulso (user_id) ou org (org_id)
  user_id      uuid        REFERENCES profiles(id) ON DELETE CASCADE,
  org_id       uuid        REFERENCES organizations(id) ON DELETE CASCADE,
  highlight    highlight_upsell_id NOT NULL,
  -- prioridade desnormalizada para ordenação sem JOIN com plans.ts
  prioridade   smallint    NOT NULL DEFAULT 1,
  status       text        NOT NULL DEFAULT 'ativo'
                CHECK (status IN ('ativo', 'expirado', 'cancelado')),
  expires_at   timestamptz,
  paid_amount  decimal(10,2),
  created_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT property_highlights_owner_check
    CHECK (user_id IS NOT NULL OR org_id IS NOT NULL)
);

-- índice para listagem de imóveis ordenada por destaque ativo
CREATE INDEX IF NOT EXISTS idx_property_highlights_property_active
  ON property_highlights(property_id, status, prioridade DESC);

-- índice para painel do usuário
CREATE INDEX IF NOT EXISTS idx_property_highlights_user
  ON property_highlights(user_id, status);

CREATE INDEX IF NOT EXISTS idx_property_highlights_org
  ON property_highlights(org_id, status);

-- ── property_boosts ──────────────────────────────────────────────────────────
-- Registra um boost comprado para um imóvel. Boosts empilháveis: o ativo é o
-- que tiver expires_at > now() e status = 'ativo'.

CREATE TABLE IF NOT EXISTS property_boosts (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id  uuid        NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id      uuid        REFERENCES profiles(id) ON DELETE CASCADE,
  org_id       uuid        REFERENCES organizations(id) ON DELETE CASCADE,
  boost        boost_id    NOT NULL,
  duracao_dias smallint    NOT NULL,
  status       text        NOT NULL DEFAULT 'ativo'
                CHECK (status IN ('ativo', 'expirado', 'cancelado')),
  starts_at    timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz NOT NULL,
  paid_amount  decimal(10,2),
  created_at   timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT property_boosts_owner_check
    CHECK (user_id IS NOT NULL OR org_id IS NOT NULL)
);

-- índice para verificar boosts ativos em um imóvel (usado na listagem)
CREATE INDEX IF NOT EXISTS idx_property_boosts_property_active
  ON property_boosts(property_id, status, expires_at);

-- índice para painel do usuário
CREATE INDEX IF NOT EXISTS idx_property_boosts_user
  ON property_boosts(user_id, status);

CREATE INDEX IF NOT EXISTS idx_property_boosts_org
  ON property_boosts(org_id, status);

-- ── Função para expirar automaticamente registros vencidos ───────────────────
-- Chamar via cron (pg_cron) ou trigger; seguro rodar várias vezes (idempotente).

CREATE OR REPLACE FUNCTION expire_highlights_and_boosts()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE property_highlights
     SET status = 'expirado'
   WHERE status = 'ativo'
     AND expires_at IS NOT NULL
     AND expires_at < now();

  UPDATE property_boosts
     SET status = 'expirado'
   WHERE status = 'ativo'
     AND expires_at < now();
END;
$$;

-- ── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE property_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_boosts     ENABLE ROW LEVEL SECURITY;

-- Leitura: qualquer autenticado pode ver destaques/boosts ativos (para ordenação pública)
DROP POLICY IF EXISTS "highlights_read_active" ON property_highlights;
CREATE POLICY "highlights_read_active"
  ON property_highlights FOR SELECT
  USING (status = 'ativo');

DROP POLICY IF EXISTS "boosts_read_active" ON property_boosts;
CREATE POLICY "boosts_read_active"
  ON property_boosts FOR SELECT
  USING (status = 'ativo');

-- Admin: acesso total
DROP POLICY IF EXISTS "highlights_admin_all" ON property_highlights;
CREATE POLICY "highlights_admin_all"
  ON property_highlights FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "boosts_admin_all" ON property_boosts;
CREATE POLICY "boosts_admin_all"
  ON property_boosts FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Proprietário: pode ver os seus próprios (ativos ou não)
DROP POLICY IF EXISTS "highlights_read_own" ON property_highlights;
CREATE POLICY "highlights_read_own"
  ON property_highlights FOR SELECT
  USING (
    user_id = auth.uid()
    OR org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "boosts_read_own" ON property_boosts;
CREATE POLICY "boosts_read_own"
  ON property_boosts FOR SELECT
  USING (
    user_id = auth.uid()
    OR org_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );
