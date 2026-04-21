"use client"

import { useState } from "react"
import { TrendingUp, TrendingDown, Home, Users, BarChart3, MapPin } from "lucide-react"

interface SalesBuckets {
  semana: number; mes: number; semestre: number; ano: number; dois_anos: number; cinco_anos: number
}

interface AvgTicket { categoria: string; avg: number; count: number }
interface InventoryItem { typology: string; disponivel: number; vendido: number; taxa: number }
interface M2Item { bairro: string; avgM2: number; count: number }
interface TeamStat { id: string; name: string; imoveis: number; leads: number; convertidos: number; selecoes: number }

interface Props {
  salesBuckets: SalesBuckets
  byCategory: Record<string, number>
  byBedrooms: Record<string, number>
  avgTicket: AvgTicket[]
  inventory: InventoryItem[]
  m2ByNeighborhood: M2Item[]
  teamStats: TeamStat[]
  totalProps: number
  totalVendidos: number
  totalDisponiveis: number
  showTeam: boolean
}

type Period = "semana" | "mes" | "semestre" | "ano" | "dois_anos" | "cinco_anos"
const PERIOD_LABELS: Record<Period, string> = {
  semana: "Semana", mes: "Mês", semestre: "6 Meses", ano: "1 Ano", dois_anos: "2 Anos", cinco_anos: "5 Anos"
}

function fmt(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(n)
}

function Bar({ value, max, color = "bg-gold" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="w-full bg-muted/30 rounded-full h-1.5 overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export function MercadoClient({
  salesBuckets, byCategory, byBedrooms, avgTicket, inventory,
  m2ByNeighborhood, teamStats, totalProps, totalVendidos, totalDisponiveis, showTeam,
}: Props) {
  const [period, setPeriod] = useState<Period>("mes")
  const vendidosPeriodo = salesBuckets[period]

  const maxCat = Math.max(...Object.values(byCategory), 1)
  const maxBed = Math.max(...Object.values(byBedrooms), 1)
  const maxTicket = Math.max(...avgTicket.map((t) => t.avg), 1)
  const maxM2 = Math.max(...m2ByNeighborhood.map((m) => m.avgM2), 1)

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Cadastrado", value: totalProps, icon: Home, color: "text-foreground/80" },
          { label: "Disponíveis", value: totalDisponiveis, icon: TrendingUp, color: "text-emerald-400" },
          { label: "Vendidos (total)", value: totalVendidos, icon: BarChart3, color: "text-gold" },
          { label: "Taxa de Absorção", value: `${totalProps > 0 ? Math.round((totalVendidos / totalProps) * 100) : 0}%`, icon: TrendingDown, color: "text-blue-400" },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-xl p-5">
            <kpi.icon size={16} className={`${kpi.color} mb-3`} />
            <p className={`text-2xl font-serif font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-muted-foreground text-xs font-sans mt-1 uppercase tracking-wider">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Vendidos por período */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <h2 className="font-serif text-lg font-semibold text-white">Imóveis Vendidos por Período</h2>
          <div className="flex gap-1 flex-wrap">
            {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-colors ${period === p ? "bg-gold text-graphite" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}>
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
        <p className="text-5xl font-serif font-bold text-gold">{vendidosPeriodo}</p>
        <p className="text-muted-foreground text-sm font-sans mt-1">vendas nos últimos {PERIOD_LABELS[period].toLowerCase()}</p>
      </div>

      {/* Category + Bedrooms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-serif text-lg font-semibold text-white mb-5">Perfil por Categoria</h2>
          <div className="space-y-3">
            {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
              <div key={cat}>
                <div className="flex justify-between text-sm font-sans mb-1">
                  <span className="text-foreground/70">{cat}</span>
                  <span className="text-gold font-medium">{count}</span>
                </div>
                <Bar value={count} max={maxCat} />
              </div>
            ))}
            {Object.keys(byCategory).length === 0 && <p className="text-muted-foreground/50 text-sm">Sem dados de vendas</p>}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-serif text-lg font-semibold text-white mb-5">Dormitórios / Suítes Vendidos</h2>
          <div className="space-y-3">
            {Object.entries(byBedrooms).sort((a, b) => b[1] - a[1]).map(([bed, count]) => (
              <div key={bed}>
                <div className="flex justify-between text-sm font-sans mb-1">
                  <span className="text-foreground/70">{bed}</span>
                  <span className="text-gold font-medium">{count}</span>
                </div>
                <Bar value={count} max={maxBed} />
              </div>
            ))}
            {Object.keys(byBedrooms).length === 0 && <p className="text-muted-foreground/50 text-sm">Sem dados</p>}
          </div>
        </div>
      </div>

      {/* Avg ticket */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-serif text-lg font-semibold text-white mb-5">Ticket Médio por Categoria</h2>
        <div className="space-y-4">
          {avgTicket.sort((a, b) => b.avg - a.avg).map((item) => (
            <div key={item.categoria}>
              <div className="flex justify-between text-sm font-sans mb-1">
                <span className="text-foreground/70">{item.categoria} <span className="text-muted-foreground/50 text-xs">({item.count} vend.)</span></span>
                <span className="text-gold font-medium font-mono text-xs">{fmt(item.avg)}</span>
              </div>
              <Bar value={item.avg} max={maxTicket} color="bg-emerald-500" />
            </div>
          ))}
          {avgTicket.length === 0 && <p className="text-muted-foreground/50 text-sm">Sem dados de vendas</p>}
        </div>
      </div>

      {/* Inventory analysis */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h2 className="font-serif text-lg font-semibold text-white mb-1">Análise de Inventário — Velocidade por Tipologia</h2>
        <p className="text-muted-foreground/50 text-xs font-sans mb-5">Taxa de absorção = vendidos ÷ total cadastrado. Maior = tipologia mais procurada.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-3 text-muted-foreground/60 text-xs uppercase tracking-wider font-normal">Tipologia</th>
                <th className="pb-3 text-muted-foreground/60 text-xs uppercase tracking-wider font-normal text-right">Disponíveis</th>
                <th className="pb-3 text-muted-foreground/60 text-xs uppercase tracking-wider font-normal text-right">Vendidos</th>
                <th className="pb-3 text-muted-foreground/60 text-xs uppercase tracking-wider font-normal text-right">Absorção</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {inventory.map((item) => (
                <tr key={item.typology}>
                  <td className="py-3 text-foreground/80">{item.typology}</td>
                  <td className="py-3 text-right text-muted-foreground">{item.disponivel}</td>
                  <td className="py-3 text-right text-muted-foreground">{item.vendido}</td>
                  <td className="py-3 text-right">
                    <span className={`font-mono text-xs px-2 py-0.5 rounded-full ${item.taxa >= 0.7 ? "bg-emerald-900/30 text-emerald-400" : item.taxa >= 0.4 ? "bg-amber-900/30 text-amber-400" : "bg-muted text-muted-foreground"}`}>
                      {Math.round(item.taxa * 100)}%
                    </span>
                  </td>
                </tr>
              ))}
              {inventory.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-muted-foreground/50">Sem dados suficientes</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Price per m² by neighborhood */}
      {m2ByNeighborhood.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={15} className="text-gold" />
            <h2 className="font-serif text-lg font-semibold text-white">Preço Médio por m² — por Bairro</h2>
          </div>
          <p className="text-muted-foreground/50 text-xs font-sans mb-5">Baseado nos imóveis disponíveis cadastrados no sistema.</p>
          <div className="space-y-3">
            {m2ByNeighborhood.map((item) => (
              <div key={item.bairro}>
                <div className="flex justify-between text-sm font-sans mb-1">
                  <span className="text-foreground/70">{item.bairro} <span className="text-muted-foreground/50 text-xs">({item.count} imóv.)</span></span>
                  <span className="text-gold font-mono text-xs">{fmt(item.avgM2)}/m²</span>
                </div>
                <Bar value={item.avgM2} max={maxM2} color="bg-blue-500" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team performance */}
      {showTeam && teamStats.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Users size={15} className="text-gold" />
            <h2 className="font-serif text-lg font-semibold text-white">Desempenho da Equipe</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 text-muted-foreground/60 text-xs uppercase tracking-wider font-normal">Corretor</th>
                  <th className="pb-3 text-muted-foreground/60 text-xs uppercase tracking-wider font-normal text-right">Imóveis</th>
                  <th className="pb-3 text-muted-foreground/60 text-xs uppercase tracking-wider font-normal text-right">Leads</th>
                  <th className="pb-3 text-muted-foreground/60 text-xs uppercase tracking-wider font-normal text-right">Convertidos</th>
                  <th className="pb-3 text-muted-foreground/60 text-xs uppercase tracking-wider font-normal text-right">Seleções</th>
                  <th className="pb-3 text-muted-foreground/60 text-xs uppercase tracking-wider font-normal text-right">Conversão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {teamStats.map((s) => (
                  <tr key={s.id}>
                    <td className="py-3 text-foreground/80">{s.name}</td>
                    <td className="py-3 text-right text-muted-foreground">{s.imoveis}</td>
                    <td className="py-3 text-right text-muted-foreground">{s.leads}</td>
                    <td className="py-3 text-right text-emerald-400">{s.convertidos}</td>
                    <td className="py-3 text-right text-muted-foreground">{s.selecoes}</td>
                    <td className="py-3 text-right">
                      <span className="font-mono text-xs text-gold">
                        {s.leads > 0 ? `${Math.round((s.convertidos / s.leads) * 100)}%` : "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
