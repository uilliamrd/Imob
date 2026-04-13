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
  const { data, error } = await admin.from("developments").insert(body).select("*").single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data, { status: 201 })
}
