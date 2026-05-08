import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

async function getOrgId(devId: string): Promise<{ admin: ReturnType<typeof createAdminClient>; orgId: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const admin = createAdminClient()
  const { data: p } = await admin.from("profiles").select("role, organization_id").eq("id", user.id).single()
  if (!p?.organization_id) return null
  if (p.role === "admin") {
    const { data: dev } = await admin.from("developments").select("org_id").eq("id", devId).single()
    return dev ? { admin, orgId: dev.org_id ?? p.organization_id } : null
  }
  if (p.role === "construtora") {
    const { data: dev } = await admin.from("developments").select("org_id").eq("id", devId).single()
    if (dev?.org_id !== p.organization_id) return null
    return { admin, orgId: p.organization_id }
  }
  return null
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ctx = await getOrgId(id)
  if (!ctx) return NextResponse.json({ error: "Acesso negado" }, { status: 403 })

  const body = await request.json()
  const { title, body: text, image_url } = body
  if (!title?.trim()) return NextResponse.json({ error: "Título obrigatório" }, { status: 400 })

  const { data, error } = await ctx.admin.from("development_updates").insert({
    development_id: id,
    org_id: ctx.orgId,
    title: title.trim(),
    body: text?.trim() || null,
    image_url: image_url || null,
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
