import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { AssinaturasClient } from "@/components/dashboard/AssinaturasClient"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { CreditCard } from "lucide-react"

export default async function AssinaturasPage() {
  await requireAuth(["admin"])
  const admin = createAdminClient()

  const [{ data: orgs }, { data: profiles }] = await Promise.all([
    admin
      .from("organizations")
      .select("id, name, type, plan, subscription_status, subscription_expires_at, payment_due_date")
      .order("payment_due_date", { ascending: true, nullsFirst: false }),
    admin
      .from("profiles")
      .select("id, full_name, role, plan, subscription_status, subscription_expires_at, payment_due_date, organization_id")
      .eq("role", "corretor")
      .is("organization_id", null)
      .order("payment_due_date", { ascending: true, nullsFirst: false }),
  ])

  return (
    <div className="px-4 py-6 lg:p-8 max-w-5xl">
      <PageHeader
        icon={CreditCard}
        category="Administração"
        title="Assinaturas"
        description="Gerencie planos, datas de vencimento e status de acesso dos clientes."
      />

      <AssinaturasClient
        orgs={(orgs ?? []) as Parameters<typeof AssinaturasClient>[0]["orgs"]}
        corretores={(profiles ?? []) as Parameters<typeof AssinaturasClient>[0]["corretores"]}
      />
    </div>
  )
}
