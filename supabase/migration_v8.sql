-- migration_v8: campos adicionais em properties + referências a locais

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS categoria      text,
  ADD COLUMN IF NOT EXISTS tipo_negocio   text NOT NULL DEFAULT 'venda',
  ADD COLUMN IF NOT EXISTS cep            text,
  ADD COLUMN IF NOT EXISTS bairro_id      uuid REFERENCES bairros(id)     ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS logradouro_id  uuid REFERENCES logradouros(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS properties_bairro_idx     ON properties(bairro_id);
CREATE INDEX IF NOT EXISTS properties_logradouro_idx ON properties(logradouro_id);
CREATE INDEX IF NOT EXISTS properties_categoria_idx  ON properties(categoria);
