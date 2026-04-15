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

export async function POST(request: Request) {
  const auth = await getAuth()
  if (!auth) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

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
