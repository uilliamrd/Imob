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

export async function POST(request: Request) {
  const admin = await getAdminClient()
  if (!admin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 })

  const body = await request.json()
  const payload = {
    type:      String(body.type      ?? "Rua").trim(),
    name:      String(body.name      ?? "").trim(),
    bairro_id: body.bairro_id ? String(body.bairro_id) : null,
    city:      String(body.city      ?? "").trim(),
    cep:       body.cep ? String(body.cep).replace(/\D/g, "").slice(0, 8) : null,
  }
  if (!payload.name) return NextResponse.json({ error: "name é obrigatório" }, { status: 400 })

  const { data, error } = await admin.from("logradouros").insert(payload).select("*").single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
