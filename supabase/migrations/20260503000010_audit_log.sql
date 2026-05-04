-- ============================================================
-- Migration: Tabela de auditoria de alterações críticas
-- Objetivo: rastrear automaticamente INSERT, UPDATE e DELETE
-- nas tabelas sensíveis do sistema, associando cada operação
-- ao usuário e organização que a executou.
-- ============================================================

-- 1. Tabela principal de log de auditoria
CREATE TABLE IF NOT EXISTS public.audit_log (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   timestamptz NOT NULL DEFAULT now(),
  table_name   text        NOT NULL,                  -- tabela alterada
  operation    text        NOT NULL,                  -- INSERT | UPDATE | DELETE
  old_data     jsonb,                                 -- estado antes (NULL em INSERT)
  new_data     jsonb,                                 -- estado depois (NULL em DELETE)
  user_id      uuid,                                  -- auth.uid() no momento da operação
  org_id       uuid,                                  -- organization_id do usuário
  ip_address   text                                   -- opcional: preenchido pela aplicação
);

-- 2. Índices para performance em consultas de auditoria
CREATE INDEX IF NOT EXISTS idx_audit_log_table_operation
  ON public.audit_log (table_name, operation);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id
  ON public.audit_log (user_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_org_id
  ON public.audit_log (org_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_created_at
  ON public.audit_log (created_at DESC);

-- 3. Habilitar RLS na tabela de auditoria
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ler os logs — e somente os da sua própria organização
DROP POLICY IF EXISTS "audit_log_select_admin" ON public.audit_log;
CREATE POLICY "audit_log_select_admin" ON public.audit_log
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    AND
    (
      -- Admin sem org: vê todos (admin de plataforma)
      (SELECT organization_id FROM public.profiles WHERE id = auth.uid()) IS NULL
      OR
      -- Admin com org: vê apenas os da sua organização
      org_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    )
  );

-- Ninguém pode inserir, alterar ou deletar diretamente (apenas o trigger escreve)
-- O service_role bypassa o RLS, então o trigger (SECURITY DEFINER) consegue inserir.

-- 4. Função genérica do trigger de auditoria
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_org_id  uuid;
BEGIN
  -- Captura o usuário atual (NULL para service_role — operações de sistema)
  v_user_id := auth.uid();

  -- Busca org_id do usuário, se existir
  IF v_user_id IS NOT NULL THEN
    SELECT organization_id INTO v_org_id
    FROM public.profiles
    WHERE id = v_user_id;
  END IF;

  INSERT INTO public.audit_log (
    table_name,
    operation,
    old_data,
    new_data,
    user_id,
    org_id
  ) VALUES (
    TG_TABLE_NAME,
    TG_OP,
    CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
    v_user_id,
    v_org_id
  );

  -- Trigger AFTER: retornar NULL é correto (não afeta a operação original)
  RETURN NULL;
END;
$$;

-- 5. Macro para criar o trigger em cada tabela (idempotente)
-- Tabelas críticas que serão auditadas:

-- leads
DROP TRIGGER IF EXISTS audit_leads ON public.leads;
CREATE TRIGGER audit_leads
  AFTER INSERT OR UPDATE OR DELETE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- profiles
DROP TRIGGER IF EXISTS audit_profiles ON public.profiles;
CREATE TRIGGER audit_profiles
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- organizations
DROP TRIGGER IF EXISTS audit_organizations ON public.organizations;
CREATE TRIGGER audit_organizations
  AFTER INSERT OR UPDATE OR DELETE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- properties
DROP TRIGGER IF EXISTS audit_properties ON public.properties;
CREATE TRIGGER audit_properties
  AFTER INSERT OR UPDATE OR DELETE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- developments
DROP TRIGGER IF EXISTS audit_developments ON public.developments;
CREATE TRIGGER audit_developments
  AFTER INSERT OR UPDATE OR DELETE ON public.developments
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- property_boosts
DROP TRIGGER IF EXISTS audit_property_boosts ON public.property_boosts;
CREATE TRIGGER audit_property_boosts
  AFTER INSERT OR UPDATE OR DELETE ON public.property_boosts
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- property_highlights
DROP TRIGGER IF EXISTS audit_property_highlights ON public.property_highlights;
CREATE TRIGGER audit_property_highlights
  AFTER INSERT OR UPDATE OR DELETE ON public.property_highlights
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Comentário: os triggers são AFTER (não BEFORE) — garantem que a operação
-- original foi confirmada antes de registrar no log. Se o INSERT/UPDATE/DELETE
-- falhar por constraint, o log não é gerado (consistência garantida).
