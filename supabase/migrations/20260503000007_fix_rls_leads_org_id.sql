-- ============================================================
-- Migration: Blindar org_id de leads contra injeção cross-tenant
-- Problema: a tabela leads permite INSERT público (formulários de
-- contato). Um atacante pode enviar a requisição com org_id de
-- outra empresa, fazendo o lead aparecer no painel de um
-- concorrente — ou simplesmente com org_id inválido.
--
-- Solução: trigger BEFORE INSERT que, quando property_id está
-- presente, sobrescreve NEW.org_id com o org_id real do imóvel.
-- Isso garante que leads criados via formulários públicos sempre
-- pertencem à organização correta, independente do que foi enviado.
--
-- Quando property_id é NULL (formulário genérico sem imóvel),
-- o trigger não altera org_id — a lógica de negócio da aplicação
-- é responsável por definir o valor correto.
-- ============================================================

-- 1. Função do trigger
CREATE OR REPLACE FUNCTION public.enforce_lead_org_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Quando há um imóvel associado, sempre usar o org_id do imóvel
  -- independente do que veio no payload da requisição
  IF NEW.property_id IS NOT NULL THEN
    SELECT org_id INTO NEW.org_id
    FROM public.properties
    WHERE id = NEW.property_id;
  END IF;

  RETURN NEW;
END;
$$;

-- 2. Remove o trigger antigo se existir (idempotente)
DROP TRIGGER IF EXISTS set_lead_org_id ON public.leads;

-- 3. Cria o trigger que executa antes de cada INSERT em leads
CREATE TRIGGER set_lead_org_id
  BEFORE INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_lead_org_id();

-- Comentário: este trigger funciona tanto para INSERTs via
-- service_role (auth.uid() NULL) quanto via anon/authenticated.
-- SECURITY DEFINER garante que o SELECT em properties é executado
-- com permissões do owner da função, não do usuário anônimo.
