-- migration_v9: proteção contra duplicidade de imóveis

-- Impede a mesma unidade (numero_apto) no mesmo empreendimento
-- Usa índice parcial para só aplicar quando ambos os campos estão preenchidos
CREATE UNIQUE INDEX IF NOT EXISTS idx_properties_unique_unit
  ON properties ((features->>'numero_apto'), development_id)
  WHERE development_id IS NOT NULL
    AND features->>'numero_apto' IS NOT NULL
    AND features->>'numero_apto' <> '';
