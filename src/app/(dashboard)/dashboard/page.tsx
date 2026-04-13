import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { NumberTicker } from "@/components/magicui/number-ticker"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { Home, TrendingUp, Link2, DollarSign, ArrowRight } from "lucide-react"
import Link from "next/link"
import type { UserRole } from "@/types/database"

const ROLE_WELCOME: Record<UserRole, string> = {
  admin: "Painel de Controle",
  imobiliaria: "Painel da Imobiliária",
  corretor: "Painel do Corretor",
  construtora: "Painel da Construtora",
}

function formatVGV(value: number) {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}K`
  return `R$ ${value.toFixed(0)}`
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from("profiles")
    .select("*, organization:organizations(*)")
    .eq("id", user.id)
    .single()

  const role = (profile?.role as UserRole) ?? "corretor"
  const firstName = (profile?.full_name ?? user.email ?? "Usuário").split(" ")[0]

  // Start of current month
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [{ count: totalProperties }, { count: availableProperties }, { data: soldThisMonth }] = await Promise.all([
    supabase.from("properties").select("*", { count: "exact", head: true }),
    supabase.from("properties").select("*", { count: "exact", head: true }).eq("status", "disponivel"),
    supabase.from("properties").select("price").eq("status", "vendido").gte("updated_at", monthStart),
  ])

  const vgvMes = (soldThisMonth ?? []).reduce((sum, p) => sum + (p.price ?? 0), 0)

  const stats = [
    { label: "Imóveis Cadastrados",  value: totalProperties ?? 0,   icon: Home,       suffix: "", raw: true },
    { label: "Unidades Disponíveis", value: availableProperties ?? 0, icon: TrendingUp, suffix: "", raw: true },
    { label: "VGV do Mês",           value: vgvMes,                  icon: DollarSign, suffix: "", raw: false, formatted: formatVGV(vgvMes) },
    { label: "Links Ativos",         value: 0,                       icon: Link2,      suffix: "", raw: true },
  ]

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans mb-2">
          {ROLE_WELCOME[role]}
        </p>
        <h1 className="font-serif text-4xl font-bold text-white">
          Olá,{" "}
          <AnimatedGradientText className="font-serif text-4xl font-bold italic">
            {firstName}
          </AnimatedGradientText>
        </h1>
        <div className="divider-gold mt-4 w-20" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-[#161616] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-gold/20 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 rounded-lg bg-gold/10">
                  <Icon size={16} className="text-gold" />
                </div>
              </div>
              {stat.raw ? (
                <p className="font-serif text-3xl font-bold text-white mb-1">
                  <NumberTicker value={stat.value} suffix={stat.suffix} duration={1500} />
                </p>
              ) : (
                <p className="font-serif text-3xl font-bold text-white mb-1">
                  {stat.formatted}
                </p>
              )}
              <p className="text-white/30 text-xs font-sans uppercase tracking-wider">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* Quick actions by role */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {role !== "corretor" && role !== "admin" && (
          <Link href="/dashboard/imoveis/novo" className="group bg-[#161616] border border-white/5 rounded-2xl p-6 hover:border-gold/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-semibold text-white mb-1">Cadastrar Imóvel</h3>
                <p className="text-white/40 text-sm font-sans">Adicionar novo imóvel ao portfólio</p>
              </div>
              <ArrowRight size={20} className="text-white/20 group-hover:text-gold transition-colors" />
            </div>
          </Link>
        )}

        {role !== "admin" && (
          <Link href="/dashboard/imoveis" className="group bg-[#161616] border border-white/5 rounded-2xl p-6 hover:border-gold/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-semibold text-white mb-1">Ver Portfólio</h3>
                <p className="text-white/40 text-sm font-sans">Explorar todos os imóveis disponíveis</p>
              </div>
              <ArrowRight size={20} className="text-white/20 group-hover:text-gold transition-colors" />
            </div>
          </Link>
        )}

        {role === "corretor" && (
          <Link href="/dashboard/corretor" className="group bg-[#161616] border border-white/5 rounded-2xl p-6 hover:border-gold/30 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-semibold text-white mb-1">Meus Links de Ref</h3>
                <p className="text-white/40 text-sm font-sans">Gerar e gerenciar links personalizados</p>
              </div>
              <ArrowRight size={20} className="text-white/20 group-hover:text-gold transition-colors" />
            </div>
          </Link>
        )}

        {role === "admin" && (
          <>
            <Link href="/dashboard/usuarios" className="group bg-[#161616] border border-white/5 rounded-2xl p-6 hover:border-gold/30 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-white mb-1">Usuários</h3>
                  <p className="text-white/40 text-sm font-sans">Gerenciar e convidar usuários</p>
                </div>
                <ArrowRight size={20} className="text-white/20 group-hover:text-gold transition-colors" />
              </div>
            </Link>
            <Link href="/dashboard/admin" className="group bg-[#161616] border border-white/5 rounded-2xl p-6 hover:border-gold/30 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-white mb-1">Organizações</h3>
                  <p className="text-white/40 text-sm font-sans">Gerenciar imobiliárias e construtoras</p>
                </div>
                <ArrowRight size={20} className="text-white/20 group-hover:text-gold transition-colors" />
              </div>
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
