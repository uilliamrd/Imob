-- migration_v19: Composite indexes for high-traffic query patterns
-- Apply in Supabase Dashboard > SQL Editor

-- Portal home: properties filtered by visibility + status, ordered by created_at
-- Used by: (portal)/page.tsx, buildOrgList, construtoras, imobiliarias pages
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_portal
  ON properties (visibility, status, created_at DESC)
  WHERE visibility = 'publico' AND status = 'disponivel';

-- buildOrgList batch query: properties filtered by org_id list + visibility + status
-- Used by: (portal)/page.tsx buildOrgList, construtoras/page.tsx, imobiliarias/page.tsx
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_org_portal
  ON properties (org_id, visibility, status)
  WHERE visibility = 'publico' AND status = 'disponivel';

-- Leads queries by org: dashboard lead list filtered by org_id, ordered by created_at
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_org_created
  ON leads (org_id, created_at DESC);

-- Leads conflict detection: phone lookup (already has single-col index typically, but explicit composite)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_leads_phone_ref
  ON leads (phone, ref_id)
  WHERE ref_id IS NOT NULL;

-- Developments by org: construtora page fetches all developments for an org
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_developments_org
  ON developments (org_id);

-- Properties by development: lancamento page fetches all units for a development
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_properties_development
  ON properties (development_id, status, price)
  WHERE development_id IS NOT NULL;

-- Corretor scores lookup: lead rodízio queries top score per org
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_corretor_scores_org_score
  ON corretor_scores (organization_id, score DESC, last_lead_at ASC NULLS FIRST);

-- Property ads: active ads lookup for portal home
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_property_ads_active
  ON property_ads (status, tier, property_id)
  WHERE status = 'active';

-- Profiles by role: middleware + page guards query by role
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_role
  ON profiles (role)
  WHERE role IN ('admin', 'corretor', 'construtora', 'imobiliaria');

-- Property listings by user: corretor page fetches listings for a user
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_property_listings_user
  ON property_listings (user_id, is_featured DESC, created_at DESC);
