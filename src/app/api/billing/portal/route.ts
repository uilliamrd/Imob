import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  if (!profile?.organization_id)
    return NextResponse.json({ error: "Organização não encontrada" }, { status: 404 })

  const { data: org } = await admin
    .from("organizations")
    .select("asaas_customer_id")
    .eq("id", profile.organization_id)
    .single()

  if (!org?.asaas_customer_id) {
    // Ainda não tem assinatura, redireciona para configurações
    return NextResponse.redirect(new URL("/dashboard/configuracoes", req.url))
  }

  // Área do cliente Asaas — onde o cliente vê boletos e histórico
  return NextResponse.redirect(
    new URL(`https://www.asaas.com/c/${org.asaas_customer_id}`)
  )
}
