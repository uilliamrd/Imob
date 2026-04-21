import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { MercadoClient } from "@/components/dashboard/MercadoClient"
import { TrendingUp, Lock } from "lucide-react"
import type { OrgPlan, OrgType } from "@/types/database"
import { getPlanLimits, getPlanName, resolveEntityType } from "@/lib/plans"

export default async function MercadoPage() {
  const user = await requireAuth(["admin", "imobiliaria", "construtora", "secretaria"])
  const admin = createAdminClient()

  const { data: profile } = await admin
    .from("profiles")
    .select("role, plan, organization_id, organization:organizations(type, plan, name)")
    .eq("id", user.id)
    .single()

  const role = profile?.role ?? "corretor"
  const org = profile?.organization as unknown as { type: OrgType; plan: OrgPlan; name: string } | null
  const entityType = resolveEntityType(role, org?.type ?? null)
  const plan = (org?.plan ?? profile?.plan ?? "free") as OrgPlan
  const limits = getPlanLimits(entityType, plan)
  const orgId = profile?.organization_id

  if (!limits.can_view_market_data && role !== "admin") {
    const planName = getPlanName(entityType, plan)
    return (
      <div className="px-4 py-6 lg:p-8 max-w-2xl">
        <div className="flex flex-col items-center text-center py-20 gap-4">
          <div className="w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center">
            <Lock size={24} className="text-gold" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground">Inteligência de Mercado bloqueada</h2>
          <p className="text-muted-foreground font-sans text-sm max-w-sm">
            Seu plano atual (<strong>{planName}</strong>) não inclui acesso à análise de mercado. Faça upgrade para acessar relatórios de vendas, ticket médio, inventário e valorização.
          </p>
          <a href="/dashboard/configuracoes"
            className="mt-2 px-6 py-3 bg-gold text-graphite hover:bg-gold-light transition-colors text-xs uppercase tracking-[0.2em] font-sans rounded-lg">
            Ver planos
          </a>
        </div>
      </div>
    )
  }

  // Build queries scoped by role
  let baseQuery = admin.from("properties").select("id, price, status, categoria, features, neighborhood, city, updated_at, created_by, org_id")
  if (role !== "admin" && orgId) {
    baseQuery = baseQuery.eq("org_id", orgId)
  } else if (role === "secretaria" && orgId) {
    baseQuery = baseQuery.eq("org_id", orgId)
  }

  const [{ data: allProps }, { data: teamProfiles }, { data: leadsData }, { data: selectionsData }] = await Promise.all([
    baseQuery,
    // Team performance: only for imobiliária and admin
    (role === "imobiliaria" || role === "admin") && orgId
      ? admin.from("profiles").select("id, full_name").eq("organization_id", orgId).eq("role", "corretor")
      : Promise.resolve({ data: [] }),
    // Leads per corretor
    (role === "imobiliaria" || role === "admin") && orgId
      ? admin.from("leads").select("ref_id, status").eq("org_id", orgId)
      : Promise.resolve({ data: [] }),
    // Selections per corretor
    (role === "imobiliaria" || role === "admin") && orgId
      ? admin.from("selections").select("corretor_id, id").eq("org_id", orgId)
      : Promise.resolve({ data: [] }),
  ])

  const props = allProps ?? []
  const corretores = (teamProfiles ?? []) as { id: string; full_name: string | null }[]
  const leads = leadsData ?? []
  const selections = selectionsData ?? []

  // Pre-compute analytics server-side
  const vendidos = props.filter((p) => p.status === "vendido")
  const disponiveis = props.filter((p) => p.status === "disponivel")

  // Sales by period buckets
  const now = Date.now()
  const buckets = { semana: 0, mes: 0, semestre: 0, ano: 0, dois_anos: 0, cinco_anos: 0 }
  for (const p of vendidos) {
    const ms = now - new Date(p.updated_at).getTime()
    const days = ms / 86400000
    if (days <= 7) buckets.semana++
    if (days <= 30) buckets.mes++
    if (days <= 180) buckets.semestre++
    if (days <= 365) buckets.ano++
    if (days <= 730) buckets.dois_anos++
    if (days <= 1825) buckets.cinco_anos++
  }

  // Category breakdown (vendidos)
  const byCategory: Record<string, number> = {}
  for (const p of vendidos) {
    const cat = p.categoria ?? "Outro"
    byCategory[cat] = (byCategory[cat] ?? 0) + 1
  }

  // Bedroom distribution (vendidos)
  const byBedrooms: Record<string, number> = {}
  for (const p of vendidos) {
    const feat = p.features as Record<string, unknown>
    const n = (feat?.suites ?? feat?.dormitorios ?? feat?.quartos ?? "—") as string | number
    const key = n === "—" ? "N/A" : `${n} suite(s)`
    byBedrooms[key] = (byBedrooms[key] ?? 0) + 1
  }

  // Avg ticket by category
  const ticketMap: Record<string, { sum: number; count: number }> = {}
  for (const p of vendidos) {
    const cat = p.categoria ?? "Outro"
    if (!ticketMap[cat]) ticketMap[cat] = { sum: 0, count: 0 }
    ticketMap[cat].sum += Number(p.price) || 0
    ticketMap[cat].count++
  }
  const avgTicket = Object.entries(ticketMap).map(([cat, { sum, count }]) => ({
    categoria: cat,
    avg: count > 0 ? sum / count : 0,
    count,
  }))

  // Inventory analysis (category + suites) — velocity by typology
  const typologyMap: Record<string, { disponivel: number; vendido: number }> = {}
  for (const p of [...disponiveis, ...vendidos]) {
    const feat = p.features as Record<string, unknown>
    const suites = feat?.suites ?? feat?.dormitorios ?? "?"
    const key = `${p.categoria ?? "Outro"} ${suites}s`
    if (!typologyMap[key]) typologyMap[key] = { disponivel: 0, vendido: 0 }
    if (p.status === "disponivel") typologyMap[key].disponivel++
    else typologyMap[key].vendido++
  }
  const inventory = Object.entries(typologyMap)
    .map(([typology, { disponivel, vendido }]) => ({
      typology,
      disponivel,
      vendido,
      taxa: vendido + disponivel > 0 ? vendido / (vendido + disponivel) : 0,
    }))
    .sort((a, b) => b.taxa - a.taxa)

  // Price per m² by neighborhood (disponíveis)
  const m2Map: Record<string, { sum: number; count: number }> = {}
  for (const p of disponiveis) {
    const feat = p.features as Record<string, unknown>
    const area = Number(feat?.area_m2) || 0
    if (!area || !p.price || !p.neighborhood) continue
    const bairro = p.neighborhood
    if (!m2Map[bairro]) m2Map[bairro] = { sum: 0, count: 0 }
    m2Map[bairro].sum += Number(p.price) / area
    m2Map[bairro].count++
  }
  const m2ByNeighborhood = Object.entries(m2Map)
    .map(([bairro, { sum, count }]) => ({ bairro, avgM2: sum / count, count }))
    .sort((a, b) => b.avgM2 - a.avgM2)
    .slice(0, 15)

  // Team performance (imobiliária only)
  const leadsPerCorretor = Object.fromEntries(
    corretores.map((c) => [c.id, leads.filter((l) => l.ref_id === c.id).length])
  )
  const convertedPerCorretor = Object.fromEntries(
    corretores.map((c) => [c.id, leads.filter((l) => l.ref_id === c.id && l.status === "convertido").length])
  )
  const selectionsPerCorretor = Object.fromEntries(
    corretores.map((c) => [c.id, selections.filter((s) => s.corretor_id === c.id).length])
  )
  const imoveisPerCorretor = Object.fromEntries(
    corretores.map((c) => [c.id, props.filter((p) => p.created_by === c.id).length])
  )

  const teamStats = corretores.map((c) => ({
    id: c.id,
    name: c.full_name ?? "—",
    imoveis: imoveisPerCorretor[c.id] ?? 0,
    leads: leadsPerCorretor[c.id] ?? 0,
    convertidos: convertedPerCorretor[c.id] ?? 0,
    selecoes: selectionsPerCorretor[c.id] ?? 0,
  })).sort((a, b) => b.leads - a.leads)

  return (
    <div className="px-4 py-6 lg:p-8 max-w-6xl">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <TrendingUp size={18} className="text-gold" />
          <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans">Análise</p>
        </div>
        <h1 className="font-serif text-4xl font-bold text-white">
          <AnimatedGradientText className="font-serif text-4xl font-bold">Inteligência de Mercado</AnimatedGradientText>
        </h1>
        <p className="text-muted-foreground font-sans text-sm mt-2 max-w-xl">
          Análise de vendas, inventário e desempenho{org?.name ? ` de ${org.name}` : " geral"}.
        </p>
        <div className="divider-gold mt-4 w-20" />
      </div>

      <MercadoClient
        salesBuckets={buckets}
        byCategory={byCategory}
        byBedrooms={byBedrooms}
        avgTicket={avgTicket}
        inventory={inventory.slice(0, 20)}
        m2ByNeighborhood={m2ByNeighborhood}
        teamStats={teamStats}
        totalProps={props.length}
        totalVendidos={vendidos.length}
        totalDisponiveis={disponiveis.length}
        showTeam={role === "imobiliaria" || role === "admin"}
      />
    </div>
  )
}
