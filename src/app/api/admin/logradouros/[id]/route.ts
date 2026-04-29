import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

async function getAdminClient() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const admin = createAdminClient()
  const { data: p } = await admin.from("profiles").select("role").eq("id", user.id).single()
  return p?.role === "admin" ? admin : null
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminClient()
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 })

  const { id } = await params
  const body = await request.json()
  const payload: Record<string, string | null> = {}
  if (body.type      !== undefined) payload.type      = String(body.type).trim()
  if (body.name      !== undefined) payload.name      = String(body.name).trim()
  if (body.bairro_id !== undefined) payload.bairro_id = body.bairro_id ? String(body.bairro_id) : null
  if (body.city      !== undefined) payload.city      = String(body.city).trim()
  if (body.cep       !== undefined) payload.cep       = body.cep ? String(body.cep).replace(/\D/g, "").slice(0, 8) : null

  const { error } = await admin.from("logradouros").update(payload).eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminClient()
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 })

  const { id } = await params
  const { error } = await admin.from("logradouros").delete().eq("id", id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
