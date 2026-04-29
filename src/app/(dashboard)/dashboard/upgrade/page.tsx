import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { Zap } from "lucide-react"
import type { OrgPlan, OrgType } from "@/types/database"
import { resolveEntityType } from "@/lib/plans"
import type { PlanEntityType } from "@/lib/plans"
import { UpgradeCards } from "@/components/dashboard/UpgradeCards"

export const dynamic = "force-dynamic"

export default async function UpgradePage() {
  const user = await requireAuth(["imobiliaria", "construtora", "corretor", "secretaria"])
  const admin = createAdminClient()

  // Query essencial — role e org_id sempre existem
  const { data: profile } = await admin
    .from("profiles")
    .select("role, organization_id")
    .eq("id", user.id)
    .single()

  const role = (profile?.role ?? "corretor") as string
  const orgId = profile?.organization_id ?? null

  let entityType: PlanEntityType = resolveEntityType(role, null)
  let currentPlan: OrgPlan = "free"

  if (orgId) {
    const { data: org } = await admin
      .from("organizations")
      .select("type, plan")
      .eq("id", orgId)
      .single()
    if (org) {
      entityType = resolveEntityType(role, (org.type ?? null) as OrgType | null)
      currentPlan = ((org.plan ?? "free") as OrgPlan)
    }
  } else {
    const { data: planRow } = await admin
      .from("profiles")
      .select("plan")
      .eq("id", user.id)
      .single()
    currentPlan = (((planRow as unknown as { plan?: string } | null)?.plan) ?? "free") as OrgPlan
  }

  return (
    <div className="px-4 py-6 lg:p-8">
      <PageHeader
        icon={Zap}
        category="Planos"
        title="Escolha seu Plano"
        subtitle="Compare os planos disponíveis e assine diretamente pelo painel."
      />

      <UpgradeCards entityType={entityType} currentPlan={currentPlan} />
    </div>
  )
}
