import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { PlanosClient } from "@/components/dashboard/PlanosClient"
import { Layers } from "lucide-react"
import type { OrgPlan, OrgType, SubscriptionStatus } from "@/types/database"

export const dynamic = "force-dynamic"

export default async function PlanosPage() {
  await requireAuth(["admin"])
  const admin = createAdminClient()

  const [{ data: orgs }, { data: profiles }] = await Promise.all([
    admin
      .from("organizations")
      .select("id, name, type, plan, subscription_status, subscription_expires_at, payment_due_date, logo")
      .order("name"),
    admin
      .from("profiles")
      .select("id, full_name, role, plan, subscription_status, subscription_expires_at, payment_due_date")
      .eq("role", "corretor")
      .is("organization_id", null)
      .order("full_name"),
  ])

  const orgRows = (orgs ?? []).map((o) => ({
    id: o.id,
    kind: "org" as const,
    entityType: o.type as OrgType,
    name: o.name,
    logo: o.logo as string | null,
    plan: (o.plan ?? "free") as OrgPlan,
    subscription_status: (o.subscription_status ?? "trial") as SubscriptionStatus,
    subscription_expires_at: o.subscription_expires_at as string | null,
    payment_due_date: o.payment_due_date as string | null,
  }))

  const corretorRows = (profiles ?? []).map((p) => ({
    id: p.id,
    kind: "corretor" as const,
    entityType: "corretor" as const,
    name: p.full_name ?? "—",
    logo: null,
    plan: (p.plan ?? "free") as OrgPlan,
    subscription_status: (p.subscription_status ?? "trial") as SubscriptionStatus,
    subscription_expires_at: p.subscription_expires_at as string | null,
    payment_due_date: p.payment_due_date as string | null,
  }))

  return (
    <div className="px-4 py-6 lg:p-8 max-w-6xl">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Layers size={18} className="text-gold" />
          <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans">Administração</p>
        </div>
        <h1 className="font-serif text-4xl font-bold text-white">
          <AnimatedGradientText className="font-serif text-4xl font-bold">Planos</AnimatedGradientText>
        </h1>
        <p className="text-muted-foreground font-sans text-sm mt-2 max-w-xl">
          Visão unificada de todos os clientes, planos e status de assinatura.
        </p>
        <div className="divider-gold mt-4 w-20" />
      </div>

      <PlanosClient rows={[...orgRows, ...corretorRows]} />
    </div>
  )
}
