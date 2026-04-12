import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { BarChart3, TrendingUp, Eye, Users, Building2, ArrowUpRight } from "lucide-react"

// Placeholder — será alimentado por eventos de rastreamento de cliques
const MOCK_PARTNERS = [
  { name: "Imobiliária Horizonte", type: "Imobiliária", clicks: 142, conversions: 8,  color: "bg-gold/20 text-gold" },
  { name: "Carlos Mendes (Corretor)", type: "Corretor",   clicks: 98,  conversions: 5,  color: "bg-blue-900/30 text-blue-300" },
  { name: "Ana Lima (Corretor)",     type: "Corretor",   clicks: 67,  conversions: 3,  color: "bg-blue-900/30 text-blue-300" },
  { name: "Imobiliária Premium",     type: "Imobiliária", clicks: 54,  conversions: 2,  color: "bg-gold/20 text-gold" },
  { name: "Roberto Farias (Corretor)", type: "Corretor", clicks: 31,  conversions: 1,  color: "bg-blue-900/30 text-blue-300" },
]

const MOCK_PROPS = [
  { name: "Torre A — Apt 1201",   dev: "Meridian Tower", clicks: 84, status: "disponivel" },
  { name: "Torre B — Cobertura",  dev: "Meridian Tower", clicks: 73, status: "disponivel" },
  { name: "Torre C — Apt 1502",   dev: "Meridian Tower", clicks: 61, status: "disponivel" },
  { name: "Torre A — Apt 1101",   dev: "Meridian Tower", clicks: 45, status: "reserva"    },
  { name: "Torre B — Apt 901",    dev: "Meridian Tower", clicks: 22, status: "vendido"    },
]

const STATUS_DOT: Record<string, string> = {
  disponivel: "bg-emerald-400",
  reserva:    "bg-amber-400",
  vendido:    "bg-zinc-500",
}

export default async function AnalyticsPage() {
  await requireAuth(["construtora"])

  const totalClicks = MOCK_PARTNERS.reduce((a, p) => a + p.clicks, 0)
  const totalConversions = MOCK_PARTNERS.reduce((a, p) => a + p.conversions, 0)

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
          Imobiliárias e corretores que mais geram cliques e conversões nos seus imóveis.
        </p>
        <div className="divider-gold mt-4 w-20" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Cliques totais",   value: totalClicks,                                icon: Eye,       color: "text-gold" },
          { label: "Conversões",       value: totalConversions,                           icon: TrendingUp,color: "text-emerald-400" },
          { label: "Parceiros ativos", value: MOCK_PARTNERS.length,                       icon: Users,     color: "text-blue-400" },
          { label: "Taxa conversão",   value: `${Math.round((totalConversions / totalClicks) * 100)}%`, icon: ArrowUpRight, color: "text-amber-400" },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top parceiros */}
        <div className="bg-[#161616] border border-white/5 rounded-2xl">
          <div className="px-6 py-5 border-b border-white/5 flex items-center gap-2">
            <Users size={16} className="text-gold" />
            <h2 className="font-serif text-xl font-semibold text-white">Top Parceiros</h2>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {MOCK_PARTNERS.map((p, i) => (
              <div key={p.name} className="px-6 py-4 flex items-center gap-3">
                <span className="text-white/15 text-xs font-serif w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-sm font-sans truncate">{p.name}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${p.color} uppercase tracking-wide`}>{p.type}</span>
                </div>
                <div className="text-right">
                  <p className="text-white/60 text-sm font-sans">{p.clicks} cliques</p>
                  <p className="text-emerald-400/60 text-xs font-sans">{p.conversions} conv.</p>
                </div>
                {/* Bar */}
                <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gold/50 rounded-full" style={{ width: `${(p.clicks / MOCK_PARTNERS[0].clicks) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top imóveis */}
        <div className="bg-[#161616] border border-white/5 rounded-2xl">
          <div className="px-6 py-5 border-b border-white/5 flex items-center gap-2">
            <Building2 size={16} className="text-gold" />
            <h2 className="font-serif text-xl font-semibold text-white">Imóveis Mais Vistos</h2>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {MOCK_PROPS.map((p, i) => (
              <div key={p.name} className="px-6 py-4 flex items-center gap-3">
                <span className="text-white/15 text-xs font-serif w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white/70 text-sm font-sans truncate">{p.name}</p>
                  <p className="text-white/25 text-xs font-sans">{p.dev}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${STATUS_DOT[p.status]}`} />
                  <p className="text-white/50 text-sm font-sans">{p.clicks}</p>
                </div>
                <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-gold/50 rounded-full" style={{ width: `${(p.clicks / MOCK_PROPS[0].clicks) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-white/15 text-xs font-sans text-center mt-8">
        Analytics em tempo real em breve · Os dados acima são exemplos ilustrativos
      </p>
    </div>
  )
}
