-- ============================================================
-- Migration: Isolar empreendimentos por organização
-- Problema: a política de leitura usa `auth.role() = 'authenticated'`
-- sem nenhum filtro de tenant — qualquer usuário logado (de qualquer
-- empresa) pode ver todos os empreendimentos de todas as construtoras.
--
-- Solução: substituir a política de SELECT por uma versão que
-- filtra por org_id para usuários não-admin. Admin mantém visibilidade
-- total. Políticas de escrita são preservadas ou criadas se ausentes.
-- ============================================================

-- Remove a política de leitura permissiva existente
-- (nome pode variar conforme migration que a criou)
DROP POLICY IF EXISTS "developments_read_all"          ON public.developments;
DROP POLICY IF EXISTS "developments_select_all"        ON public.developments;
DROP POLICY IF EXISTS "authenticated_read_developments" ON public.developments;

-- Leitura com isolamento por tenant
CREATE POLICY "developments_select_own_org" ON public.developments
  FOR SELECT
  TO authenticated
  USING (
    -- admin vê todos os empreendimentos
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR
    -- demais usuários veem apenas os da sua organização
    org_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

-- Garante que políticas de escrita existam com verificação de org
-- (usa IF NOT EXISTS implicitamente via DROP + CREATE)
DROP POLICY IF EXISTS "developments_write_org" ON public.developments;
CREATE POLICY "developments_write_org" ON public.developments
  FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR
    org_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR
    org_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

-- Comentário: a política de escrita cobre INSERT, UPDATE e DELETE.
-- A política de SELECT é separada para que o USING seja aplicado
-- corretamente na leitura sem conflito com o WITH CHECK de escrita.
-- Dropar "developments_write_org" e recriar é seguro — a política
-- anterior pode já ter org_id correto; esta versão garante explicitamente.
