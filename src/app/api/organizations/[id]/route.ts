import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

async function getCallerOrgAccess(orgId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()
  const { data: profile } = await admin.from("profiles").select("role, organization_id").eq("id", user.id).single()
  if (!profile) return null

  // Admin can update any org
  if (profile.role === "admin") return admin

  // Org owner (imobiliaria/construtora) can update their own org
  if (profile.organization_id === orgId) return admin

  return null
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const adminClient = await getCallerOrgAccess(id)
  if (!adminClient) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const body = await request.json()

  const allowed = [
    "name", "type", "slug", "portfolio_desc", "about_text", "hero_tagline",
    "hero_image", "about_image", "website", "logo", "brand_colors", "has_lancamentos",
  ]
  const patch: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) patch[key] = body[key]
  }

  const { error } = await adminClient.from("organizations").update(patch).eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const admin = createAdminClient()
  const body = await request.json()

  const allowed = [
    "name", "type", "slug", "portfolio_desc", "about_text", "hero_tagline",
    "hero_image", "about_image", "website", "logo", "brand_colors", "has_lancamentos",
  ]
  const payload: Record<string, unknown> = {}
  for (const key of allowed) {
    if (key in body) payload[key] = body[key]
  }

  const { data: newOrg, error } = await admin.from("organizations").insert(payload).select("id").single()
  if (error || !newOrg) return NextResponse.json({ error: error?.message ?? "Erro ao criar." }, { status: 400 })

  // Link user to the new org
  await admin.from("profiles").update({ organization_id: newOrg.id }).eq("id", user.id)

  return NextResponse.json({ id: newOrg.id })
}
