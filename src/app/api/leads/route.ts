import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// In-memory rate limiter: max 5 submissions per IP per minute.
// NOTE: In multi-instance deployments (Vercel Functions) replace with
// a distributed store (Upstash Redis) — each instance has its own Map.
const rateMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return false
  }
  if (entry.count >= 5) return true
  entry.count++
  return false
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const PHONE_RE = /^[\d\s\-()+]{7,20}$/

function validateLeadInput(body: unknown): { ok: true; data: ReturnType<typeof extractFields> } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid body" }
  const b = body as Record<string, unknown>

  const name  = typeof b.name  === "string" ? b.name.trim()  : ""
  const phone = typeof b.phone === "string" ? b.phone.trim() : ""

  if (name.length < 2 || name.length > 200)
    return { ok: false, error: "name deve ter entre 2 e 200 caracteres" }
  if (!PHONE_RE.test(phone))
    return { ok: false, error: "phone inválido" }
  if (b.property_id && (typeof b.property_id !== "string" || !UUID_RE.test(b.property_id)))
    return { ok: false, error: "property_id inválido" }
  if (b.ref_id && (typeof b.ref_id !== "string" || !UUID_RE.test(b.ref_id)))
    return { ok: false, error: "ref_id inválido" }
  if (b.org_id && (typeof b.org_id !== "string" || !UUID_RE.test(b.org_id)))
    return { ok: false, error: "org_id inválido" }

  return { ok: true, data: extractFields(b, name, phone) }
}

function extractFields(b: Record<string, unknown>, name: string, phone: string) {
  return {
    name,
    phone,
    property_id:     typeof b.property_id    === "string" ? b.property_id    : null,
    property_slug:   typeof b.property_slug  === "string" ? b.property_slug  : null,
    ref_id:          typeof b.ref_id         === "string" ? b.ref_id         : null,
    org_id:          typeof b.org_id         === "string" ? b.org_id         : null,
    source:          typeof b.source         === "string" ? b.source         : "imovel",
    cidade_cliente:  typeof b.cidade_cliente === "string" ? b.cidade_cliente : null,
    perfil_imovel:   typeof b.perfil_imovel  === "string" ? b.perfil_imovel  : null,
    preco_min:       typeof b.preco_min      === "number" ? b.preco_min      : null,
    preco_max:       typeof b.preco_max      === "number" ? b.preco_max      : null,
    tipo_negociacao: typeof b.tipo_negociacao === "string" ? b.tipo_negociacao : null,
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const validation = validateLeadInput(rawBody)
  if (!validation.ok) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  const { name, phone, property_id, property_slug, ref_id, org_id, source,
          cidade_cliente, perfil_imovel, preco_min, preco_max, tipo_negociacao } = validation.data

  const supabase = createAdminClient()

  const { data: newLead, error } = await supabase
    .from('leads')
    .insert({
      name: name.trim(),
      phone: phone.trim(),
      property_id: property_id ?? null,
      property_slug: property_slug ?? null,
      ref_id: ref_id ?? null,
      org_id: org_id ?? null,
      source: source ?? 'imovel',
      status: 'novo',
      cidade_cliente: cidade_cliente ?? null,
      perfil_imovel: perfil_imovel ?? null,
      preco_min: preco_min ?? null,
      preco_max: preco_max ?? null,
      tipo_negociacao: tipo_negociacao ?? null,
    })
    .select("id")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Rodízio: se não há ref_id, atribuir automaticamente ao corretor com maior score na org
  if (newLead && !ref_id) {
    let effectiveOrgId = org_id ?? null

    // Se não veio org_id, tentar buscar pelo property
    if (!effectiveOrgId && property_id) {
      const { data: prop } = await supabase
        .from('properties')
        .select('org_id')
        .eq('id', property_id)
        .maybeSingle()
      effectiveOrgId = prop?.org_id ?? null
    }

    if (effectiveOrgId) {
      const { data: topCorretor } = await supabase
        .from('corretor_scores')
        .select('id')
        .eq('organization_id', effectiveOrgId)
        .order('score', { ascending: false })
        .order('last_lead_at', { ascending: true, nullsFirst: true })
        .limit(1)
        .maybeSingle()

      if (topCorretor?.id) {
        await supabase
          .from('leads')
          .update({ ref_id: topCorretor.id })
          .eq('id', newLead.id)
        await supabase
          .from('profiles')
          .update({ last_lead_at: new Date().toISOString() })
          .eq('id', topCorretor.id)
      }
    }
  }

  // Detecção de conflito: mesmo telefone já foi captado por outro corretor
  if (newLead && ref_id) {
    const normalizedPhone = phone.trim()
    const { data: existing } = await supabase
      .from('leads')
      .select("id, ref_id")
      .eq("phone", normalizedPhone)
      .neq("ref_id", ref_id)
      .not("ref_id", "is", null)
      .neq("id", newLead.id)

    if (existing && existing.length > 0) {
      await supabase.from('lead_conflicts').insert(
        existing.map((e) => ({
          phone: normalizedPhone,
          original_lead_id: e.id,
          original_corretor_id: e.ref_id,
          conflict_lead_id: newLead.id,
        }))
      )
      // Ignora erros de inserção (ex: conflito duplicado pelo unique index)
    }
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
