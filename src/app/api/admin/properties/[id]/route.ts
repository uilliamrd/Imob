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
  const { error } = await auth.admin.from("properties").update({
    ...body,
    updated_at: new Date().toISOString(),
  }).eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
