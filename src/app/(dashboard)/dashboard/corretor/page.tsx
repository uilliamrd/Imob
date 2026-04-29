import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { RefLinksClient } from "@/components/dashboard/RefLinksClient"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { LockedFeature } from "@/components/dashboard/LockedFeature"
import { Link2 } from "lucide-react"
import type { OrgPlan, OrgType } from "@/types/database"
import { getPlanLimits, getPlanName, resolveEntityType } from "@/lib/plans"

export default async function CorretorPage() {
  const user = await requireAuth(["corretor", "admin"])
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, whatsapp, creci, avatar_url, organization_id, role")
    .eq("id", user.id)
    .single()

  // Plan gate (admin sempre passa)
  const role = (profile as unknown as { role?: string } | null)?.role ?? "corretor"
  if (role !== "admin") {
    const orgId = profile?.organization_id ?? null
    let entityType = resolveEntityType(role, null)
    let plan: OrgPlan = "free"
    if (orgId) {
      const { data: org } = await admin.from("organizations").select("type, plan").eq("id", orgId).single()
      if (org) { entityType = resolveEntityType(role, (org.type ?? null) as OrgType | null); plan = (org.plan ?? "free") as OrgPlan }
    } else {
      const { data: pr } = await admin.from("profiles").select("plan").eq("id", user.id).single()
      plan = (((pr as unknown as { plan?: string } | null)?.plan) ?? "free") as OrgPlan
    }
    const limits = getPlanLimits(entityType, plan)
    if (!limits.has_ref_links) {
      return (
        <LockedFeature
          title="Links de referência bloqueados"
          description="Faça upgrade para rastrear seus contatos e receber comissão por referência."
          planName={getPlanName(entityType, plan)}
          icon={Link2}
        />
      )
    }
  }

  const { data: properties } = await supabase
    .from("properties")
    .select("id, title, slug, status, price, neighborhood, city")
    .in("visibility", ["publico", "equipe"])
    .eq("status", "disponivel")
    .order("updated_at", { ascending: false })

  return (
    <div className="px-4 py-6 lg:p-8 max-w-5xl">
      <PageHeader
        icon={Link2}
        category="Corretor"
        title="Meus Links"
        description="Compartilhe imóveis com seu link personalizado. Quando alguém acessar via seu link, seus dados de contato substituem os da construtora."
      />

      <RefLinksClient
        userId={profile?.id ?? user.id}
        properties={properties ?? []}
        profile={profile}
      />
    </div>
  )
}
