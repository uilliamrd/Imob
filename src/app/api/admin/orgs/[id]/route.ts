import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") return NextResponse.json({ error: "Acesso negado" }, { status: 403 })

  const { id } = await params

  const [{ data: corretores }, { count: imoveisCount }] = await Promise.all([
    admin
      .from("profiles")
      .select("id, full_name, avatar_url, creci, whatsapp, slug, is_active, role")
      .eq("organization_id", id)
      .order("full_name"),
    admin
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("org_id", id),
  ])

  return NextResponse.json({ corretores: corretores ?? [], imoveisCount: imoveisCount ?? 0 })
}
