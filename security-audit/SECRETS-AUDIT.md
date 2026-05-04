# SECRETS-AUDIT — Base Imob
> Auditoria de segredos e exposição de chaves  
> Data: 2026-05-03 | Modo: somente-leitura, sem alterações

---

## RESUMO EXECUTIVO

| Gravidade | Quantidade |
|-----------|-----------|
| CRÍTICO   | 0         |
| ALTO      | 2         |
| MÉDIO     | 5         |
| BAIXO     | 3         |

**Veredicto:** Nenhum segredo crítico exposto em código client-side. As preocupações reais são ausência de rate limiting e um token de webhook opcional que deveria ser obrigatório.

---

## A) SERVICE ROLE KEY DO SUPABASE

A chave de serviço do Supabase (`SUPABASE_SERVICE_ROLE_KEY`) dá acesso irrestrito ao banco de dados, bypassando todas as regras de segurança. Ela NUNCA pode aparecer em código client-side.

### Ocorrências encontradas

| Arquivo | Tipo | Gravidade |
|---------|------|-----------|
| `src/lib/supabase/admin.ts` linha 6 | **Servidor** (utilitário) | ✅ OK |
| `src/proxy.ts` linha 63 | **Servidor** (middleware) | ✅ OK |
| `scripts/seed-vista-mar.mjs` linha 20 | Script local de dev | BAIXO |

**Conclusão:** A chave só aparece em código server-side. Nenhuma ocorrência em arquivos com `"use client"`, pasta `/public` ou componentes React.

A função `createAdminClient()` é importada em 70+ arquivos — todos server components, API routes e layouts sem `"use client"`. ✅

---

## B) OUTROS SEGREDOS

### OpenAI API Key
- **Arquivo:** `src/app/api/admin/generate-content/route.ts` linha 22
- **Gravidade:** MÉDIO
- **Situação:** Correta — usada em API route com verificação de autenticação. Apenas roles autorizados (admin, imobiliária, corretor, construtora) chegam a esse endpoint.
- **Problema:** Sem limitação de taxa (rate limiting). Um usuário autenticado mal-intencionado pode disparar centenas de chamadas e esgotar sua cota da OpenAI.

### Asaas API Key (pagamentos)
- **Arquivo:** `src/lib/asaas.ts` linha 11
- **Gravidade:** MÉDIO
- **Situação:** Servidor-side. Chamada apenas de API routes com autenticação.
- **Problema:** Sem rate limiting nos endpoints de pagamento.

### API_INGEST_TOKEN (integração n8n)
- **Arquivo:** `src/app/api/properties/ingest/route.ts` linhas 7-15
- **Gravidade:** ALTO
- **Situação:** Usa comparação timing-safe (boa prática). Mas sem rate limiting — um atacante pode tentar adivinhar o token por força bruta.
- **Ação recomendada:** Adicionar rate limiting no endpoint de ingestão.

### Webhook do Asaas
- **Arquivo:** `src/app/api/webhooks/asaas/route.ts` linha 37
- **Gravidade:** ALTO
- **Problema:** A validação do token do webhook é **opcional** — só ocorre se `ASAAS_WEBHOOK_TOKEN` estiver configurado na variável de ambiente. Se não estiver, qualquer pessoa pode simular eventos de pagamento (ex: marcar assinatura como paga sem pagar).
- **Ação recomendada:** Tornar o token obrigatório; se não estiver configurado, rejeitar a requisição.

### Secrets hardcoded
- Nenhum encontrado. ✅
- Nenhuma chave `sk_live_`, `sk_test_`, `ghp_`, `-----BEGIN`, URL com senha, JWT hardcoded. ✅

---

## C) VARIÁVEIS NEXT_PUBLIC_

Variáveis `NEXT_PUBLIC_` ficam visíveis no navegador do cliente — são embutidas no JavaScript entregue ao usuário.

| Variável | É segura? | Explicação |
|----------|-----------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Sim | URL pública do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Sim | Chave anônima — projetada para ser pública; acesso limitado pelas regras RLS |
| `NEXT_PUBLIC_SITE_URL` | ✅ Sim | URL do site, informação pública |

**Conclusão:** Nenhuma variável sensível exposta via `NEXT_PUBLIC_`. ✅

---

## D) HISTÓRICO DO GIT

- `.env.local` está no `.gitignore` ✅
- `.env.example` commitado apenas com valores de exemplo (sem segredos reais) ✅
- `.env.production` não encontrado no repositório ✅
- Histórico inspecionado: nenhum arquivo `.env` foi commitado acidentalmente ✅

---

## AÇÕES RECOMENDADAS

| Prioridade | Ação | Arquivo |
|-----------|------|---------|
| 🔴 IMEDIATO | Tornar validação do webhook Asaas obrigatória | `src/app/api/webhooks/asaas/route.ts` |
| 🟠 URGENTE | Adicionar rate limiting no endpoint de ingestão | `src/app/api/properties/ingest/route.ts` |
| 🟠 URGENTE | Adicionar rate limiting no gerador de conteúdo IA | `src/app/api/admin/generate-content/route.ts` |
| 🟡 MÉDIO | Adicionar rate limiting nos endpoints de pagamento | `src/app/api/checkout/` |
| 🟢 BAIXO | Remover scripts de seed da build de produção | `scripts/` |
| 🟢 BAIXO | Rotacionar chaves após a auditoria como precaução | Painel Supabase/OpenAI/Asaas |
