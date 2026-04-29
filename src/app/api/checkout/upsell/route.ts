import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getOrCreateAsaasCustomer, createPayment } from "@/lib/asaas"
import { HIGHLIGHT_UPSELLS, BOOST_OPTIONS } from "@/lib/plans"

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Body inválido" }, { status: 400 })

  const { type, property_id, option_id } = body as Record<string, unknown>

  if (type !== "highlight" && type !== "boost")
    return NextResponse.json({ error: "type deve ser 'highlight' ou 'boost'" }, { status: 400 })
  if (typeof property_id !== "string" || !UUID_RE.test(property_id))
    return NextResponse.json({ error: "property_id inválido" }, { status: 400 })
  if (typeof option_id !== "string")
    return NextResponse.json({ error: "option_id inválido" }, { status: 400 })

  const admin = createAdminClient()

  const { data: profile } = await admin
    .from("profiles")
    .select("role, organization_id, full_name")
    .eq("id", user.id)
    .single()
  if (!profile) return NextResponse.json({ error: "Perfil não encontrado" }, { status: 403 })

  const { data: property } = await admin
    .from("properties")
    .select("id, org_id, created_by, title")
    .eq("id", property_id)
    .single()
  if (!property) return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 })

  const isAdmin = profile.role === "admin"
  const isOwner = property.created_by === user.id
  const isOrg   = profile.organization_id && property.org_id === profile.organization_id
  if (!isAdmin && !isOwner && !isOrg)
    return NextResponse.json({ error: "Sem permissão para este imóvel" }, { status: 403 })

  let value: number
  let description: string
  let recordId: string

  if (type === "highlight") {
    const option = HIGHLIGHT_UPSELLS[option_id as keyof typeof HIGHLIGHT_UPSELLS]
    if (!option) return NextResponse.json({ error: "Opção de destaque inválida" }, { status: 400 })
    value = option.preco
    description = `${option.nome} — ${property.title}`
    const { data, error } = await admin.from("property_highlights").insert({
      property_id,
      user_id:    user.id,
      org_id:     profile.organization_id ?? null,
      highlight:  option.id,
      prioridade: option.prioridade,
      status:     "pendente",
      paid_amount: option.preco,
    }).select("id").single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    recordId = data.id
  } else {
    const option = BOOST_OPTIONS[option_id as keyof typeof BOOST_OPTIONS]
    if (!option) return NextResponse.json({ error: "Opção de boost inválida" }, { status: 400 })
    value = option.preco
    description = `${option.nome} — ${property.title}`
    const { data, error } = await admin.from("property_boosts").insert({
      property_id,
      user_id:      user.id,
      org_id:       profile.organization_id ?? null,
      boost:        option.id,
      duracao_dias: option.duracao_dias,
      status:       "pendente",
      paid_amount:  option.preco,
    }).select("id").single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    recordId = data.id
  }

  const customerId = await getOrCreateAsaasCustomer(
    profile.organization_id ?? user.id,
    profile.full_name ?? "Cliente",
    user.email!,
  )

  const externalRef = `${type}:${recordId}`
  const { paymentId, invoiceUrl } = await createPayment(customerId, value, description, externalRef)

  const table = type === "highlight" ? "property_highlights" : "property_boosts"
  await admin.from(table).update({ asaas_payment_id: paymentId }).eq("id", recordId)

  return NextResponse.json({ url: invoiceUrl })
}
