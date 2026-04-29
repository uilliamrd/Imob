import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { LeadsClient } from "@/components/dashboard/LeadsClient"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { LockedFeature } from "@/components/dashboard/LockedFeature"
import { MessageSquare } from "lucide-react"
import type { Lead, LeadConflict, OrgPlan, OrgType } from "@/types/database"
import { getPlanLimits, getPlanName, resolveEntityType } from "@/lib/plans"

export default async function LeadsPage() {
  const user = await requireAuth(["imobiliaria", "corretor", "secretaria"])
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: profile } = await admin
    .from("profiles")
    .select("role, plan, organization_id, organization:organizations(type, plan)")
    .eq("id", user.id)
    .single()

  const role = profile?.role
  const orgId = profile?.organization_id

  // Gate: corretor free não acessa leads
  const org = profile?.organization as unknown as { type: OrgType; plan: OrgPlan } | null
  const entityType = resolveEntityType(role ?? "corretor", org?.type ?? null)
  const plan = (org?.plan ?? profile?.plan ?? "free") as OrgPlan
  const limits = getPlanLimits(entityType, plan)

  if (!limits.can_view_leads) {
    return (
      <LockedFeature
        title="Acesso a leads bloqueado"
        description="Faça upgrade para receber e gerenciar contatos de clientes."
        planName={getPlanName(entityType, plan)}
        icon={MessageSquare}
      />
    )
  }

  let query = supabase
    .from("leads")
    .select("*, property:properties(id, title, slug)")
    .order("created_at", { ascending: false })

  if (role === "corretor") {
    query = query.eq("ref_id", user.id)
  } else if (role === "imobiliaria" && orgId) {
    query = query.eq("org_id", orgId)
  }

  // Conflitos não reconhecidos (apenas para corretores)
  const [{ data: leads }, { data: rawConflicts }] = await Promise.all([
    query,
    role === "corretor"
      ? supabase
          .from("lead_conflicts")
          .select("id, original_lead_id, acknowledged")
          .eq("original_corretor_id", user.id)
          .eq("acknowledged", false)
      : Promise.resolve({ data: [] }),
  ])

  const conflicts = (rawConflicts ?? []) as Pick<LeadConflict, "id" | "original_lead_id" | "acknowledged">[]

  return (
    <div className="px-4 py-6 lg:p-8 max-w-5xl">
      <PageHeader
        icon={MessageSquare}
        category="Central"
        title="Leads"
        description="Mensagens recebidas pelas páginas de imóveis, minisite e links de referência."
      />

      <LeadsClient
        initialLeads={(leads ?? []) as Lead[]}
        initialConflicts={conflicts}
      />
    </div>
  )
}
