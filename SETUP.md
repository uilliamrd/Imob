# Guia de Configuração — RealState Intelligence

Este guia explica **passo a passo** como colocar a plataforma no ar.
Cada passo tem apenas **uma coisa para fazer**.

---

## PARTE 1 — Criar o Projeto no Supabase

### Passo 1 — Criar uma conta no Supabase

1. Abra o navegador e acesse: **https://supabase.com**
2. Clique em **"Start your project"**
3. Faça login com sua conta do GitHub (ou crie uma conta nova)

---

### Passo 2 — Criar um novo projeto

1. Após fazer login, clique no botão **"New Project"**
2. Escolha uma organização (ou crie uma)
3. Preencha os campos:
   - **Name:** `realstate-intelligence`
   - **Database Password:** crie uma senha forte e **anote ela** (você vai precisar depois)
   - **Region:** escolha `South America (São Paulo)` para menor latência
4. Clique em **"Create new project"**
5. Aguarde cerca de 1-2 minutos até aparecer o dashboard do projeto

---

### Passo 3 — Pegar as chaves de acesso (API Keys)

1. No menu lateral esquerdo, clique em **"Project Settings"** (ícone de engrenagem)
2. Clique em **"API"**
3. Você verá 3 valores importantes — copie cada um:

   | Campo | Onde está | Para que serve |
   |-------|-----------|----------------|
   | **Project URL** | "Project URL" | Endereço do banco |
   | **anon public** | seção "Project API keys" | Chave pública |
   | **service_role** | seção "Project API keys" (clique em "Reveal") | Chave administrativa |

4. Guarde esses 3 valores — você vai usá-los no próximo passo

---

### Passo 4 — Configurar o arquivo .env.local

1. Abra o **Explorador de Arquivos** do Windows
2. Navegue até a pasta: `C:\Users\uilli\Downloads\realstate-intelligence`
3. Você vai ver um arquivo chamado `.env.local` — abra-o com o **Bloco de Notas**
4. O arquivo tem este conteúdo:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
API_INGEST_TOKEN=your_secret_token_for_n8n
```

5. Substitua cada valor pelo que você copiou no Passo 3:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
API_INGEST_TOKEN=meu-token-secreto-para-n8n
```

   > Para o `API_INGEST_TOKEN`, invente qualquer senha difícil.
   > Exemplo: `n8n-token-2024-xK9mPq`
   > Este token será usado no n8n para enviar dados.

6. Salve o arquivo (Ctrl+S)

---

## PARTE 2 — Criar as Tabelas no Banco de Dados

### Passo 5 — Abrir o SQL Editor do Supabase

1. No painel do Supabase, no menu esquerdo, clique em **"SQL Editor"**
2. Clique no botão **"New query"** (canto superior esquerdo)

---

### Passo 6 — Executar o Schema

1. Abra o arquivo `C:\Users\uilli\Downloads\realstate-intelligence\supabase\schema.sql`
   com o Bloco de Notas
2. Selecione todo o conteúdo (Ctrl+A) e copie (Ctrl+C)
3. Volte ao Supabase, cole no editor SQL (Ctrl+V)
4. Clique no botão verde **"Run"** (ou pressione Ctrl+Enter)
5. Você deve ver a mensagem `Success. No rows returned`
6. As tabelas `profiles`, `organizations` e `properties` foram criadas ✓

---

## PARTE 3 — Criar os Buckets de Armazenamento

### Passo 7 — Criar os buckets para imagens

1. No menu esquerdo do Supabase, clique em **"Storage"**
2. Clique em **"New bucket"**
3. Crie **3 buckets**, um de cada vez:

   **Bucket 1:**
   - Name: `property-images`
   - Marque: ✅ Public bucket
   - Clique "Save"

   **Bucket 2:**
   - Name: `org-logos`
   - Marque: ✅ Public bucket
   - Clique "Save"

   **Bucket 3:**
   - Name: `avatar-photos`
   - Marque: ✅ Public bucket
   - Clique "Save"

---

## PARTE 4 — Configurar Autenticação

### Passo 8 — Configurar o domínio de redirecionamento

1. No menu esquerdo, clique em **"Authentication"**
2. Clique em **"URL Configuration"**
3. Em **"Site URL"**, coloque:
   - Para desenvolvimento: `http://localhost:3000`
   - Para produção: seu domínio (ex: `https://seusite.com.br`)
4. Em **"Redirect URLs"**, adicione:
   - `http://localhost:3000/auth/callback`
5. Clique **"Save"**

---

## PARTE 5 — Criar o Primeiro Usuário Admin

### Passo 9 — Criar sua conta

1. Abra o terminal na pasta do projeto:
   - Abra o **Prompt de Comando** (Win+R, digite `cmd`, Enter)
   - Digite: `cd C:\Users\uilli\Downloads\realstate-intelligence`
   - Digite: `npm run dev`
2. Abra o navegador em: **http://localhost:3000/register**
3. Cadastre-se com seu email e senha
4. Na tela de perfil, escolha qualquer role por enquanto

---

### Passo 10 — Tornar-se Admin

1. No painel do Supabase, clique em **"Table Editor"**
2. Clique na tabela **"profiles"**
3. Você vai ver sua linha com o seu ID
4. Clique na linha e edite o campo **"role"**:
   - Troque para: `admin`
5. Clique em **"Save"**
6. Faça logout e login novamente no sistema
7. Agora você terá acesso total ao painel de **Administração**

---

## PARTE 6 — Configurar o n8n (Integração de Dados)

### Passo 11 — Configurar o webhook no n8n

1. No seu workflow do n8n, adicione um nó **HTTP Request**
2. Configure:
   - **Method:** `POST`
   - **URL:** `http://localhost:3000/api/properties/ingest`
     (em produção: `https://seusite.com.br/api/properties/ingest`)
   - **Authentication:** `Header Auth`
   - **Header Name:** `Authorization`
   - **Header Value:** `Bearer meu-token-secreto-para-n8n`
     (o mesmo que você colocou em `API_INGEST_TOKEN`)
3. O **body** deve ser um JSON com os dados do imóvel. Exemplo:

```json
[
  {
    "slug": "torre-a-apt-1201",
    "title": "Torre A — Apt 1201",
    "price": 2850000,
    "status": "disponivel",
    "features": {
      "suites": 4,
      "vagas": 3,
      "area_m2": 198,
      "andar": 12
    },
    "tags": ["VM", "MD"],
    "neighborhood": "Leblon",
    "city": "Rio de Janeiro",
    "org_id": "uuid-da-sua-organizacao"
  }
]
```

**Tags disponíveis:**
| Sigla | Significado |
|-------|-------------|
| VM | Vista Mar |
| MD | Mobiliado |
| VV | Vista Verde |
| CB | Cobertura |
| PT | Penthouse |
| DX | Duplex |
| AL | Alto Luxo |
| SM | Smart Home |
| GR | Gourmet |
| FT | Fitness |
| SG | Segurança 24h |
| SC | Sol da Manhã |
| VG | Vagas Garantidas |
| PN | Planta Nobre |

---

## Resumo Final

Após completar todos os passos, o sistema estará funcionando com:

| URL | O que é |
|-----|---------|
| `http://localhost:3000` | Homepage |
| `http://localhost:3000/login` | Login |
| `http://localhost:3000/register` | Cadastro |
| `http://localhost:3000/dashboard` | Painel de controle |
| `http://localhost:3000/construtora/nome-da-empresa` | Landing page pública |
| `http://localhost:3000/imovel/slug-do-imovel` | Página do imóvel |
| `http://localhost:3000/imovel/slug?ref=id-do-corretor` | Imóvel com minisite do corretor |

---

## Precisa de ajuda?

Se algum passo não funcionar, descreva exatamente:
1. Em qual passo você está
2. O que apareceu na tela (mensagem de erro)

E eu resolvo passo a passo.
