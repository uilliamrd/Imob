import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { AssinaturasClient } from "@/components/dashboard/AssinaturasClient"
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
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <CreditCard size={18} className="text-gold" />
          <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans">Administração</p>
        </div>
        <h1 className="font-serif text-4xl font-bold text-white">
          <AnimatedGradientText className="font-serif text-4xl font-bold">Assinaturas</AnimatedGradientText>
        </h1>
        <p className="text-muted-foreground font-sans text-sm mt-2 max-w-xl">
          Gerencie planos, datas de vencimento e status de acesso dos clientes.
        </p>
        <div className="divider-gold mt-4 w-20" />
      </div>

      <AssinaturasClient
        orgs={(orgs ?? []) as Parameters<typeof AssinaturasClient>[0]["orgs"]}
        corretores={(profiles ?? []) as Parameters<typeof AssinaturasClient>[0]["corretores"]}
      />
    </div>
  )
}
