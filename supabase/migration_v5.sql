-- migration_v5: gallery de imagens para empreendimentos

ALTER TABLE developments
  ADD COLUMN IF NOT EXISTS images text[] NOT NULL DEFAULT '{}';

-- Backfill: se já tem cover_image, coloca como primeira imagem
UPDATE developments
  SET images = ARRAY[cover_image]
  WHERE cover_image IS NOT NULL AND array_length(images, 1) IS NULL;
