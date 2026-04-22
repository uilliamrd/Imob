import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { VitrineClient } from "@/components/dashboard/VitrineClient"
import { Globe, Lock } from "lucide-react"
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
        <div className="px-4 py-6 lg:p-8 max-w-2xl">
          <div className="flex flex-col items-center text-center py-20 gap-4">
            <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center">
              <Lock size={24} className="text-gold" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-foreground">Base de imóveis bloqueada</h2>
            <p className="text-muted-foreground font-sans text-sm max-w-sm">
              Seu plano <strong>{getPlanName(entityType, plan)}</strong> não inclui acesso ao catálogo de imóveis do sistema. Faça upgrade para promover imóveis.
            </p>
            <a href="/dashboard/upgrade"
              className="mt-2 px-6 py-3 bg-gold text-graphite hover:bg-gold-light transition-colors text-xs uppercase tracking-[0.2em] font-sans rounded-lg">
              Ver planos
            </a>
          </div>
        </div>
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
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <Globe size={18} className="text-gold" />
          <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans">Curadoria</p>
        </div>
        <h1 className="font-serif text-4xl font-bold text-foreground">
          <AnimatedGradientText className="font-serif text-4xl font-bold">Base de Imóveis</AnimatedGradientText>
        </h1>
        <p className="text-muted-foreground font-sans text-sm mt-2 max-w-xl">
          Base completa de imóveis disponíveis no sistema. Adicione ao seu portfólio para exibir no minisite.
        </p>
        <div className="divider-gold mt-4 w-20" />
      </div>

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
