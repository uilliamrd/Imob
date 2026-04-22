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

  const [
    { data: orgs },
    { data: profiles },
    { data: corretoresAll },
    { data: propertiesAll },
    { data: adsActive },
  ] = await Promise.all([
    admin
      .from("organizations")
      .select("id, name, type, plan, subscription_status, subscription_expires_at, payment_due_date, logo, highlight_quota, super_highlight_quota, is_section_highlighted")
      .order("name"),
    admin
      .from("profiles")
      .select("id, full_name, role, plan, subscription_status, subscription_expires_at, payment_due_date")
      .eq("role", "corretor")
      .is("organization_id", null)
      .order("full_name"),
    admin
      .from("profiles")
      .select("organization_id")
      .eq("role", "corretor")
      .not("organization_id", "is", null),
    admin
      .from("properties")
      .select("org_id")
      .not("org_id", "is", null),
    admin
      .from("property_ads")
      .select("org_id, tier")
      .eq("status", "active"),
  ])

  // Build count maps
  const corretoresMap: Record<string, number> = {}
  for (const p of corretoresAll ?? []) {
    if (p.organization_id) corretoresMap[p.organization_id] = (corretoresMap[p.organization_id] ?? 0) + 1
  }
  const propertiesMap: Record<string, number> = {}
  for (const p of propertiesAll ?? []) {
    if (p.org_id) propertiesMap[p.org_id] = (propertiesMap[p.org_id] ?? 0) + 1
  }

  const adsUsageMap: Record<string, { destaque: number; super_destaque: number }> = {}
  for (const ad of adsActive ?? []) {
    if (!ad.org_id) continue
    if (!adsUsageMap[ad.org_id]) adsUsageMap[ad.org_id] = { destaque: 0, super_destaque: 0 }
    if (ad.tier === "destaque") adsUsageMap[ad.org_id].destaque++
    if (ad.tier === "super_destaque") adsUsageMap[ad.org_id].super_destaque++
  }

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
    highlight_quota: o.highlight_quota as number | null,
    super_highlight_quota: o.super_highlight_quota as number | null,
    is_section_highlighted: (o.is_section_highlighted ?? false) as boolean,
    corretores_count: corretoresMap[o.id] ?? 0,
    imoveis_count: propertiesMap[o.id] ?? 0,
    highlights_used: adsUsageMap[o.id]?.destaque ?? 0,
    super_highlights_used: adsUsageMap[o.id]?.super_destaque ?? 0,
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
    highlight_quota: null,
    super_highlight_quota: null,
    is_section_highlighted: false,
    corretores_count: 0,
    imoveis_count: 0,
    highlights_used: 0,
    super_highlights_used: 0,
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
