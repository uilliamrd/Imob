-- Subscription fields for organizations
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_due_date timestamptz;

ALTER TABLE organizations
  DROP CONSTRAINT IF EXISTS organizations_subscription_status_check;
ALTER TABLE organizations
  ADD CONSTRAINT organizations_subscription_status_check
  CHECK (subscription_status IN ('trial', 'active', 'suspended', 'expired'));

-- Subscription fields for profiles (corretores avulsos)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS subscription_status text NOT NULL DEFAULT 'trial',
  ADD COLUMN IF NOT EXISTS subscription_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS payment_due_date timestamptz;

ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_subscription_status_check;
ALTER TABLE profiles
  ADD CONSTRAINT profiles_subscription_status_check
  CHECK (subscription_status IN ('trial', 'active', 'suspended', 'expired'));
