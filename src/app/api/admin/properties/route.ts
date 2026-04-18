import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getPlanLimits, resolveEntityType } from "@/lib/plans"
import type { OrgPlan, OrgType } from "@/types/database"

const ALLOWED_ROLES = ["admin", "imobiliaria", "corretor", "construtora"]

async function getAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const admin = createAdminClient()
  const { data: p } = await admin
    .from("profiles")
    .select("role, plan, organization_id, organization:organizations(type, plan)")
    .eq("id", user.id)
    .single()
  if (!p || !ALLOWED_ROLES.includes(p.role)) return null
  return { admin, userId: user.id, profile: p }
}

export async function POST(request: Request) {
  const auth = await getAuth()
  if (!auth) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  // Verificar limite de imóveis do plano (admins são isentos)
  if (auth.profile.role !== "admin") {
    const org = auth.profile.organization as unknown as { type: OrgType; plan: OrgPlan } | null
    const entityType = resolveEntityType(auth.profile.role, org?.type ?? null)
    const plan = (org?.plan ?? auth.profile.plan ?? "free") as OrgPlan
    const limits = getPlanLimits(entityType, plan)

    if (limits.max_properties !== null) {
      const scopeId = auth.profile.organization_id ?? auth.userId
      const scopeField = auth.profile.organization_id ? "org_id" : "created_by"
      const { count } = await auth.admin
        .from("properties")
        .select("id", { count: "exact", head: true })
        .eq(scopeField, scopeId)
      if ((count ?? 0) >= limits.max_properties) {
        return NextResponse.json(
          { error: `Limite do plano atingido: máximo de ${limits.max_properties} imóveis. Faça upgrade para continuar.` },
          { status: 403 }
        )
      }
    }
  }

  const body = await request.json()

  // Check for duplicate slug before inserting
  if (body.slug) {
    const { data: existing } = await auth.admin
      .from("properties")
      .select("id, title")
      .eq("slug", body.slug)
      .maybeSingle()
    if (existing) {
      return NextResponse.json(
        { error: `Já existe um imóvel com este slug: "${existing.title}". Altere o título ou o slug.` },
        { status: 409 }
      )
    }
  }

  // Check for duplicate unit in same development
  const devId = body.development_id
  const numeroApto = body.features?.numero_apto
  if (devId && numeroApto) {
    const { data: dupUnit } = await auth.admin
      .from("properties")
      .select("id, title")
      .eq("development_id", devId)
      .eq("features->>numero_apto", numeroApto)
      .maybeSingle()
    if (dupUnit) {
      return NextResponse.json(
        { error: `A unidade "${numeroApto}" já está cadastrada neste empreendimento (${dupUnit.title}).` },
        { status: 409 }
      )
    }
  }

  const { data, error } = await auth.admin.from("properties").insert({
    ...body,
    created_by: auth.userId,
    org_id: body.org_id ?? auth.profile.organization_id ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).select("id, slug").single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
