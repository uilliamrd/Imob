-- ── Role Secretária ─────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum
    WHERE enumlabel = 'secretaria'
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
  ) THEN
    ALTER TYPE user_role ADD VALUE 'secretaria';
  END IF;
END$$;

-- ── Organizations: highlight quota override e destaque de seção ──────────────
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS highlight_quota integer,
  ADD COLUMN IF NOT EXISTS super_highlight_quota integer,
  ADD COLUMN IF NOT EXISTS is_section_highlighted boolean NOT NULL DEFAULT false;

-- ── Payment records (painel financeiro manual) ───────────────────────────────
CREATE TABLE IF NOT EXISTS payment_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  type text NOT NULL CHECK (type IN ('implantacao', 'mensal', 'landing_page', 'outro')),
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'cancelado')),
  due_date timestamptz,
  paid_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- RLS for payment_records (admin only)
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin full access to payment_records" ON payment_records;
CREATE POLICY "Admin full access to payment_records"
  ON payment_records FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );
