-- ============================================================
-- Migration: Isolar impulsionamentos de imóveis por organização
-- Problema: a política "auth_boosts" usa USING (true) —
-- qualquer usuário autenticado pode ver, criar, editar e deletar
-- impulsionamentos de imóveis de qualquer empresa.
--
-- Solução: idêntica à migration de property_highlights —
-- substituir a política única por quatro políticas específicas
-- filtrando por org_id. Admin tem acesso irrestrito.
-- ============================================================

-- Remove a política permissiva existente
DROP POLICY IF EXISTS "auth_boosts" ON public.property_boosts;

-- 1. Leitura: apenas impulsionamentos da própria organização
CREATE POLICY "boosts_select_own_org" ON public.property_boosts
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR
    org_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

-- 2. Inserção: apenas na própria organização
CREATE POLICY "boosts_insert_own_org" ON public.property_boosts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR
    org_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

-- 3. Atualização: apenas impulsionamentos da própria organização
CREATE POLICY "boosts_update_own_org" ON public.property_boosts
  FOR UPDATE
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

-- 4. Deleção: apenas impulsionamentos da própria organização
CREATE POLICY "boosts_delete_own_org" ON public.property_boosts
  FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR
    org_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );
