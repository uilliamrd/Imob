import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

async function getAuth(devId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const admin = createAdminClient()
  const { data: p } = await admin
    .from("profiles")
    .select("role, organization_id")
    .eq("id", user.id)
    .single()
  if (!p) return null
  if (p.role === "admin") return admin
  if (p.role === "construtora" && p.organization_id) {
    const { data: dev } = await admin
      .from("developments")
      .select("org_id")
      .eq("id", devId)
      .single()
    if (dev?.org_id === p.organization_id) return admin
  }
  return null
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await getAuth(id)
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 })

  const body = await request.json()
  const ALLOWED = ["name","address","neighborhood","city","is_lancamento","is_delivered",
                   "description","cover_image","images","custom_page_html","custom_page_type","documents"]
  const payload: Record<string, unknown> = {}
  for (const key of ALLOWED) { if (key in body) payload[key] = body[key] }
  const { error } = await admin.from("developments").update(payload).eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const admin = await getAuth(id)
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 })

  const { error } = await admin.from("developments").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
