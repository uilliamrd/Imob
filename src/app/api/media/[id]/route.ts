import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const admin = createAdminClient()

  // Verify ownership
  const { data: asset } = await admin
    .from("assets")
    .select("id, tenant_id")
    .eq("id", id)
    .is("deleted_at", null)
    .single()

  if (!asset) return NextResponse.json({ error: "Asset não encontrado" }, { status: 404 })

  const { data: profile } = await admin
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single()

  const isAdmin = profile?.role === "admin"
  if (!isAdmin && profile?.organization_id !== asset.tenant_id) {
    return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
  }

  // Soft delete
  await admin.from("assets").update({
    status: "deleted",
    deleted_at: new Date().toISOString(),
  }).eq("id", id)

  return NextResponse.json({ success: true })
}
