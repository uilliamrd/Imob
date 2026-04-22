import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { Zap } from "lucide-react"
import type { OrgPlan, OrgType } from "@/types/database"
import { getPlanLimits, getPlanName, resolveEntityType, PLAN_PRICES } from "@/lib/plans"
import { UpgradeCards } from "@/components/dashboard/UpgradeCards"

export const dynamic = "force-dynamic"

export default async function UpgradePage() {
  const user = await requireAuth(["imobiliaria", "construtora", "corretor", "secretaria"])
  const admin = createAdminClient()

  const { data: profile } = await admin
    .from("profiles")
    .select("role, plan, organization:organizations(type, plan)")
    .eq("id", user.id)
    .single()

  const role = profile?.role ?? "corretor"
  const org = profile?.organization as unknown as { type: OrgType; plan: OrgPlan } | null
  const entityType = resolveEntityType(role, org?.type ?? null)
  const currentPlan = (org?.plan ?? (profile as unknown as { plan?: string } | null)?.plan ?? "free") as OrgPlan

  const plans: OrgPlan[] = ["free", "starter", "pro", "enterprise"]

  const planData = plans.map((plan) => ({
    plan,
    name: getPlanName(entityType, plan),
    prices: PLAN_PRICES[entityType][plan],
    limits: getPlanLimits(entityType, plan),
    isCurrent: plan === currentPlan,
    isHighlighted: plan === "pro",
  }))

  return (
    <div className="px-4 py-6 lg:p-8 max-w-6xl">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Zap size={18} className="text-gold" />
          <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans">Planos</p>
        </div>
        <h1 className="font-serif text-4xl font-bold text-white">
          <AnimatedGradientText className="font-serif text-4xl font-bold">Faça Upgrade</AnimatedGradientText>
        </h1>
        <p className="text-muted-foreground font-sans text-sm mt-2 max-w-xl">
          Escolha o plano ideal para o seu negócio. Entre em contato para solicitar a mudança.
        </p>
        <div className="divider-gold mt-4 w-20" />
      </div>

      <UpgradeCards plans={planData} entityType={entityType} />
    </div>
  )
}
