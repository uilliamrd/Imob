# DEPENDENCIES-AUDIT — Base Imob
> Auditoria de dependências e vulnerabilidades conhecidas  
> Data: 2026-05-03 | Modo: somente-leitura, sem alterações

---

## RESUMO EXECUTIVO

| Gravidade | Quantidade |
|-----------|-----------|
| CRÍTICO   | 0         |
| ALTO      | 0         |
| MÉDIO     | 4         |
| BAIXO     | 7 (pacotes desatualizados) |

**Veredicto:** Nenhuma vulnerabilidade crítica ou alta. Há 4 vulnerabilidades moderadas — nenhuma é exploração direta da aplicação, mas devem ser corrigidas antes do lançamento. Dependabot não está configurado.

---

## A) VULNERABILIDADES CONHECIDAS (npm audit)

### 🟡 MÉDIO 1 — file-type: loop infinito (DoS)

- **Pacote:** `file-type` v16.5.4 (dependência direta)
- **CVE:** GHSA-5v7r-6r5c-r473
- **Versão segura:** 22.0.1
- **O que é:** Biblioteca que detecta o tipo de arquivo por conteúdo (ex: "isto é um PDF" ou "isto é uma imagem PNG").
- **Problema:** Um arquivo malicioso com cabeçalho ASF (formato de vídeo) zerado pode causar um loop infinito no servidor — travando a requisição indefinidamente (DoS = negação de serviço).
- **Como afeta o Base Imob:** Se o sistema usa `file-type` para validar uploads, um usuário mal-intencionado poderia enviar um arquivo forjado e travar o servidor.
- **Ação:** Atualizar para v22.0.1 — atenção pois é uma mudança de versão maior (breaking change).

---

### 🟡 MÉDIO 2 — postcss: XSS em processamento CSS

- **Pacote:** `postcss` v8.4.31 e v8.5.9 (dependência indireta — via `next`, `tailwindcss`, `shadcn`)
- **CVE:** GHSA-qx2v-qp2m-jg93
- **Versão segura:** 8.5.10+
- **O que é:** PostCSS é o processador de CSS usado internamente pelo Next.js e Tailwind.
- **Problema:** Em certas condições, o PostCSS pode gerar CSS com conteúdo `</style>` sem escapar, permitindo injeção de HTML/JavaScript em páginas que renderizam CSS dinâmico.
- **Como afeta o Base Imob:** Risco baixo para este projeto — o CSS é compilado em build-time, não em runtime com conteúdo de usuário. Mas é boa prática corrigir.
- **Ação:** Atualizar `next` para a versão mais recente (que inclui postcss corrigido).

---

### 🟡 MÉDIO 3 — hono: injeção de HTML via JSX

- **Pacote:** `hono` v4.12.12 (dependência indireta — via `shadcn` → `@modelcontextprotocol/sdk`)
- **CVE:** GHSA-458j-xx4x-4375
- **Versão segura:** 4.12.14+
- **O que é:** Hono é um framework web. O `shadcn` (biblioteca de componentes de UI) o inclui indiretamente.
- **Problema:** Nomes de atributos JSX são tratados de forma incorreta, permitindo injeção de HTML em contextos de Server-Side Rendering.
- **Como afeta o Base Imob:** Risco baixo — `hono` não é usado diretamente no código da aplicação. A vulnerabilidade está em uma dependência de ferramenta de desenvolvimento.
- **Ação:** Atualizar `shadcn` para v4.6.0.

---

### 🟡 MÉDIO 4 — next: herdado do postcss (MÉDIO 2)

- **Pacote:** `next` v16.2.3 carrega `postcss` vulnerável
- **Ação:** Mesma do MÉDIO 2 — atualizar `next`.

---

## B) PACOTES DESATUALIZADOS

### Pacotes principais

| Pacote | Versão atual | Atualização | Tipo |
|--------|-------------|-------------|------|
| `next` | 16.2.3 | 16.2.4+ | Patch (urgente — inclui fix do postcss) |
| `react` / `react-dom` | 19.2.4 | 19.2.5 | Patch |
| `@supabase/supabase-js` | 2.103.0 | 2.105.1 | Minor (2 versões atrás) |
| `openai` | 6.34.0 | 6.35.0 | Minor |
| `lucide-react` | 1.8.0 | 1.14.0 | Minor (6 versões atrás — ícones) |
| `shadcn` | 4.2.0 | 4.6.0 | Minor |
| `tailwindcss` | 4.2.2 | 4.2.4 | Patch |
| `typescript` | 5.x | 6.x | Major (pode esperar) |
| `eslint` | 9.x | 10.x | Major (pode esperar) |

### Pacotes de autenticação
- `@supabase/ssr` v0.10.2 → ✅ está na versão mais recente

---

## C) DEPENDABOT

**Status: ❌ NÃO CONFIGURADO**

O Dependabot é um robô do GitHub que verifica automaticamente se há vulnerabilidades nas suas dependências e abre Pull Requests de correção. Sem ele, as vulnerabilidades acumulam silenciosamente.

- Pasta `.github/` **não existe** no projeto
- Arquivo `.github/dependabot.yml` **não existe**
- Nenhum workflow de segurança (GitHub Actions) configurado

**Para habilitar:** Criar o arquivo `.github/dependabot.yml` com o conteúdo abaixo (não requer código — só configuração):

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

---

## D) BOAS PRÁTICAS (status)

| Prática | Status |
|---------|--------|
| `package-lock.json` commitado | ✅ Sim — builds reproduzíveis garantidos |
| Uso de versões `alpha`/`beta`/`rc` | ✅ Não há |
| Pacotes abandonados | ✅ Nenhum identificado |
| Dependabot | ❌ Não configurado |
| GitHub Actions de segurança | ❌ Não configurado |
| Sem validação de formulário (zod/yup) | ⚠️ Nenhuma biblioteca de validação de schema explícita |

---

## PLANO DE AÇÃO

| Prioridade | Ação |
|-----------|------|
| 🔴 IMEDIATO | `npm update next` — resolve postcss XSS |
| 🟠 URGENTE | `npm install file-type@22` — resolve DoS de loop |
| 🟠 URGENTE | `npm install shadcn@4.6.0` — resolve hono injection |
| 🟡 MÉDIO | Atualizar `@supabase/supabase-js` para 2.105.1 |
| 🟡 MÉDIO | Atualizar `react` e `react-dom` para 19.2.5 |
| 🟢 BAIXO | Criar `.github/dependabot.yml` |
| 🟢 BAIXO | Criar `.github/workflows/security.yml` com `npm audit` no CI |
| 🟢 BAIXO | Avaliar uso de `zod` para validação de inputs |
