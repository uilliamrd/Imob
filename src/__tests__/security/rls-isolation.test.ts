/**
 * Testes de isolamento multi-tenant (RLS)
 *
 * Estes testes verificam que as políticas de Row Level Security
 * estão funcionando corretamente contra o banco de dados real.
 *
 * COMO RODAR:
 *   npm run test:security
 *
 * VARIÁVEIS NECESSÁRIAS (no .env.local ou ambiente de CI):
 *   NEXT_PUBLIC_SUPABASE_URL       — URL do projeto Supabase
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY  — chave pública (anon)
 *   TEST_USER_A_EMAIL              — e-mail do usuário de teste da ORG A
 *   TEST_USER_A_PASSWORD           — senha do usuário de teste da ORG A
 *   TEST_USER_B_EMAIL              — e-mail do usuário de teste da ORG B
 *   TEST_USER_B_PASSWORD           — senha do usuário de teste da ORG B
 *   NEXT_PUBLIC_SITE_URL           — URL base para testes de HTTP (ex: http://localhost:3000)
 *
 * SETUP MANUAL NO SUPABASE:
 *   Antes de rodar, crie dois usuários de teste com perfis em organizações distintas.
 *   Nunca use dados reais de produção nesses usuários.
 */

import { createClient } from "@supabase/supabase-js"
import { describe, it, expect, beforeAll } from "vitest"
import * as dotenv from "dotenv"
import * as fs from "fs"
import * as path from "path"

// Carrega .env.local se existir
const envPath = path.resolve(process.cwd(), ".env.local")
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const ANON_KEY     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
const SITE_URL     = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

/** Cria cliente Supabase com a anon key — simula usuário do browser */
function anonClient() {
  return createClient(SUPABASE_URL, ANON_KEY)
}

/** Cria cliente e autentica com email/senha. Retorna null se credenciais ausentes. */
async function authenticatedClient(email: string | undefined, password: string | undefined) {
  if (!email || !password) return null
  const client = createClient(SUPABASE_URL, ANON_KEY)
  const { error } = await client.auth.signInWithPassword({ email, password })
  if (error) throw new Error(`Falha no login de ${email}: ${error.message}`)
  return client
}

/** Pula o teste se credenciais de integração não estiverem configuradas */
function skipIfNoCredentials(email?: string, password?: string): boolean {
  return !SUPABASE_URL || !ANON_KEY || !email || !password
}

// ─── Cenário 1: Acesso anônimo deve ser bloqueado ───────────────────────────

describe("Cenário 1 — Acesso anônimo", () => {
  it("usuário anônimo não deve ver nenhum profile", async () => {
    if (!SUPABASE_URL || !ANON_KEY) {
      console.warn("SKIP: NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY ausente")
      return
    }

    const client = anonClient()
    const { data, error } = await client.from("profiles").select("id, role")

    // RLS deve bloquear completamente: retorna array vazio, não erro
    expect(error).toBeNull()
    expect(data).toEqual([])
  })

  it("usuário anônimo não deve ver nenhum lead", async () => {
    if (!SUPABASE_URL || !ANON_KEY) {
      console.warn("SKIP: variáveis Supabase ausentes")
      return
    }

    const client = anonClient()
    const { data, error } = await client.from("leads").select("id, org_id, phone")

    // A tabela leads permite INSERT público mas SELECT deve exigir auth
    expect(error).toBeNull()
    expect(data).toEqual([])
  })

  it("usuário anônimo não deve ver nenhuma propriedade privada ou de equipe", async () => {
    if (!SUPABASE_URL || !ANON_KEY) {
      console.warn("SKIP: variáveis Supabase ausentes")
      return
    }

    const client = anonClient()
    const { data } = await client
      .from("properties")
      .select("id, visibility")
      .in("visibility", ["privado", "equipe", "corretores"])

    // Imóveis não-públicos nunca devem aparecer para anônimos
    expect(data).toEqual([])
  })
})

// ─── Cenário 2: Isolamento entre tenants ───────────────────────────────────

describe("Cenário 2 — Isolamento multi-tenant", () => {
  let clientA: ReturnType<typeof createClient> | null = null
  let orgA: string | null = null

  const emailA    = process.env.TEST_USER_A_EMAIL
  const passwordA = process.env.TEST_USER_A_PASSWORD
  const emailB    = process.env.TEST_USER_B_EMAIL
  const passwordB = process.env.TEST_USER_B_PASSWORD

  beforeAll(async () => {
    if (skipIfNoCredentials(emailA, passwordA)) return
    clientA = await authenticatedClient(emailA, passwordA)

    // Descobre qual org o usuário A pertence
    if (clientA) {
      const { data: { user } } = await clientA.auth.getUser()
      if (user) {
        const { data: profile } = await clientA
          .from("profiles")
          .select("organization_id")
          .eq("id", user.id)
          .single()
        orgA = profile?.organization_id ?? null
      }
    }
  })

  it("USER_A não deve ver leads da ORG_B", async () => {
    if (skipIfNoCredentials(emailA, passwordA) || skipIfNoCredentials(emailB, passwordB)) {
      console.warn("SKIP: TEST_USER_A_* ou TEST_USER_B_* ausentes")
      return
    }
    if (!clientA || !orgA) {
      console.warn("SKIP: não foi possível autenticar USER_A ou descobrir sua org")
      return
    }

    // Autentica o usuário B para descobrir qual é a org dele
    const clientB = await authenticatedClient(emailB, passwordB)
    if (!clientB) return

    const { data: { user: userB } } = await clientB.auth.getUser()
    const { data: profileB } = await clientB
      .from("profiles")
      .select("organization_id")
      .eq("id", userB!.id)
      .single()

    const orgB = profileB?.organization_id
    if (!orgB) {
      console.warn("SKIP: USER_B não tem organization_id configurado")
      return
    }

    // USER_A tenta ler todos os leads
    const { data: leads, error } = await clientA!
      .from("leads")
      .select("id, org_id")

    expect(error).toBeNull()

    // Nenhum lead pode ter org_id da ORG_B — isso seria vazamento cross-tenant
    const leaksFromOrgB = (leads ?? []).filter((l) => l.org_id === orgB)
    expect(leaksFromOrgB).toEqual([])
  })

  it("USER_A não deve ver propriedades da ORG_B", async () => {
    if (skipIfNoCredentials(emailA, passwordA) || skipIfNoCredentials(emailB, passwordB)) {
      console.warn("SKIP: credenciais de teste ausentes")
      return
    }
    if (!clientA || !orgA) return

    const clientB = await authenticatedClient(emailB, passwordB)
    if (!clientB) return

    const { data: { user: userB } } = await clientB.auth.getUser()
    const { data: profileB } = await clientB
      .from("profiles")
      .select("organization_id")
      .eq("id", userB!.id)
      .single()

    const orgB = profileB?.organization_id
    if (!orgB) return

    const { data: properties } = await clientA!
      .from("properties")
      .select("id, org_id")

    const leaksFromOrgB = (properties ?? []).filter((p) => p.org_id === orgB)
    expect(leaksFromOrgB).toEqual([])
  })
})

// ─── Cenário 3: Escalonamento de privilégio ─────────────────────────────────

describe("Cenário 3 — Escalonamento de privilégio", () => {
  const emailA    = process.env.TEST_USER_A_EMAIL
  const passwordA = process.env.TEST_USER_A_PASSWORD

  it("usuário comum não deve conseguir se promover a admin", async () => {
    if (skipIfNoCredentials(emailA, passwordA)) {
      console.warn("SKIP: TEST_USER_A_* ausentes")
      return
    }

    const client = await authenticatedClient(emailA, passwordA)
    if (!client) return

    const { data: { user } } = await client.auth.getUser()
    if (!user) return

    // Lê o role atual antes da tentativa de ataque
    const { data: before } = await client
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    // Tentativa de auto-promoção — deve ser bloqueada pelo trigger prevent_role_escalation
    const { error } = await client
      .from("profiles")
      .update({ role: "admin" })
      .eq("id", user.id)

    // Lê o role após a tentativa
    const { data: after } = await client
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    // Critério de sucesso: ou retornou erro, ou o role não mudou
    const wasBlocked = error !== null || after?.role !== "admin"
    expect(wasBlocked).toBe(true)

    // Garante que o role está igual ao que estava antes
    expect(after?.role).toBe(before?.role)
  })
})

// ─── Cenário 4: Rate limiting (@integration) ────────────────────────────────

describe("Cenário 4 — Rate limiting @integration", () => {
  it("deve bloquear com HTTP 429 após 10 requisições no endpoint de ingestão", async () => {
    // Verifica se o servidor está acessível antes de rodar o teste
    const isUp = await fetch(`${SITE_URL}/api/properties/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }).then(() => true).catch(() => false)

    if (!isUp) {
      console.warn("SKIP: servidor não acessível em", SITE_URL, "— rode com servidor local (npm run dev)")
      return
    }

    const responses: number[] = []

    // Dispara 11 requisições seguidas com token inválido
    // (o rate limiting verifica ANTES da validação do token)
    for (let i = 0; i < 11; i++) {
      const res = await fetch(`${SITE_URL}/api/properties/ingest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer token-invalido-para-teste",
          // Simula o mesmo IP para garantir que o rate limiter agrupa as requisições
          "X-Forwarded-For": "10.0.0.1",
        },
        body: JSON.stringify({}),
      })
      responses.push(res.status)
    }

    const blockedCount = responses.filter((s) => s === 429).length
    const lastStatus = responses[responses.length - 1]

    // A 11ª requisição deve ser bloqueada
    expect(lastStatus).toBe(429)
    // Pelo menos 1 requisição foi bloqueada
    expect(blockedCount).toBeGreaterThanOrEqual(1)
    // As primeiras não devem ser todas 429 (o limite ainda não foi atingido)
    expect(responses[0]).not.toBe(429)
  }, 30_000) // timeout generoso para 11 requests HTTP
})
