import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { VitrineClient } from "@/components/dashboard/VitrineClient"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { LockedFeature } from "@/components/dashboard/LockedFeature"
import { Globe } from "lucide-react"
import type { Property, UserRole, OrgPlan, OrgType } from "@/types/database"
import { getPlanLimits, getPlanName, resolveEntityType } from "@/lib/plans"

interface PageProps {
  searchParams: Promise<{ search?: string }>
}

export default async function VitrinePage({ searchParams }: PageProps) {
  const { search } = await searchParams
  const user = await requireAuth(["imobiliaria", "corretor"])
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, organization_id")
    .eq("id", user.id)
    .single()

  const role = (profile?.role ?? "corretor") as UserRole
  const orgId = profile?.organization_id ?? null

  // Plan gate
  {
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
    if (!limits.can_access_listings) {
      return (
        <LockedFeature
          title="Base de imóveis bloqueada"
          description="Faça upgrade para acessar o catálogo completo de imóveis e promovê-los no seu portfólio."
          planName={getPlanName(entityType, plan)}
          icon={Globe}
        />
      )
    }
  }

  // Use admin client so the org join bypasses RLS and construtora badges always load
  const { data: properties } = await admin
    .from("properties")
    .select("*, organization:organizations(id, name, type, logo, slug, brand_colors), development:developments(id, name)")
    .eq("visibility", "publico")
    .order("updated_at", { ascending: false })

  // IDs already in user's catalog
  const { data: listed } = await supabase
    .from("property_listings")
    .select("property_id")
    .eq(role === "imobiliaria" ? "org_id" : "user_id", role === "imobiliaria" ? (orgId ?? "") : user.id)

  const listedIds = new Set((listed ?? []).map((l) => l.property_id))

  // User's private notes (table created in migration_v6.sql)
  let initialNotes: Record<string, string> = {}
  try {
    const { data: notesData } = await supabase
      .from("property_notes")
      .select("property_id, note")
      .eq("user_id", user.id)
    initialNotes = Object.fromEntries((notesData ?? []).map((n) => [n.property_id, n.note]))
  } catch { /* migration_v6 not yet applied */ }

  return (
    <div className="px-4 py-6 lg:p-8 max-w-6xl">
      <PageHeader
        icon={Globe}
        category="Curadoria"
        title="Base de Imóveis"
        description="Base completa de imóveis disponíveis no sistema. Adicione ao seu portfólio para exibir no minisite."
      />

      <VitrineClient
        properties={(properties ?? []) as Property[]}
        listedIds={listedIds}
        userId={user.id}
        orgId={orgId}
        role={role}
        initialSearch={search ?? ""}
        initialNotes={initialNotes}
      />
    </div>
  )
}
