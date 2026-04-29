-- Migration v22: Asaas integration fields

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS asaas_customer_id      text,
  ADD COLUMN IF NOT EXISTS asaas_subscription_id  text;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS asaas_customer_id      text,
  ADD COLUMN IF NOT EXISTS asaas_subscription_id  text;

ALTER TABLE public.property_highlights
  ADD COLUMN IF NOT EXISTS asaas_payment_id text;

ALTER TABLE public.property_boosts
  ADD COLUMN IF NOT EXISTS asaas_payment_id text;

CREATE INDEX IF NOT EXISTS idx_orgs_asaas_customer
  ON public.organizations(asaas_customer_id)
  WHERE asaas_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_asaas_customer
  ON public.profiles(asaas_customer_id)
  WHERE asaas_customer_id IS NOT NULL;
