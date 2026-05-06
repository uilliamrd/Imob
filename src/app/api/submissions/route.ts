import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

// ── Camada 1: Rate limit por IP (Map em memória) ────────────────────────────
const RATE_LIMIT  = 5
const RATE_WINDOW = 10 * 60 * 1000 // 10 minutos em ms

const ipStore = new Map<string, { count: number; resetAt: number }>()

function checkRate(ip: string): boolean {
  const now = Date.now()
  const rec = ipStore.get(ip)
  if (!rec || now > rec.resetAt) {
    ipStore.set(ip, { count: 1, resetAt: now + RATE_WINDOW })
    return true
  }
  if (rec.count >= RATE_LIMIT) return false
  rec.count++
  return true
}

// ── Camada 3: Validação de origem ───────────────────────────────────────────
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? ""

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false
  if (origin.startsWith("http://localhost")) return true
  if (SITE_URL && origin.startsWith(SITE_URL)) return true
  // Aceita previews do Vercel do mesmo projeto
  if (origin.includes("realstate") && origin.endsWith(".vercel.app")) return true
  return false
}

// ── Validação de payload (sem dependências externas) ────────────────────────
function validatePayload(body: Record<string, unknown>): string | null {
  const name  = String(body.owner_name  ?? "").trim()
  const phone = String(body.owner_phone ?? "").trim()
  const email = String(body.owner_email ?? "").trim()
  const msg   = String(body.description ?? "").trim()

  if (name.length < 2 || name.length > 100)
    return "Nome deve ter entre 2 e 100 caracteres."
  if (phone.replace(/\D/g, "").length < 10 || phone.length > 15)
    return "Telefone inválido (mínimo 10 dígitos)."
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return "E-mail inválido."
  if (msg.length > 2000)
    return "Mensagem muito longa (máximo 2000 caracteres)."
  return null
}

export async function POST(req: NextRequest) {
  // ── Camada 3: Origem ────────────────────────────────────────────────────
  const origin = req.headers.get("origin")
  if (!isOriginAllowed(origin)) {
    console.warn(`[submissions] Origem bloqueada: ${origin}`)
    return NextResponse.json({ error: "Origem não autorizada." }, { status: 403 })
  }

  // ── Camada 1: Rate limit ────────────────────────────────────────────────
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"

  if (!checkRate(ip)) {
    console.warn(`[submissions] Rate limit atingido — IP: ${ip}`)
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente em alguns minutos." },
      { status: 429 },
    )
  }

  try {
    const body = await req.json() as Record<string, unknown>

    // ── Camada 2: Honeypot ──────────────────────────────────────────────
    if (body.website) {
      console.warn(`[submissions] Honeypot ativado — IP: ${ip}`)
      return NextResponse.json({ id: "ok", status: "pending" }) // 200 silencioso
    }

    // ── Validação de payload ────────────────────────────────────────────
    const validationError = validatePayload(body)
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const admin = createAdminClient()

    const {
      owner_name, owner_phone, owner_email,
      address, neighborhood, city, cep,
      tipo, tipo_negocio, price, area_m2, quartos, vagas, description,
      plan,
    } = body

    // Verifica duplicata por endereço
    let matched_property_id: string | null = null
    let status = "pending"

    if (address && String(address).trim()) {
      const { data: existing } = await admin
        .from("properties")
        .select("id, title")
        .ilike("address", `%${String(address).trim()}%`)
        .limit(1)
        .maybeSingle()

      if (existing) {
        matched_property_id = existing.id
        status = "duplicate"
      }
    }

    const { data, error } = await admin
      .from("property_submissions")
      .insert({
        owner_name:   String(owner_name).trim(),
        owner_phone:  String(owner_phone).trim(),
        owner_email:  owner_email ? String(owner_email).trim() || null : null,
        address:      address     ? String(address).trim()     || null : null,
        neighborhood: neighborhood ? String(neighborhood).trim() || null : null,
        city:         city        ? String(city).trim()        || null : null,
        cep:          cep         ? String(cep).trim()         || null : null,
        tipo:         tipo        ? String(tipo)               || null : null,
        tipo_negocio: tipo_negocio ? String(tipo_negocio)      : "venda",
        price:        price  ? Number(price)  : null,
        area_m2:      area_m2 ? Number(area_m2) : null,
        quartos:      quartos ? Number(quartos) : null,
        vagas:        vagas   ? Number(vagas)   : null,
        description:  description ? String(description).trim() || null : null,
        plan:         plan ? String(plan) : "free",
        status,
        matched_property_id,
      })
      .select("id, status")
      .single()

    if (error) throw error

    return NextResponse.json({ id: data.id, status: data.status })
  } catch (e) {
    console.error("[submissions] Erro interno:", e)
    return NextResponse.json({ error: "Erro ao registrar. Tente novamente." }, { status: 500 })
  }
}
