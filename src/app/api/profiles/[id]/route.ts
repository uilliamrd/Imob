import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const { id } = await params

  // Users can only update their own profile
  if (user.id !== id) return NextResponse.json({ error: "Acesso negado" }, { status: 403 })

  const body = await request.json()
  const admin = createAdminClient()

  // Whitelist updatable fields
  const { full_name, whatsapp, creci, bio, avatar_url } = body
  const { error } = await admin
    .from("profiles")
    .update({ full_name, whatsapp, creci, bio, avatar_url })
    .eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
