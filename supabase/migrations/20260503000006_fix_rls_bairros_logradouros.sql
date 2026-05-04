-- ============================================================
-- Migration: Proteger dados de referência geográfica
-- Problema: as tabelas bairros e logradouros têm políticas com
-- USING (true) WITH CHECK (true) — qualquer usuário autenticado
-- pode inserir, alterar ou deletar bairros e logradouros usados
-- por todos os imóveis do sistema.
--
-- Solução:
--   - SELECT: mantido aberto para todos os autenticados (dados de referência)
--   - INSERT/UPDATE/DELETE: exigir role 'admin' ou 'construtora'
--     (construtoras gerenciam seus próprios empreendimentos e precisam
--      cadastrar bairros/logradouros localmente)
-- ============================================================

-- ─── BAIRROS ───────────────────────────────────────────────

-- Remove políticas existentes permissivas
DROP POLICY IF EXISTS "bairros_admin" ON public.bairros;
DROP POLICY IF EXISTS "bairros_all"   ON public.bairros;

-- Leitura: qualquer usuário autenticado pode consultar bairros
CREATE POLICY "bairros_select_authenticated" ON public.bairros
  FOR SELECT
  TO authenticated
  USING (true);

-- Escrita: apenas admin e construtora
CREATE POLICY "bairros_write_admin_construtora" ON public.bairros
  FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'construtora')
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'construtora')
  );

-- ─── LOGRADOUROS ───────────────────────────────────────────

-- Remove políticas existentes permissivas
DROP POLICY IF EXISTS "logradouros_admin" ON public.logradouros;
DROP POLICY IF EXISTS "logradouros_all"   ON public.logradouros;

-- Leitura: qualquer usuário autenticado pode consultar logradouros
CREATE POLICY "logradouros_select_authenticated" ON public.logradouros
  FOR SELECT
  TO authenticated
  USING (true);

-- Escrita: apenas admin e construtora
CREATE POLICY "logradouros_write_admin_construtora" ON public.logradouros
  FOR ALL
  TO authenticated
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'construtora')
  )
  WITH CHECK (
    (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'construtora')
  );
