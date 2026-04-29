-- migration_v7: tabelas bairros e logradouros

CREATE TABLE IF NOT EXISTS bairros (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  city        text NOT NULL DEFAULT '',
  state       text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS logradouros (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type        text NOT NULL DEFAULT 'Rua',   -- Rua, Avenida, Alameda, etc.
  name        text NOT NULL,
  bairro_id   uuid REFERENCES bairros(id) ON DELETE SET NULL,
  city        text NOT NULL DEFAULT '',
  cep         text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS bairros_city_idx      ON bairros(city);
CREATE INDEX IF NOT EXISTS logradouros_bairro_idx ON logradouros(bairro_id);

-- RLS (admin-only write, anyone read)
ALTER TABLE bairros     ENABLE ROW LEVEL SECURITY;
ALTER TABLE logradouros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "bairros_read"     ON bairros;
DROP POLICY IF EXISTS "bairros_admin"    ON bairros;
DROP POLICY IF EXISTS "logradouros_read" ON logradouros;
DROP POLICY IF EXISTS "logradouros_admin" ON logradouros;

CREATE POLICY "bairros_read"      ON bairros     FOR SELECT USING (true);
CREATE POLICY "bairros_admin"     ON bairros     FOR ALL    USING (true) WITH CHECK (true);
CREATE POLICY "logradouros_read"  ON logradouros FOR SELECT USING (true);
CREATE POLICY "logradouros_admin" ON logradouros FOR ALL    USING (true) WITH CHECK (true);
