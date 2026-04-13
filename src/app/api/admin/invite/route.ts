import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { UserRole } from "@/types/database"

export async function POST(request: Request) {
  // Verify caller is admin
  const supabase = await createClient()
  const { data: { user: caller } } = await supabase.auth.getUser()
  if (!caller) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const adminClient = createAdminClient()
  const { data: callerProfile } = await adminClient
    .from("profiles").select("role").eq("id", caller.id).single()
  if (callerProfile?.role !== "admin") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
  }

  const body = await request.json()
  const { email, role, organization_id } = body as {
    email: string
    role: UserRole
    organization_id?: string | null
  }

  if (!email || !role) {
    return NextResponse.json({ error: "Email e papel são obrigatórios" }, { status: 400 })
  }

  // Create the user (send invite email)
  const { data: newUser, error: createError } = await adminClient.auth.admin.inviteUserByEmail(email, {
    data: { role },
  })

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 400 })
  }

  // Upsert profile with role and org
  if (newUser?.user) {
    await adminClient.from("profiles").upsert({
      id: newUser.user.id,
      role,
      organization_id: organization_id ?? null,
      is_active: true,
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" })
  }

  return NextResponse.json({ success: true, userId: newUser?.user?.id })
}
