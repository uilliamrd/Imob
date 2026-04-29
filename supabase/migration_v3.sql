-- ============================================================
-- RealState Intelligence — Migration v3 (corrigido)
-- Execute this in Supabase SQL Editor
-- ============================================================

-- 1. Add columns to organizations
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS hero_tagline text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS hero_image text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS about_text text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS about_image text;
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS has_lancamentos boolean NOT NULL DEFAULT false;

-- 2. Set initial slugs from existing names
UPDATE organizations
SET slug = lower(regexp_replace(
  regexp_replace(
    translate(name,
      'áàãâäéèêëíìîïóòõôöúùûüçÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÔÖÚÙÛÜÇ',
      'aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC'),
    '[^a-zA-Z0-9 ]', '', 'g'),
  ' +', '-', 'g'))
WHERE slug IS NULL OR slug = '';

-- 3. Unique index on slug
CREATE UNIQUE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);

-- 4. Add is_delivered to developments
ALTER TABLE developments ADD COLUMN IF NOT EXISTS is_delivered boolean NOT NULL DEFAULT false;

-- 5. Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('org-logos', 'org-logos', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatar-photos', 'avatar-photos', true) ON CONFLICT (id) DO NOTHING;

-- 6. Storage policies (drop first to avoid conflicts)
DROP POLICY IF EXISTS "allow_auth_upload_property_images" ON storage.objects;
DROP POLICY IF EXISTS "allow_auth_upload_org_logos" ON storage.objects;
DROP POLICY IF EXISTS "allow_auth_upload_avatars" ON storage.objects;
DROP POLICY IF EXISTS "allow_public_read_property_images" ON storage.objects;
DROP POLICY IF EXISTS "allow_public_read_org_logos" ON storage.objects;
DROP POLICY IF EXISTS "allow_public_read_avatars" ON storage.objects;
DROP POLICY IF EXISTS "allow_auth_update_storage" ON storage.objects;
DROP POLICY IF EXISTS "allow_auth_delete_storage" ON storage.objects;

CREATE POLICY "allow_auth_upload_property_images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'property-images');

CREATE POLICY "allow_auth_upload_org_logos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'org-logos');

CREATE POLICY "allow_auth_upload_avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatar-photos');

CREATE POLICY "allow_public_read_property_images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'property-images');

CREATE POLICY "allow_public_read_org_logos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'org-logos');

CREATE POLICY "allow_public_read_avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'avatar-photos');

CREATE POLICY "allow_auth_update_storage"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id IN ('property-images', 'org-logos', 'avatar-photos'));

CREATE POLICY "allow_auth_delete_storage"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id IN ('property-images', 'org-logos', 'avatar-photos'));
