import { createAdminClient } from "@/lib/supabase/admin"
import { VendaWizard } from "@/components/venda/VendaWizard"
import type { CorretorCard } from "@/components/venda/VendaWizard"

export const dynamic = "force-dynamic"

export default async function VendaPage() {
  const admin = createAdminClient()

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, full_name, avatar_url, creci, bio, organization:organizations(id, name)")
    .eq("role", "corretor")
    .eq("is_active", true)
    .order("full_name")

  const corretores = (profiles ?? []) as unknown as CorretorCard[]

  return <VendaWizard corretores={corretores} />
}
