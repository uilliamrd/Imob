import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { AnunciosClient } from "@/components/dashboard/AnunciosClient"
import { PageHeader } from "@/components/dashboard/PageHeader"
import type { PendingHighlight, PendingBoost } from "@/components/dashboard/AnunciosClient"
import { getPlanLimits } from "@/lib/plans"
import type { PropertyAd, OrgPlan, OrgType } from "@/types/database"
import { Megaphone } from "lucide-react"

export const dynamic = "force-dynamic"

const PROPERTY_SELECT =
  "id, title, slug, price, images, neighborhood, city, org_id, organization:organizations(id, name)"

export default async function AnunciosPage() {
  await requireAuth(["admin"])

  const admin = createAdminClient()

  const [{ data: rawAds }, { data: rawProperties }, { data: rawOrgs }, { data: rawPH }, { data: rawPB }] = await Promise.all([
    admin
      .from("property_ads")
      .select(`*, property:properties(${PROPERTY_SELECT})`)
      .order("created_at", { ascending: false }),
    admin
      .from("properties")
      .select(PROPERTY_SELECT)
      .eq("visibility", "publico")
      .eq("status", "disponivel")
      .order("title"),
    admin
      .from("organizations")
      .select("id, plan, type, highlight_quota, super_highlight_quota"),
    admin
      .from("property_highlights")
      .select("id, property_id, highlight, paid_amount, created_at, property:properties(title)")
      .eq("status", "pendente")
      .order("created_at", { ascending: true }),
    admin
      .from("property_boosts")
      .select("id, property_id, boost, duracao_dias, paid_amount, created_at, property:properties(title)")
      .eq("status", "pendente")
      .order("created_at", { ascending: true }),
  ])

  const orgQuotas: Record<string, { highlight_limit: number; super_limit: number }> = {}
  for (const org of rawOrgs ?? []) {
    const limits = getPlanLimits((org.type ?? "imobiliaria") as OrgType, (org.plan ?? "free") as OrgPlan)
    orgQuotas[org.id] = {
      highlight_limit: (org.highlight_quota as number | null) ?? limits.max_highlights,
      super_limit: (org.super_highlight_quota as number | null) ?? limits.max_super_highlights,
    }
  }

  return (
    <div className="px-4 py-6 lg:p-8 max-w-6xl">
      <PageHeader
        icon={Megaphone}
        category="Administração"
        title="Anúncios"
        description="Gerencie destaques e super destaques exibidos no portal de imóveis."
      />

      <AnunciosClient
        initialAds={(rawAds ?? []) as unknown as PropertyAd[]}
        allProperties={(rawProperties ?? []) as unknown as Array<{
          id: string; title: string; slug: string; price: number
          images: string[]; neighborhood: string | null; city: string | null
          org_id: string | null
          organization: { id: string; name: string } | null
        }>}
        orgQuotas={orgQuotas}
        pendingHighlights={(rawPH ?? []) as unknown as PendingHighlight[]}
        pendingBoosts={(rawPB ?? []) as unknown as PendingBoost[]}
      />
    </div>
  )
}
