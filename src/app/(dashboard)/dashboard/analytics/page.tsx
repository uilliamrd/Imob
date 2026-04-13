import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { BarChart3, TrendingUp, Eye, Users, Building2, ArrowUpRight, MessageSquare } from "lucide-react"
import type { Lead } from "@/types/database"

const STATUS_DOT: Record<string, string> = {
  disponivel: "bg-emerald-400",
  reserva:    "bg-amber-400",
  vendido:    "bg-zinc-500",
}

function pct(part: number, total: number) {
  if (!total) return "0%"
  return `${Math.round((part / total) * 100)}%`
}

export default async function AnalyticsPage() {
  const user = await requireAuth(["construtora"])
  const adminClient = createAdminClient()

  // Get user's org
  const { data: profile } = await adminClient
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  const orgId = profile?.organization_id ?? null

  if (!orgId) {
    return (
      <div className="p-8 max-w-6xl">
        <p className="text-white/30 font-sans text-sm">Você não está vinculado a nenhuma organização.</p>
      </div>
    )
  }

  // Fetch leads + properties in one go; profiles fetched separately for names
  const [{ data: rawLeads }, { data: allProfiles }] = await Promise.all([
    adminClient
      .from("leads")
      .select("*, property:properties(title, status, slug)")
      .eq("org_id", orgId)
      .order("created_at", { ascending: false }),
    adminClient
      .from("profiles")
      .select("id, full_name"),
  ])

  const profileNameMap = Object.fromEntries(
    (allProfiles ?? []).map((p) => [p.id, p.full_name as string | null])
  )

  const leads = (rawLeads ?? []) as (Lead & {
    property: { title: string; status: string; slug: string } | null
  })[]

  const totalLeads = leads.length
  const converted = leads.filter((l) => l.status === "convertido").length
  const thisMonth = new Date(); thisMonth.setDate(1); thisMonth.setHours(0,0,0,0)
  const leadsThisMonth = leads.filter((l) => new Date(l.created_at) >= thisMonth).length

  // Group by referrer (corretor)
  const partnerMap = new Map<string, { name: string; leads: number; converted: number }>()
  for (const lead of leads) {
    if (!lead.ref_id) continue
    const key = lead.ref_id
    const name = profileNameMap[lead.ref_id] ?? "Corretor sem nome"
    const existing = partnerMap.get(key)
    if (existing) {
      existing.leads++
      if (lead.status === "convertido") existing.converted++
    } else {
      partnerMap.set(key, { name, leads: 1, converted: lead.status === "convertido" ? 1 : 0 })
    }
  }
  const topPartners = [...partnerMap.values()].sort((a, b) => b.leads - a.leads).slice(0, 8)

  // Group by property
  const propertyMap = new Map<string, { title: string; status: string; leads: number }>()
  for (const lead of leads) {
    if (!lead.property_id) continue
    const key = lead.property_id
    const existing = propertyMap.get(key)
    if (existing) {
      existing.leads++
    } else {
      propertyMap.set(key, {
        title: lead.property?.title ?? lead.property_slug ?? "Imóvel",
        status: lead.property?.status ?? "disponivel",
        leads: 1,
      })
    }
  }
  const topProperties = [...propertyMap.values()].sort((a, b) => b.leads - a.leads).slice(0, 8)

  // Source breakdown
  const sourceMap: Record<string, number> = {}
  for (const lead of leads) {
    const src = lead.source ?? "manual"
    sourceMap[src] = (sourceMap[src] ?? 0) + 1
  }
  const SOURCE_LABELS: Record<string, string> = {
    imovel: "Página do imóvel",
    minisite: "Minisite do corretor",
    selecao: "Seleção compartilhada",
    manual: "Manual",
  }

  const maxPartnerLeads = topPartners[0]?.leads ?? 1
  const maxPropLeads = topProperties[0]?.leads ?? 1

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 size={18} className="text-gold" />
          <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans">Construtora</p>
        </div>
        <h1 className="font-serif text-4xl font-bold text-white">
          <AnimatedGradientText className="font-serif text-4xl font-bold">Analytics de Vendas</AnimatedGradientText>
        </h1>
        <p className="text-white/30 font-sans text-sm mt-2 max-w-xl">
          Leads capturados, corretores parceiros e imóveis mais procurados.
        </p>
        <div className="divider-gold mt-4 w-20" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Leads totais",     value: String(totalLeads),       icon: MessageSquare, color: "text-gold" },
          { label: "Convertidos",      value: String(converted),        icon: TrendingUp,    color: "text-emerald-400" },
          { label: "Leads este mês",   value: String(leadsThisMonth),   icon: Eye,           color: "text-blue-400" },
          { label: "Taxa conversão",   value: pct(converted, totalLeads), icon: ArrowUpRight, color: "text-amber-400" },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-[#161616] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Icon size={14} className={s.color} />
                <p className="text-white/30 text-xs uppercase tracking-wider font-sans">{s.label}</p>
              </div>
              <p className="font-serif text-3xl font-bold text-white">{s.value}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top corretores */}
        <div className="bg-[#161616] border border-white/5 rounded-2xl">
          <div className="px-6 py-5 border-b border-white/5 flex items-center gap-2">
            <Users size={16} className="text-gold" />
            <h2 className="font-serif text-xl font-semibold text-white">Top Corretores</h2>
          </div>
          {topPartners.length === 0 ? (
            <div className="px-6 py-10 text-center text-white/20 font-sans text-sm">
              Nenhum lead com corretor vinculado ainda.
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {topPartners.map((p, i) => (
                <div key={p.name + i} className="px-6 py-4 flex items-center gap-3">
                  <span className="text-white/15 text-xs font-serif w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-sm font-sans truncate">{p.name}</p>
                    <p className="text-emerald-400/50 text-xs font-sans">{p.converted} convertidos</p>
                  </div>
                  <p className="text-white/50 text-sm font-sans flex-shrink-0">{p.leads} leads</p>
                  <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden flex-shrink-0">
                    <div className="h-full bg-gold/50 rounded-full transition-all" style={{ width: `${(p.leads / maxPartnerLeads) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top imóveis */}
        <div className="bg-[#161616] border border-white/5 rounded-2xl">
          <div className="px-6 py-5 border-b border-white/5 flex items-center gap-2">
            <Building2 size={16} className="text-gold" />
            <h2 className="font-serif text-xl font-semibold text-white">Imóveis Mais Procurados</h2>
          </div>
          {topProperties.length === 0 ? (
            <div className="px-6 py-10 text-center text-white/20 font-sans text-sm">
              Nenhum lead vinculado a imóveis ainda.
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {topProperties.map((p, i) => (
                <div key={p.title + i} className="px-6 py-4 flex items-center gap-3">
                  <span className="text-white/15 text-xs font-serif w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/70 text-sm font-sans truncate">{p.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[p.status] ?? "bg-zinc-500"}`} />
                      <p className="text-white/25 text-xs font-sans capitalize">{p.status}</p>
                    </div>
                  </div>
                  <p className="text-white/50 text-sm font-sans flex-shrink-0">{p.leads} leads</p>
                  <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden flex-shrink-0">
                    <div className="h-full bg-gold/50 rounded-full transition-all" style={{ width: `${(p.leads / maxPropLeads) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Source breakdown */}
      {Object.keys(sourceMap).length > 0 && (
        <div className="bg-[#161616] border border-white/5 rounded-2xl">
          <div className="px-6 py-5 border-b border-white/5">
            <h2 className="font-serif text-xl font-semibold text-white">Origem dos Leads</h2>
          </div>
          <div className="p-6 flex flex-wrap gap-4">
            {Object.entries(sourceMap).sort((a, b) => b[1] - a[1]).map(([src, count]) => (
              <div key={src} className="bg-[#111] border border-white/5 rounded-xl px-5 py-4 flex items-center gap-4">
                <div>
                  <p className="text-white/60 text-sm font-sans">{SOURCE_LABELS[src] ?? src}</p>
                  <p className="text-white/20 text-xs font-sans mt-0.5">{pct(count, totalLeads)} do total</p>
                </div>
                <p className="font-serif text-2xl font-bold text-white">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalLeads === 0 && (
        <div className="mt-6 text-center py-16 text-white/20 font-sans text-sm">
          Nenhum lead capturado ainda. Os dados aparecerão aqui conforme os corretores compartilharem links dos seus imóveis.
        </div>
      )}
    </div>
  )
}
