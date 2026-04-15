import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

const ALLOWED_ROLES = ["admin", "imobiliaria", "corretor", "construtora"]

async function getAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const admin = createAdminClient()
  const { data: p } = await admin.from("profiles").select("role, organization_id").eq("id", user.id).single()
  if (!p || !ALLOWED_ROLES.includes(p.role)) return null
  return { admin, userId: user.id, profile: p }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuth()
  if (!auth) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { id } = await params

  if (auth.profile.role !== "admin") {
    const { data: prop } = await auth.admin.from("properties").select("org_id").eq("id", id).single()
    if (prop?.org_id !== auth.profile.organization_id) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }
  }

  const { error } = await auth.admin.from("properties").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuth()
  if (!auth) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { id } = await params

  // Non-admins can only edit their own org's properties
  if (auth.profile.role !== "admin") {
    const { data: prop } = await auth.admin.from("properties").select("org_id").eq("id", id).single()
    if (prop?.org_id !== auth.profile.organization_id) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }
  }

  const body = await request.json()

  // If slug is being changed, check it doesn't conflict with another property
  if (body.slug) {
    const { data: conflict } = await auth.admin
      .from("properties")
      .select("id, title")
      .eq("slug", body.slug)
      .neq("id", id)
      .maybeSingle()
    if (conflict) {
      return NextResponse.json(
        { error: `O slug já pertence a outro imóvel: "${conflict.title}".` },
        { status: 409 }
      )
    }
  }

  // If numero_apto + development_id are being set, check for duplicate unit
  if (body.development_id && body.features?.numero_apto) {
    const { data: dupUnit } = await auth.admin
      .from("properties")
      .select("id, title")
      .eq("development_id", body.development_id)
      .eq("features->>numero_apto", body.features.numero_apto)
      .neq("id", id)
      .maybeSingle()
    if (dupUnit) {
      return NextResponse.json(
        { error: `A unidade "${body.features.numero_apto}" já está cadastrada neste empreendimento (${dupUnit.title}).` },
        { status: 409 }
      )
    }
  }

  // Auto-publish when transferring to a construtora
  if (body.org_id) {
    const { data: targetOrg } = await auth.admin
      .from("organizations")
      .select("type")
      .eq("id", body.org_id)
      .single()
    if (targetOrg?.type === "construtora") {
      body.visibility = "publico"
    }
  }

  const { error } = await auth.admin.from("properties").update({
    ...body,
    updated_at: new Date().toISOString(),
  }).eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
