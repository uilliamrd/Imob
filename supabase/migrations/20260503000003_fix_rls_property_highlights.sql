-- ============================================================
-- Migration: Isolar destaques de imóveis por organização
-- Problema: a política "auth_highlights" usa USING (true) —
-- qualquer usuário autenticado pode ver, criar, editar e deletar
-- destaques de imóveis de qualquer empresa.
--
-- Solução: substituir a política única por quatro políticas
-- específicas (SELECT / INSERT / UPDATE / DELETE) filtrando
-- org_id pelo organization_id do usuário autenticado.
-- Admin tem acesso irrestrito em todas as operações.
-- ============================================================

-- Remove a política permissiva existente
DROP POLICY IF EXISTS "auth_highlights" ON public.property_highlights;

-- Helper reutilizado nas políticas: org_id do usuário atual
-- (inline como subquery para compatibilidade com RLS)

-- 1. Leitura: apenas destaques da própria organização
CREATE POLICY "highlights_select_own_org" ON public.property_highlights
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR
    org_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

-- 2. Inserção: apenas na própria organização
CREATE POLICY "highlights_insert_own_org" ON public.property_highlights
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR
    org_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

-- 3. Atualização: apenas destaques da própria organização
CREATE POLICY "highlights_update_own_org" ON public.property_highlights
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

-- 4. Deleção: apenas destaques da própria organização
CREATE POLICY "highlights_delete_own_org" ON public.property_highlights
  FOR DELETE
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR
    org_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );
