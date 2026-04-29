import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getPlanLimits, resolveEntityType } from "@/lib/plans"
import type { OrgPlan, OrgType } from "@/types/database"

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const admin = createAdminClient()
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single()
  return profile?.role === "admin" ? admin : null
}

const CORRETOR_SELECT = "id, full_name, avatar_url, creci, whatsapp, slug, is_active, role, organization_id"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await assertAdmin()
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 })

  const { id } = await params

  const [{ data: members }, { data: available }, { count: imoveisCount }] = await Promise.all([
    admin
      .from("profiles")
      .select(CORRETOR_SELECT)
      .eq("organization_id", id)
      .order("full_name"),
    admin
      .from("profiles")
      .select(CORRETOR_SELECT)
      .in("role", ["corretor", "imobiliaria", "construtora"])
      .is("organization_id", null)
      .order("full_name"),
    admin
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("org_id", id),
  ])

  return NextResponse.json({
    corretores: members ?? [],
    available: available ?? [],
    imoveisCount: imoveisCount ?? 0,
  })
}

// Add corretor to org
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await assertAdmin()
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 })

  const { id } = await params
  const { corretor_id } = await req.json()
  if (!corretor_id) return NextResponse.json({ error: "corretor_id obrigatório" }, { status: 400 })

  // Verificar limite de corretores do plano da org
  const { data: org } = await admin
    .from("organizations")
    .select("type, plan")
    .eq("id", id)
    .single()

  if (org) {
    const entityType = resolveEntityType(org.type as OrgType, org.type as OrgType)
    const limits = getPlanLimits(entityType, (org.plan ?? "free") as OrgPlan)
    if (limits.max_corretores !== null) {
      const { count } = await admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("organization_id", id)
      if ((count ?? 0) >= limits.max_corretores) {
        return NextResponse.json(
          { error: `Limite do plano atingido: máximo de ${limits.max_corretores} corretores na equipe. Faça upgrade para continuar.` },
          { status: 403 }
        )
      }
    }
  }

  const { error } = await admin
    .from("profiles")
    .update({ organization_id: id })
    .eq("id", corretor_id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// Remove corretor from org
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await assertAdmin()
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 })

  const { id } = await params
  const { corretor_id } = await req.json()
  if (!corretor_id) return NextResponse.json({ error: "corretor_id obrigatório" }, { status: 400 })

  // Only remove if they actually belong to this org
  const { error } = await admin
    .from("profiles")
    .update({ organization_id: null })
    .eq("id", corretor_id)
    .eq("organization_id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
