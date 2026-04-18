import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { LeadsClient } from "@/components/dashboard/LeadsClient"
import { MessageSquare, Lock } from "lucide-react"
import type { Lead, LeadConflict, OrgPlan, OrgType } from "@/types/database"
import { getPlanLimits, getPlanName, resolveEntityType } from "@/lib/plans"

export default async function LeadsPage() {
  const user = await requireAuth(["imobiliaria", "corretor"])
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
    const planName = getPlanName(entityType, plan)
    return (
      <div className="px-4 py-6 lg:p-8 max-w-2xl">
        <div className="flex flex-col items-center text-center py-20 gap-4">
          <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center">
            <Lock size={24} className="text-gold" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground">Acesso a leads bloqueado</h2>
          <p className="text-muted-foreground font-sans text-sm max-w-sm">
            Seu plano atual (<strong>{planName}</strong>) não inclui acesso ao CRM de leads. Faça upgrade para receber e gerenciar contatos de clientes.
          </p>
          <a
            href="/dashboard/configuracoes"
            className="mt-2 px-6 py-3 bg-gold text-graphite hover:bg-gold-light transition-colors text-xs uppercase tracking-[0.2em] font-sans rounded-lg"
          >
            Ver planos
          </a>
        </div>
      </div>
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
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare size={18} className="text-gold" />
          <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans">Central</p>
        </div>
        <h1 className="font-serif text-4xl font-bold text-white">
          <AnimatedGradientText className="font-serif text-4xl font-bold">Leads</AnimatedGradientText>
        </h1>
        <p className="text-muted-foreground font-sans text-sm mt-2 max-w-xl">
          Mensagens recebidas pelas páginas de imóveis, minisite e links de referência.
        </p>
        <div className="divider-gold mt-4 w-20" />
      </div>

      <LeadsClient
        initialLeads={(leads ?? []) as Lead[]}
        initialConflicts={conflicts}
      />
    </div>
  )
}
