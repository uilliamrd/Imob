import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getPlanLimits, resolveEntityType } from "@/lib/plans"
import type { OrgPlan, OrgType } from "@/types/database"

const ALLOWED_ROLES = ["admin", "imobiliaria", "construtora"]

async function getAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const admin = createAdminClient()
  const { data: p } = await admin
    .from("profiles")
    .select("role, plan, organization_id, organization:organizations(id, type, plan)")
    .eq("id", user.id)
    .single()
  if (!p || !ALLOWED_ROLES.includes(p.role)) return null
  return { admin, userId: user.id, profile: p }
}

export async function POST(request: Request) {
  const auth = await getAuth()
  if (!auth) return NextResponse.json({ error: "Acesso negado" }, { status: 403 })

  // Verificar limite de lançamentos do plano (admins são isentos)
  if (auth.profile.role !== "admin") {
    const org = auth.profile.organization as unknown as { id: string; type: OrgType; plan: OrgPlan } | null
    const entityType = resolveEntityType(auth.profile.role, org?.type ?? null)
    const plan = (org?.plan ?? "free") as OrgPlan
    const limits = getPlanLimits(entityType, plan)

    if (limits.max_developments !== null && limits.max_developments > 0) {
      const orgId = auth.profile.organization_id
      if (orgId) {
        const { count } = await auth.admin
          .from("developments")
          .select("id", { count: "exact", head: true })
          .eq("org_id", orgId)
        if ((count ?? 0) >= limits.max_developments) {
          return NextResponse.json(
            { error: `Limite do plano atingido: máximo de ${limits.max_developments} lançamentos. Faça upgrade para continuar.` },
            { status: 403 }
          )
        }
      }
    } else if (limits.max_developments === 0) {
      return NextResponse.json(
        { error: "Seu plano não inclui lançamentos. Faça upgrade para continuar." },
        { status: 403 }
      )
    }
  }

  const body = await request.json()
  const { data, error } = await auth.admin.from("developments").insert(body).select("*").single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
