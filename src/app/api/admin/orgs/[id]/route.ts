import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

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
