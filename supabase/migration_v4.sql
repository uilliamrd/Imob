-- ============================================================
-- RealState Intelligence — Migration v4
-- Execute this in Supabase SQL Editor
-- ============================================================

-- 1. Add is_active to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- 2. Add whatsapp to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS whatsapp text;

-- 3. Leads table
CREATE TABLE IF NOT EXISTS leads (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          text NOT NULL,
  phone         text NOT NULL,
  property_id   uuid REFERENCES properties(id) ON DELETE SET NULL,
  property_slug text,
  ref_id        uuid REFERENCES profiles(id) ON DELETE SET NULL,
  org_id        uuid REFERENCES organizations(id) ON DELETE SET NULL,
  source        text NOT NULL DEFAULT 'imovel',
  status        text NOT NULL DEFAULT 'novo',
  notes         text,
  created_at    timestamptz DEFAULT now()
);

-- 4. Selections table
CREATE TABLE IF NOT EXISTS selections (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title         text NOT NULL,
  corretor_id   uuid REFERENCES profiles(id) ON DELETE CASCADE,
  org_id        uuid REFERENCES organizations(id) ON DELETE SET NULL,
  is_public     boolean NOT NULL DEFAULT true,
  views         integer NOT NULL DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

-- 5. Selection items
CREATE TABLE IF NOT EXISTS selection_items (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  selection_id  uuid REFERENCES selections(id) ON DELETE CASCADE,
  property_id   uuid REFERENCES properties(id) ON DELETE CASCADE,
  sort_order    integer NOT NULL DEFAULT 0,
  created_at    timestamptz DEFAULT now(),
  UNIQUE (selection_id, property_id)
);

-- 6. Ingest logs
CREATE TABLE IF NOT EXISTS ingest_logs (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  status          text NOT NULL,
  message         text NOT NULL,
  payload_summary text,
  rows_processed  integer NOT NULL DEFAULT 0,
  rows_created    integer NOT NULL DEFAULT 0,
  rows_updated    integer NOT NULL DEFAULT 0,
  rows_errored    integer NOT NULL DEFAULT 0,
  created_at      timestamptz DEFAULT now()
);

-- 7. RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE selection_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingest_logs ENABLE ROW LEVEL SECURITY;

-- Leads: insert sem auth (capturas públicas); leitura só para org/admin
CREATE POLICY "public can insert leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "org members read own leads" ON leads FOR SELECT
  USING (
    org_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
    OR ref_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "org members update own leads" ON leads FOR UPDATE
  USING (
    org_id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
    OR ref_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Selections: corretor gerencia as suas; página pública lê is_public
CREATE POLICY "corretor manages own selections" ON selections FOR ALL
  USING (corretor_id = auth.uid())
  WITH CHECK (corretor_id = auth.uid());
CREATE POLICY "public reads public selections" ON selections FOR SELECT
  USING (is_public = true);

-- Selection items
CREATE POLICY "corretor manages own items" ON selection_items FOR ALL
  USING (
    selection_id IN (SELECT id FROM selections WHERE corretor_id = auth.uid())
  )
  WITH CHECK (
    selection_id IN (SELECT id FROM selections WHERE corretor_id = auth.uid())
  );
CREATE POLICY "public reads items of public selections" ON selection_items FOR SELECT
  USING (
    selection_id IN (SELECT id FROM selections WHERE is_public = true)
  );

-- Ingest logs: only admin
CREATE POLICY "admin reads ingest logs" ON ingest_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "service role inserts ingest logs" ON ingest_logs FOR INSERT
  WITH CHECK (true);
