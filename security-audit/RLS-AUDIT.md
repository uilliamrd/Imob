# RLS-AUDIT — Base Imob
> Auditoria de Row Level Security (Segurança por Linha) — Isolamento Multi-tenant  
> Data: 2026-05-03 | Modo: somente-leitura, sem alterações

---

## O QUE É RLS?

RLS (Row Level Security) é o mecanismo do Supabase/PostgreSQL que garante que cada empresa (construtora, imobiliária) veja **apenas seus próprios dados**, mesmo que todas compartilhem o mesmo banco. Sem RLS, um usuário da Construtora A poderia ler os leads da Construtora B.

---

## RESUMO EXECUTIVO

| Gravidade | Quantidade |
|-----------|-----------|
| CRÍTICO   | 6         |
| ALTO      | 3         |
| MÉDIO     | 2         |
| BAIXO     | 1         |

> ⚠️ **Este é o relatório mais preocupante.** Há falhas que permitem que usuários autenticados de uma empresa vejam e alterem dados de outras empresas, e uma falha que permite que qualquer usuário se promova a administrador do sistema.

---

## INVENTÁRIO DE TABELAS

| Tabela | Coluna de tenant | RLS ativo? | Risco |
|--------|-----------------|-----------|-------|
| `organizations` | (é o próprio tenant) | ✅ Sim | MÉDIO |
| `profiles` | `organization_id` | ✅ Sim | 🔴 CRÍTICO |
| `properties` | `org_id` | ✅ Sim | 🟠 ALTO |
| `developments` | `org_id` | ✅ Sim | 🟠 ALTO |
| `property_listings` | `org_id` | ✅ Sim | ✅ OK |
| `leads` | `org_id` | ✅ Sim | 🟡 MÉDIO |
| `lead_conflicts` | `org_id` (indireta) | ❌ **NÃO** | 🔴 CRÍTICO |
| `selections` | (via `corretor_id`) | ✅ Sim | ✅ OK |
| `selection_items` | (herda de selections) | ✅ Sim | ✅ OK |
| `property_ads` | `org_id` | ✅ Sim | ✅ OK |
| `property_highlights` | `org_id` | ✅ Sim | 🔴 CRÍTICO |
| `property_boosts` | `org_id` | ✅ Sim | 🔴 CRÍTICO |
| `property_views` | `org_id` | ✅ Sim | 🔴 CRÍTICO |
| `bairros` | N/A (referência) | ✅ Sim | 🔴 CRÍTICO |
| `logradouros` | N/A (referência) | ✅ Sim | 🔴 CRÍTICO |
| `ingest_logs` | N/A | ✅ Sim | ✅ OK |
| `property_submissions` | N/A | ✅ Sim | ✅ OK |
| `assets` | `tenant_id` | ✅ Sim | ✅ OK |

---

## ACHADOS CRÍTICOS

### 🔴 CRÍTICO 1 — Usuário pode se auto-promover a admin

**Tabela:** `profiles`  
**Coluna vulnerável:** `role`

A política atual permite que qualquer usuário atualize seu próprio perfil. **Não há proteção específica na coluna `role`**, então um usuário com acesso à API poderia executar:

```sql
UPDATE profiles SET role = 'admin' WHERE id = auth.uid();
```

**Impacto:** Acesso total ao sistema — visualização de dados de todos os tenants, edição de qualquer registro, acesso ao painel de admin.

**Correção:** Criar uma política separada que impeça a alteração da coluna `role` ou usar um trigger que reverta mudanças na coluna `role`.

---

### 🔴 CRÍTICO 2 — Tabela `lead_conflicts` sem RLS

**Tabela:** `lead_conflicts`  
**RLS ativo:** ❌ NÃO

Esta tabela registra conflitos de leads entre corretores. Sem RLS, qualquer usuário autenticado (de qualquer empresa) pode:
- Ler todos os conflitos de leads de todas as empresas
- Inserir, atualizar ou deletar registros

**Impacto:** Vazamento de informações sobre clientes e atribuições entre corretores de empresas concorrentes.

**Correção:** Habilitar RLS e criar políticas que filtrem por `org_id`.

---

### 🔴 CRÍTICO 3 — `property_highlights` permite acesso cross-tenant

**Tabela:** `property_highlights`  
**Política atual:** `TO authenticated USING (true) WITH CHECK (true)`

"USING (true)" significa "qualquer usuário autenticado, sem restrição". Qualquer corretor de qualquer empresa pode:
- Ver destaques de imóveis de outras empresas
- Criar destaques em imóveis de outras empresas
- Deletar destaques de outras empresas

**Correção:** Adicionar filtro `org_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())`.

---

### 🔴 CRÍTICO 4 — `property_boosts` permite acesso cross-tenant

**Situação idêntica ao CRÍTICO 3.** Mesma política permissiva (`USING (true)`), mesmos riscos.

---

### 🔴 CRÍTICO 5 — `property_views` vaza analytics entre tenants

**Tabela:** `property_views`  
**Política SELECT:** `TO authenticated USING (true)`

Qualquer usuário autenticado vê os dados de visualização de imóveis de **todas** as empresas. Além disso, usuários anônimos (não logados) podem inserir visualizações fictícias — o que envenena as métricas.

---

### 🔴 CRÍTICO 6 — `bairros` e `logradouros` permitem escrita irrestrita

**Tabelas:** `bairros`, `logradouros`  
**Política ALL:** `USING (true) WITH CHECK (true)` — sem verificação de papel (role) ou autenticação real.

Qualquer usuário autenticado pode inserir, atualizar ou deletar bairros e logradouros — dados de referência usados por todos os imóveis do sistema.

> **Nota:** Estas tabelas foram recentemente abertas para `construtora` no código da aplicação, mas a política RLS no banco está completamente aberta para qualquer usuário autenticado, o que vai além da intenção.

---

## ACHADOS ALTOS

### 🟠 ALTO 1 — `developments` visível para todos os usuários autenticados

**Tabela:** `developments`  
**Política SELECT:** `auth.role() = 'authenticated'` (sem filtro de tenant)

Qualquer usuário logado — de qualquer empresa — pode ver todos os empreendimentos de todas as construtoras.

---

### 🟠 ALTO 2 — `properties` permite edição cross-tenant por admins

**Tabela:** `properties`  
**Política de escrita:** Permite que qualquer usuário com role `admin`, `imobiliaria` ou `construtora` modifique **qualquer** imóvel — sem verificar se o imóvel pertence à sua empresa.

---

### 🟠 ALTO 3 — Storage sem isolamento por tenant

**Buckets:** `property-images`, `org-logos`, `avatar-photos`

As políticas de storage permitem que qualquer usuário autenticado faça upload, atualização e **exclusão** de arquivos em qualquer bucket — sem verificar se o arquivo pertence à empresa do usuário.

**Risco:** Um usuário de uma empresa pode deletar logos, fotos e avatares de outra empresa.

---

## ACHADOS MÉDIOS

### 🟡 MÉDIO 1 — `organizations` visível para todos os autenticados

Todos os usuários logados podem ver a lista de todas as organizações cadastradas. Para um SaaS B2B, isso pode representar vazamento de informação competitiva (concorrentes sabem quais imobiliárias e construtoras usam a plataforma).

### 🟡 MÉDIO 2 — `leads` permite inserção pública sem autenticação

A tabela `leads` tem uma política que permite qualquer pessoa (inclusive visitantes não logados) inserir leads. **Isso é intencional** — formulários de contato públicos precisam disso. Mas é importante que o backend valide os dados e implemente proteção contra spam (CAPTCHA ou rate limiting).

---

## CENÁRIOS DE RISCO (como pedido)

| Cenário | Prevenido? |
|---------|-----------|
| 1. Usuário da Construtora A lê leads da Construtora B | ✅ Prevenido — política de leads filtra por `org_id` |
| 2. Usuário da Construtora A atualiza imóvel da Construtora B | ❌ **NÃO prevenido** — política permite qualquer construtora |
| 3. Usuário anônimo lista todos os `profiles` | ✅ Prevenido — `profiles` requer autenticação |
| 4. Usuário comum eleva próprio `role` para admin | ❌ **NÃO prevenido** — sem proteção de coluna |
| 5. Usuário insere lead com `org_id` de outra empresa | ⚠️ Parcialmente — depende do `WITH CHECK` da política |

---

## STORAGE BUCKETS

| Bucket | Público? | Política de leitura | Política de escrita | Risco |
|--------|----------|--------------------|--------------------|-------|
| `property-images` | ✅ Sim | Qualquer pessoa lê | Qualquer autenticado escreve/deleta | 🟠 ALTO |
| `org-logos` | ✅ Sim | Qualquer pessoa lê | Qualquer autenticado escreve/deleta | 🟠 ALTO |
| `avatar-photos` | ✅ Sim | Qualquer pessoa lê | Qualquer autenticado escreve/deleta | 🟠 ALTO |
| `uploads-temp` | ❌ Não | Só autenticado | Só autenticado | 🟡 MÉDIO |

---

## PLANO DE CORREÇÃO (por ordem de prioridade)

| # | Ação | Tabela | Impacto |
|---|------|--------|---------|
| 1 | Proteger coluna `role` com trigger ou policy separada | `profiles` | Elimina escalonamento de privilégio |
| 2 | Habilitar RLS em `lead_conflicts` | `lead_conflicts` | Isola dados entre tenants |
| 3 | Corrigir política de `property_highlights` para filtrar `org_id` | `property_highlights` | Isola destaques |
| 4 | Corrigir política de `property_boosts` para filtrar `org_id` | `property_boosts` | Isola impulsionamentos |
| 5 | Corrigir política de `property_views` para filtrar `org_id` | `property_views` | Isola analytics |
| 6 | Corrigir políticas de `bairros`/`logradouros` para exigir role admin/construtora | `bairros`, `logradouros` | Protege dados de referência |
| 7 | Adicionar filtro de `org_id` na política de leitura de `developments` | `developments` | Isola empreendimentos |
| 8 | Adicionar filtro de `org_id` na política de escrita de `properties` | `properties` | Previne edição cross-tenant |
| 9 | Adicionar filtro de `user_id` ou `org_id` nas políticas de storage | Storage | Previne deleção de arquivos alheios |
