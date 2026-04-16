import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Simple in-memory rate limiter: max 5 lead submissions per IP per minute
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

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }
  let body: {
    name: string
    phone: string
    property_id?: string
    property_slug?: string
    ref_id?: string
    org_id?: string
    source?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, phone, property_id, property_slug, ref_id, org_id, source } = body

  if (!name?.trim() || !phone?.trim()) {
    return NextResponse.json({ error: 'name and phone are required' }, { status: 400 })
  }

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
    })
    .select("id")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
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
