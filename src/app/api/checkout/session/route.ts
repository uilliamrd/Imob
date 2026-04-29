import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getOrCreateAsaasCustomer, createSubscription } from "@/lib/asaas"
import { PLAN_PRICES, getPlanName } from "@/lib/plans"
import type { PlanEntityType } from "@/lib/plans"
import type { OrgPlan } from "@/types/database"

const VALID_PLANS: OrgPlan[] = ["starter", "pro", "enterprise"]

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Body inválido" }, { status: 400 })

  const { plan, entityType } = body as Record<string, unknown>

  if (typeof plan !== "string" || !VALID_PLANS.includes(plan as OrgPlan))
    return NextResponse.json({ error: "Plano inválido" }, { status: 400 })
  if (typeof entityType !== "string")
    return NextResponse.json({ error: "entityType inválido" }, { status: 400 })

  const prices = PLAN_PRICES[entityType as PlanEntityType]?.[plan as OrgPlan]
  if (!prices || prices.mensal === 0)
    return NextResponse.json({ error: "Plano gratuito não requer pagamento" }, { status: 422 })

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from("profiles")
    .select("organization_id, full_name")
    .eq("id", user.id)
    .single()

  if (!profile?.organization_id)
    return NextResponse.json({ error: "Organização não encontrada" }, { status: 404 })

  const { data: org } = await admin
    .from("organizations")
    .select("name")
    .eq("id", profile.organization_id)
    .single()

  const planName = getPlanName(entityType as PlanEntityType, plan as OrgPlan)
  const description = `RealState Intelligence — ${planName}`
  const externalRef = `plan:${plan}:org:${profile.organization_id}:entity:${entityType}`

  const customerId = await getOrCreateAsaasCustomer(
    profile.organization_id,
    org?.name ?? profile.full_name ?? "Cliente",
    user.email!,
  )

  const { subscriptionId, invoiceUrl } = await createSubscription(
    customerId,
    prices.mensal,
    description,
    externalRef,
  )

  // Registra o ID da assinatura provisoriamente (webhook confirma e ativa)
  await admin.from("organizations").update({
    asaas_subscription_id: subscriptionId,
  }).eq("id", profile.organization_id)

  return NextResponse.json({ url: invoiceUrl })
}
