-- migration_v20: property_highlights, property_boosts, property_views

CREATE TABLE IF NOT EXISTS property_highlights (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  org_id      UUID REFERENCES organizations(id) ON DELETE SET NULL,
  highlight   TEXT NOT NULL,
  prioridade  INT DEFAULT 1,
  status      TEXT DEFAULT 'pendente' CHECK (status IN ('pendente','ativo','expirado','cancelado')),
  expires_at  TIMESTAMPTZ,
  paid_amount NUMERIC(10,2),
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS property_boosts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id  UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  org_id       UUID REFERENCES organizations(id) ON DELETE SET NULL,
  boost        TEXT NOT NULL,
  duracao_dias INT NOT NULL,
  status       TEXT DEFAULT 'pendente' CHECK (status IN ('pendente','ativo','expirado','cancelado')),
  starts_at    TIMESTAMPTZ,
  expires_at   TIMESTAMPTZ,
  paid_amount  NUMERIC(10,2),
  created_at   TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS property_views (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  org_id      UUID,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ph_property ON property_highlights(property_id);
CREATE INDEX IF NOT EXISTS idx_ph_status   ON property_highlights(status);
CREATE INDEX IF NOT EXISTS idx_pb_property ON property_boosts(property_id);
CREATE INDEX IF NOT EXISTS idx_pb_status   ON property_boosts(status);
CREATE INDEX IF NOT EXISTS idx_pv_property ON property_views(property_id);
CREATE INDEX IF NOT EXISTS idx_pv_created  ON property_views(created_at);
CREATE INDEX IF NOT EXISTS idx_pv_org      ON property_views(org_id);

ALTER TABLE property_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_boosts     ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_views      ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_highlights" ON property_highlights
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "auth_boosts" ON property_boosts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "insert_views" ON property_views
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "select_views" ON property_views
  FOR SELECT TO authenticated USING (true);
