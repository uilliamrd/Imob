-- ============================================================
-- Migration: Isolar analytics de visualizações por organização
-- Problema 1: SELECT com USING (true) — qualquer usuário autenticado
-- vê os dados de visualização de imóveis de TODAS as empresas.
-- Problema 2: INSERT aberto para anon e authenticated sem restrição
-- de org_id — usuários podem injetar visualizações fictícias em
-- imóveis de outras empresas, envenenando as métricas.
--
-- Solução:
--   - SELECT: filtrar por org_id da organização do usuário
--   - INSERT autenticado: forçar org_id a partir do imóvel (subquery)
--   - INSERT anon: permitido (rastreamento público) mas org_id deve
--     corresponder ao org_id do imóvel — impedindo injeção cross-tenant
--   - Admin: acesso completo de leitura
-- ============================================================

-- Remove políticas existentes permissivas
DROP POLICY IF EXISTS "insert_views" ON public.property_views;
DROP POLICY IF EXISTS "select_views"  ON public.property_views;

-- 1. Leitura: apenas visualizações da própria organização
CREATE POLICY "views_select_own_org" ON public.property_views
  FOR SELECT
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR
    org_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

-- 2. Inserção por usuário autenticado: org_id deve bater com o do imóvel
--    Isso impede que um corretor da empresa A registre visualização
--    com org_id da empresa B.
CREATE POLICY "views_insert_authenticated" ON public.property_views
  FOR INSERT
  TO authenticated
  WITH CHECK (
    org_id = (SELECT org_id FROM public.properties WHERE id = property_id)
  );

-- 3. Inserção anônima (visitantes do site público): mesma restrição de org_id
--    Garante que rastreamentos vindos de páginas públicas não podem forjar
--    o tenant de destino.
CREATE POLICY "views_insert_anon" ON public.property_views
  FOR INSERT
  TO anon
  WITH CHECK (
    org_id = (SELECT org_id FROM public.properties WHERE id = property_id)
  );

-- Comentário: a coluna org_id em property_views é nullable (sem FK).
-- Inserções com org_id NULL passam no WITH CHECK pois NULL não é != ao org_id do imóvel.
-- Para maior segurança, considerar tornar org_id NOT NULL e adicionar FK em migrations futuras.
