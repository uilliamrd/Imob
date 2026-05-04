-- ============================================================
-- Migration: Habilitar RLS em lead_conflicts
-- Problema: a tabela não tem RLS ativo nem políticas definidas.
-- Qualquer usuário autenticado pode ler e escrever conflitos de
-- leads de qualquer empresa — incluindo dados de clientes e
-- atribuições de corretores de empresas concorrentes.
--
-- Solução:
--   1. Habilitar RLS na tabela
--   2. SELECT: corretor vê seus próprios conflitos; admin vê todos;
--      outros membros da mesma org veem via join com leads
--   3. UPDATE: corretor pode marcar acknowledged nos seus conflitos
--   4. INSERT/DELETE: somente service_role (backend) — auth.uid() é NULL
-- ============================================================

-- 1. Habilitar RLS
ALTER TABLE public.lead_conflicts ENABLE ROW LEVEL SECURITY;

-- 2. Política de leitura
--    - Admin: vê todos
--    - Corretor: vê conflitos onde é o corretor original
--    - Outros da mesma org: veem via org_id do lead original
DROP POLICY IF EXISTS "lead_conflicts_select" ON public.lead_conflicts;
CREATE POLICY "lead_conflicts_select" ON public.lead_conflicts
  FOR SELECT
  TO authenticated
  USING (
    -- admin vê tudo
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR
    -- corretor envolvido no conflito
    original_corretor_id = auth.uid()
    OR
    -- membros da mesma organização do lead original
    EXISTS (
      SELECT 1
      FROM public.leads l
      JOIN public.profiles p ON p.id = auth.uid()
      WHERE l.id = original_lead_id
        AND l.org_id = p.organization_id
    )
  );

-- 3. Política de atualização (corretor pode marcar acknowledged)
DROP POLICY IF EXISTS "lead_conflicts_update_own" ON public.lead_conflicts;
CREATE POLICY "lead_conflicts_update_own" ON public.lead_conflicts
  FOR UPDATE
  TO authenticated
  USING (original_corretor_id = auth.uid())
  WITH CHECK (original_corretor_id = auth.uid());

-- 4. INSERT e DELETE: somente service_role (auth.uid() IS NULL = backend)
--    Não criamos políticas para authenticated — o padrão do RLS nega implicitamente.
--    O adminClient (service_role) bypassa o RLS por completo.

-- Comentário: conflitos são criados e deletados exclusivamente pelo sistema backend
-- (trigger ou lógica de negócio). Corretores só leem e confirmam (acknowledged).
