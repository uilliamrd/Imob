import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { BarChart3, Home, TrendingUp, CheckCircle2, Clock } from "lucide-react"
import { redirect } from "next/navigation"

function formatVGV(value: number) {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000)     return `R$ ${(value / 1_000).toFixed(0)}K`
  return `R$ ${value.toFixed(0)}`
}

export default async function AnalyticsPage() {
  const user = await requireAuth(["construtora", "admin"])
  const admin = createAdminClient()

  const { data: profile } = await admin
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  const orgId = profile?.organization_id ?? null
  if (!orgId) redirect("/dashboard")

  const [{ data: properties }, { data: developments }] = await Promise.all([
    admin.from("properties")
      .select("id, status, price, development_id")
      .eq("org_id", orgId),
    admin.from("developments")
      .select("id, name, cover_image, city, neighborhood")
      .eq("org_id", orgId)
      .order("name"),
  ])

  const props = properties ?? []
  const devs  = developments ?? []

  const total      = props.length
  const disponivel = props.filter(p => p.status === "disponivel").length
  const reservado  = props.filter(p => p.status === "reserva").length
  const vendido    = props.filter(p => p.status === "vendido").length
  const vgvTotal   = props.filter(p => p.status === "disponivel")
                          .reduce((s: number, p: { price?: number | null }) => s + (p.price ?? 0), 0)

  type DevRow = { id: string; name: string; city: string | null; neighborhood: string | null }
  type PropRow = { status: string; development_id: string | null }

  const devStats = devs.map((dev: DevRow) => {
    const units     = props.filter((p: PropRow) => p.development_id === dev.id)
    const dTotal    = units.length
    const dVendido  = units.filter((p: PropRow) => p.status === "vendido").length
    const dReserva  = units.filter((p: PropRow) => p.status === "reserva").length
    const dDisp     = units.filter((p: PropRow) => p.status === "disponivel").length
    const pct       = dTotal > 0 ? Math.round((dVendido / dTotal) * 100) : 0
    return { ...dev, dTotal, dVendido, dReserva, dDisp, pct }
  })

  const avulsos = props.filter((p: PropRow) => !p.development_id).length

  return (
    <div className="px-4 py-6 lg:p-8 space-y-8 max-w-5xl">
      <PageHeader
        icon={BarChart3}
        category="Construtora"
        title="Analytics"
        subtitle="Visão geral da performance comercial do seu portfólio."
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total de Unidades"  value={total}      icon={Home}         iconColor="muted"   />
        <StatsCard title="Disponíveis"        value={disponivel} icon={TrendingUp}    iconColor="forest"  />
        <StatsCard title="Reservadas"         value={reservado}  icon={Clock}         iconColor="gold"    />
        <StatsCard title="Vendidas"           value={vendido}    icon={CheckCircle2}  iconColor="muted"   />
      </div>

      {/* VGV strip */}
      {vgvTotal > 0 && (
        <div className="rounded-2xl border border-[var(--gold)]/25 bg-[var(--gold)]/5 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-sans">VGV Disponível</p>
            <p className="font-serif text-3xl font-bold text-[var(--gold)] mt-0.5">{formatVGV(vgvTotal)}</p>
          </div>
          <p className="text-xs text-muted-foreground font-sans max-w-[200px] text-right">
            Soma das unidades disponíveis para venda
          </p>
        </div>
      )}

      {/* Per-development breakdown */}
      {devStats.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-sans mb-4">
            Performance por Empreendimento
          </p>
          <div className="flex flex-col gap-3">
            {devStats.map(dev => (
              <div key={dev.id} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-sans font-semibold text-sm text-foreground">{dev.name}</p>
                    {(dev.city || dev.neighborhood) && (
                      <p className="text-xs text-muted-foreground font-sans mt-0.5">
                        {[dev.neighborhood, dev.city].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-sans text-muted-foreground">
                    {dev.dTotal} {dev.dTotal === 1 ? "unidade" : "unidades"}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden mb-3">
                  <div
                    className="h-full bg-[var(--gold)] rounded-full transition-all"
                    style={{ width: `${dev.pct}%` }}
                  />
                </div>

                {/* Status pills */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1.5 text-xs font-sans text-emerald-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    {dev.dDisp} disponível{dev.dDisp !== 1 ? "is" : ""}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-sans text-amber-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                    {dev.dReserva} reservad{dev.dReserva !== 1 ? "as" : "a"}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-sans text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground inline-block" />
                    {dev.dVendido} vendid{dev.dVendido !== 1 ? "as" : "a"}
                  </span>
                  <span className="ml-auto text-xs font-sans font-semibold text-[var(--gold)]">
                    {dev.pct}% vendido
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Avulsos (not linked to a development) */}
      {avulsos > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="font-sans font-semibold text-sm text-foreground mb-1">Imóveis Avulsos</p>
          <p className="text-xs text-muted-foreground font-sans">{avulsos} {avulsos === 1 ? "imóvel não vinculado" : "imóveis não vinculados"} a um empreendimento</p>
        </div>
      )}

      {total === 0 && (
        <div className="text-center py-16 text-muted-foreground font-sans text-sm">
          Nenhum imóvel cadastrado ainda.{" "}
          <a href="/dashboard/imoveis/novo" className="text-[var(--gold)] hover:underline">Cadastrar primeiro imóvel →</a>
        </div>
      )}
    </div>
  )
}
