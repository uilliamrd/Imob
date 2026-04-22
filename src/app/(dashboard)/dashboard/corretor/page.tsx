import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { RefLinksClient } from "@/components/dashboard/RefLinksClient"
import { Lock } from "lucide-react"
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
        <div className="px-4 py-6 lg:p-8 max-w-2xl">
          <div className="flex flex-col items-center text-center py-20 gap-4">
            <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center">
              <Lock size={24} className="text-gold" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-foreground">Links de referência bloqueados</h2>
            <p className="text-muted-foreground font-sans text-sm max-w-sm">
              Seu plano <strong>{getPlanName(entityType, plan)}</strong> não inclui marcação de clientes por link. Faça upgrade para rastrear seus contatos.
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

  const { data: properties } = await supabase
    .from("properties")
    .select("id, title, slug, status, price, neighborhood, city")
    .in("visibility", ["publico", "equipe"])
    .eq("status", "disponivel")
    .order("updated_at", { ascending: false })

  return (
    <div className="px-4 py-6 lg:p-8 max-w-5xl">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans mb-2">Corretor</p>
        <h1 className="font-serif text-4xl font-bold text-white">
          <AnimatedGradientText className="font-serif text-4xl font-bold">Meus Links</AnimatedGradientText>
        </h1>
        <p className="text-muted-foreground font-sans text-sm mt-2">
          Compartilhe imóveis com seu link personalizado. Quando alguém acessar via seu link, seus dados de contato substituem os da construtora.
        </p>
        <div className="divider-gold mt-4 w-20" />
      </div>

      <RefLinksClient
        userId={profile?.id ?? user.id}
        properties={properties ?? []}
        profile={profile}
      />
    </div>
  )
}
