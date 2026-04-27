-- migration_v19: Composite indexes for high-traffic query patterns
-- Apply in Supabase Dashboard > SQL Editor
-- Note: CONCURRENTLY removed — SQL Editor runs inside a transaction block.
-- Safe to run on an empty/low-traffic DB. For a live DB with heavy write load,
-- run each statement individually via psql outside a transaction.

CREATE INDEX IF NOT EXISTS idx_properties_portal
  ON properties (visibility, status, created_at DESC)
  WHERE visibility = 'publico' AND status = 'disponivel';

CREATE INDEX IF NOT EXISTS idx_properties_org_portal
  ON properties (org_id, visibility, status)
  WHERE visibility = 'publico' AND status = 'disponivel';

CREATE INDEX IF NOT EXISTS idx_leads_org_created
  ON leads (org_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_leads_phone_ref
  ON leads (phone, ref_id)
  WHERE ref_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_developments_org
  ON developments (org_id);

CREATE INDEX IF NOT EXISTS idx_properties_development
  ON properties (development_id, status, price)
  WHERE development_id IS NOT NULL;


CREATE INDEX IF NOT EXISTS idx_property_ads_active
  ON property_ads (status, tier, property_id)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_profiles_role
  ON profiles (role)
  WHERE role IN ('admin', 'corretor', 'construtora', 'imobiliaria');

CREATE INDEX IF NOT EXISTS idx_property_listings_user
  ON property_listings (user_id, is_featured DESC, created_at DESC);
