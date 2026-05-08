import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

async function canManage(devId: string): Promise<ReturnType<typeof createAdminClient> | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const admin = createAdminClient()
  const { data: p } = await admin.from("profiles").select("role, organization_id").eq("id", user.id).single()
  if (!p) return null
  if (p.role === "admin") return admin
  if (p.role === "construtora" && p.organization_id) {
    const { data: dev } = await admin.from("developments").select("org_id").eq("id", devId).single()
    if (dev?.org_id === p.organization_id) return admin
  }
  return null
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string; updateId: string }> }) {
  const { id, updateId } = await params
  const admin = await canManage(id)
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 })

  const { error } = await admin.from("development_updates").delete().eq("id", updateId).eq("development_id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
