-- ============================================================
-- Migration: Bloqueio de auto-promoção a admin
-- Problema: a policy "profiles_update_own" permite que qualquer
-- usuário autenticado atualize seu próprio perfil, incluindo a
-- coluna "role". Isso permite que um corretor comum execute:
--   UPDATE profiles SET role = 'admin' WHERE id = auth.uid();
-- ... e obtenha acesso irrestrito ao sistema.
--
-- Solução: trigger BEFORE UPDATE que verifica se a coluna "role"
-- está sendo alterada. Se sim, exige que quem está fazendo a
-- alteração já seja admin. Se não for, cancela a operação.
-- O service_role (backend) continua podendo alterar roles,
-- pois auth.uid() retorna NULL quando usado via chave de serviço.
-- ============================================================

-- 1. Função que executa a verificação antes de qualquer UPDATE em profiles
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_role user_role;
BEGIN
  -- Se o campo "role" não está sendo alterado, não há nada a verificar
  IF NEW.role IS NOT DISTINCT FROM OLD.role THEN
    RETURN NEW;
  END IF;

  -- Se auth.uid() é NULL, significa que a requisição vem do service_role
  -- (backend, scripts de seed, triggers internos) — pode alterar role livremente
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  -- Obtém o role de quem está fazendo a alteração
  SELECT role INTO current_user_role
  FROM public.profiles
  WHERE id = auth.uid();

  -- Apenas admins podem alterar o role de alguém
  IF current_user_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION
      'Permissão negada: apenas administradores podem alterar o campo role. '
      'Usuário % tentou alterar role de % para %.',
      auth.uid(), OLD.role, NEW.role;
  END IF;

  RETURN NEW;
END;
$$;

-- 2. Remove o trigger antigo se existir (idempotente)
DROP TRIGGER IF EXISTS check_role_escalation ON public.profiles;

-- 3. Cria o trigger que chama a função antes de cada UPDATE
CREATE TRIGGER check_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  WHEN (NEW.role IS DISTINCT FROM OLD.role)
  EXECUTE FUNCTION public.prevent_role_escalation();

-- 4. Confirma que a policy de update do perfil existe com restrição adequada
-- (permite editar os outros campos do próprio perfil, mas não role — o trigger cuida disso)
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Comentário: a policy acima permite que o usuário atualize seu próprio registro.
-- O trigger check_role_escalation intercepta qualquer tentativa de mudar o campo
-- "role" e bloqueia se o usuário não for admin.
