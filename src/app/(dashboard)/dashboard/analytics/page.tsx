import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { BarChart3, TrendingUp, Eye, Users, Building2, ArrowUpRight, MessageSquare } from "lucide-react"
import type { Lead, UserRole } from "@/types/database"

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
  const user = await requireAuth(["admin", "construtora", "imobiliaria", "corretor"])
  const adminClient = createAdminClient()

  const { data: profile } = await adminClient
    .from("profiles")
    .select("role, organization_id")
    .eq("id", user.id)
    .single()

  const role = (profile?.role ?? "corretor") as UserRole
  const orgId = profile?.organization_id ?? null

  // Build leads query based on role
  let leadsQuery = adminClient
    .from("leads")
    .select("*, property:properties(title, status, slug)")
    .order("created_at", { ascending: false })

  if (role === "admin") {
    // see all
  } else if (role === "corretor") {
    leadsQuery = leadsQuery.eq("ref_id", user.id)
  } else if (orgId) {
    leadsQuery = leadsQuery.eq("org_id", orgId)
  } else {
    return (
      <div className="px-4 py-6 lg:p-8 max-w-6xl">
        <p className="text-muted-foreground font-sans text-sm">Você não está vinculado a nenhuma organização.</p>
      </div>
    )
  }

  // Build property IDs for view counting
  let propertyIdsQuery = adminClient.from("properties").select("id")
  if (role === "corretor") {
    propertyIdsQuery = propertyIdsQuery.eq("created_by", user.id)
  } else if (orgId && role !== "admin") {
    propertyIdsQuery = propertyIdsQuery.eq("org_id", orgId)
  }

  const [{ data: rawLeads }, { data: allProfiles }, { data: ownPropertyIds }] = await Promise.all([
    leadsQuery,
    adminClient.from("profiles").select("id, full_name"),
    role !== "admin" ? propertyIdsQuery : Promise.resolve({ data: null, error: null }),
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

  // Fetch view counts for relevant properties
  let totalViews = 0
  const viewsByProperty: Record<string, number> = {}

  if (role === "admin") {
    const { data: viewRows } = await adminClient
      .from("property_views")
      .select("property_id")
    for (const r of viewRows ?? []) {
      viewsByProperty[r.property_id] = (viewsByProperty[r.property_id] ?? 0) + 1
      totalViews++
    }
  } else {
    const ids = (ownPropertyIds ?? []).map((r: { id: string }) => r.id)
    if (ids.length > 0) {
      const { data: viewRows } = await adminClient
        .from("property_views")
        .select("property_id")
        .in("property_id", ids)
      for (const r of viewRows ?? []) {
        viewsByProperty[r.property_id] = (viewsByProperty[r.property_id] ?? 0) + 1
        totalViews++
      }
    }
  }

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

  // Group by property (merge leads + views)
  const propertyMap = new Map<string, { title: string; status: string; leads: number; views: number }>()
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
        views: viewsByProperty[key] ?? 0,
      })
    }
  }
  // Also add properties that have views but no leads
  for (const [propId, viewCount] of Object.entries(viewsByProperty)) {
    if (!propertyMap.has(propId)) {
      propertyMap.set(propId, { title: propId, status: "disponivel", leads: 0, views: viewCount })
    }
  }
  const topProperties = [...propertyMap.values()]
    .sort((a, b) => (b.leads + b.views) - (a.leads + a.views))
    .slice(0, 8)

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
  const maxPropScore = Math.max(...topProperties.map((p) => p.leads + p.views), 1)

  const roleLabel = role === "admin" ? "Geral" : role === "corretor" ? "Corretor" : role === "imobiliaria" ? "Imobiliária" : "Construtora"

  return (
    <div className="px-4 py-6 lg:p-8 max-w-6xl">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 size={18} className="text-gold" />
          <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans">{roleLabel}</p>
        </div>
        <h1 className="font-serif text-4xl font-bold text-white">
          <AnimatedGradientText className="font-serif text-4xl font-bold">Analytics de Vendas</AnimatedGradientText>
        </h1>
        <p className="text-muted-foreground font-sans text-sm mt-2 max-w-xl">
          Leads capturados, visualizações de imóveis e performance de corretores.
        </p>
        <div className="divider-gold mt-4 w-20" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Leads totais",     value: String(totalLeads),         icon: MessageSquare, color: "text-gold" },
          { label: "Convertidos",      value: String(converted),          icon: TrendingUp,    color: "text-emerald-400" },
          { label: "Leads este mês",   value: String(leadsThisMonth),     icon: Eye,           color: "text-blue-400" },
          { label: "Visualizações",    value: String(totalViews),         icon: ArrowUpRight,  color: "text-amber-400" },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Icon size={14} className={s.color} />
                <p className="text-muted-foreground text-xs uppercase tracking-wider font-sans">{s.label}</p>
              </div>
              <p className="font-serif text-3xl font-bold text-white">{s.value}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top corretores — só aparece se não for corretor individual */}
        {role !== "corretor" && (
          <div className="bg-card border border-border rounded-2xl">
            <div className="px-6 py-5 border-b border-border flex items-center gap-2">
              <Users size={16} className="text-gold" />
              <h2 className="font-serif text-xl font-semibold text-white">Top Corretores</h2>
            </div>
            {topPartners.length === 0 ? (
              <div className="px-6 py-10 text-center text-muted-foreground/50 font-sans text-sm">
                Nenhum lead com corretor vinculado ainda.
              </div>
            ) : (
              <div className="divide-y divide-white/[0.04]">
                {topPartners.map((p, i) => (
                  <div key={p.name + i} className="px-6 py-4 flex items-center gap-3">
                    <span className="text-muted-foreground/40 text-xs font-serif w-4">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground/70 text-sm font-sans truncate">{p.name}</p>
                      <p className="text-emerald-400/50 text-xs font-sans">{p.converted} convertidos</p>
                    </div>
                    <p className="text-muted-foreground text-sm font-sans flex-shrink-0">{p.leads} leads</p>
                    <div className="w-20 h-1.5 bg-muted/50 rounded-full overflow-hidden flex-shrink-0">
                      <div className="h-full bg-gold/50 rounded-full transition-all" style={{ width: `${(p.leads / maxPartnerLeads) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Top imóveis */}
        <div className={`bg-card border border-border rounded-2xl ${role === "corretor" ? "lg:col-span-2" : ""}`}>
          <div className="px-6 py-5 border-b border-border flex items-center gap-2">
            <Building2 size={16} className="text-gold" />
            <h2 className="font-serif text-xl font-semibold text-white">Imóveis Mais Procurados</h2>
          </div>
          {topProperties.length === 0 ? (
            <div className="px-6 py-10 text-center text-muted-foreground/50 font-sans text-sm">
              Nenhum dado ainda.
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {topProperties.map((p, i) => (
                <div key={p.title + i} className="px-6 py-4 flex items-center gap-3">
                  <span className="text-muted-foreground/40 text-xs font-serif w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground/70 text-sm font-sans truncate">{p.title}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[p.status] ?? "bg-zinc-500"}`} />
                      <p className="text-muted-foreground/60 text-xs font-sans capitalize">{p.status}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 text-xs font-sans text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye size={10} className="text-amber-400/60" />{p.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare size={10} className="text-gold/60" />{p.leads}
                    </span>
                  </div>
                  <div className="w-20 h-1.5 bg-muted/50 rounded-full overflow-hidden flex-shrink-0">
                    <div className="h-full bg-gold/50 rounded-full transition-all" style={{ width: `${((p.leads + p.views) / maxPropScore) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Source breakdown */}
      {Object.keys(sourceMap).length > 0 && (
        <div className="bg-card border border-border rounded-2xl">
          <div className="px-6 py-5 border-b border-border">
            <h2 className="font-serif text-xl font-semibold text-white">Origem dos Leads</h2>
          </div>
          <div className="p-6 flex flex-wrap gap-4">
            {Object.entries(sourceMap).sort((a, b) => b[1] - a[1]).map(([src, count]) => (
              <div key={src} className="bg-muted/50 border border-border rounded-xl px-5 py-4 flex items-center gap-4">
                <div>
                  <p className="text-foreground/60 text-sm font-sans">{SOURCE_LABELS[src] ?? src}</p>
                  <p className="text-muted-foreground/50 text-xs font-sans mt-0.5">{pct(count, totalLeads)} do total</p>
                </div>
                <p className="font-serif text-2xl font-bold text-white">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {totalLeads === 0 && totalViews === 0 && (
        <div className="mt-6 text-center py-16 text-muted-foreground/50 font-sans text-sm">
          Nenhum dado ainda. Os dados aparecerão aqui conforme os imóveis forem visitados e leads capturados.
        </div>
      )}
    </div>
  )
}
