  -- ============================================================
  -- Migration: Prevenir edição cross-tenant de imóveis
  -- Problema: a política "properties_write_org" permite que qualquer
  -- usuário com role admin, imobiliaria ou construtora modifique
  -- QUALQUER imóvel — sem verificar se o imóvel pertence à sua empresa.
  -- Um corretor/imobiliária da empresa A pode alterar imóveis da empresa B.
  --
  -- Solução: recriar a política de escrita adicionando verificação de
  -- org_id no WITH CHECK. Admin mantém acesso irrestrito.
  -- Políticas de leitura são preservadas (não alteradas aqui).
  -- ============================================================

  -- Remove a política de escrita permissiva
  DROP POLICY IF EXISTS "properties_write_org" ON public.properties;

  -- Recria com restrição de tenant no WITH CHECK
  CREATE POLICY "properties_write_org" ON public.properties
    FOR ALL
    TO authenticated
    USING (
      -- admin pode ler/filtrar qualquer imóvel para operações de escrita
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
      OR
      -- demais roles: apenas imóveis da própria organização
      (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('imobiliaria', 'construtora', 'corretor')
        AND
        org_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
      )
    )
    WITH CHECK (
      -- admin pode gravar em qualquer org
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
      OR
      -- demais roles: org_id do imóvel deve ser a própria org
      (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('imobiliaria', 'construtora', 'corretor')
        AND
        org_id = (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
      )
    );

  -- Comentário: a cláusula USING controla quais linhas o usuário pode
  -- "ver" para operações de escrita (UPDATE/DELETE precisam encontrar
  -- a linha primeiro). WITH CHECK valida o estado final após a escrita.
  -- Ambas precisam da restrição de org_id para prevenir edição cross-tenant.
