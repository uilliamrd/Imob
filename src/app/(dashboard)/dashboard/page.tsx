import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { NumberTicker } from "@/components/magicui/number-ticker"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import {
  Home, TrendingUp, Link2, DollarSign, ArrowRight,
  MessageSquare, BookOpen, ExternalLink, Globe,
} from "lucide-react"
import Link from "next/link"
import type { UserRole } from "@/types/database"

const ROLE_WELCOME: Record<UserRole, string> = {
  admin:       "Painel de Controle",
  imobiliaria: "Painel da Imobiliária",
  corretor:    "Painel do Corretor",
  construtora: "Painel da Construtora",
}

function formatVGV(value: number) {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}K`
  return `R$ ${value.toFixed(0)}`
}

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="group bg-[#161616] border border-white/5 rounded-2xl p-6 hover:border-gold/30 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg font-semibold text-white mb-1">{title}</h3>
          <p className="text-white/40 text-sm font-sans">{desc}</p>
        </div>
        <ArrowRight size={20} className="text-white/20 group-hover:text-gold transition-colors" />
      </div>
    </Link>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from("profiles")
    .select("full_name, role, organization_id, whatsapp, creci")
    .eq("id", user.id)
    .single()

  const role = (profile?.role as UserRole) ?? "corretor"
  const firstName = (profile?.full_name ?? user.email ?? "Usuário").split(" ")[0]

  // ── Admin / Construtora dashboard ─────────────────────────────
  if (role === "admin" || role === "construtora") {
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const constrOrgId = role === "construtora" ? (profile?.organization_id ?? null) : null

    const baseQ  = adminClient.from("properties")
    const totalQ = constrOrgId
      ? baseQ.select("*", { count: "exact", head: true }).eq("org_id", constrOrgId)
      : baseQ.select("*", { count: "exact", head: true })
    const availQ = constrOrgId
      ? adminClient.from("properties").select("*", { count: "exact", head: true }).eq("org_id", constrOrgId).eq("status", "disponivel")
      : adminClient.from("properties").select("*", { count: "exact", head: true }).eq("status", "disponivel")
    const soldQ  = constrOrgId
      ? adminClient.from("properties").select("price").eq("org_id", constrOrgId).eq("status", "vendido").gte("updated_at", monthStart)
      : adminClient.from("properties").select("price").eq("status", "vendido").gte("updated_at", monthStart)

    const [
      { count: totalProperties },
      { count: availableProperties },
      { data: soldThisMonth },
    ] = await Promise.all([totalQ, availQ, soldQ])

    const vgvMes = (soldThisMonth ?? []).reduce((sum, p) => sum + (p.price ?? 0), 0)

    const stats = [
      { label: "Imóveis Cadastrados",  value: totalProperties ?? 0,    icon: Home,       raw: true  as const },
      { label: "Unidades Disponíveis", value: availableProperties ?? 0, icon: TrendingUp, raw: true  as const },
      { label: "VGV do Mês",           value: vgvMes,                   icon: DollarSign, raw: false as const, formatted: formatVGV(vgvMes) },
      { label: "Links Ativos",         value: 0,                        icon: Link2,      raw: true  as const },
    ]

    return (
      <div className="p-8 max-w-6xl">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans mb-2">{ROLE_WELCOME[role]}</p>
          <h1 className="font-serif text-4xl font-bold text-white">
            Olá,{" "}
            <AnimatedGradientText className="font-serif text-4xl font-bold italic">{firstName}</AnimatedGradientText>
          </h1>
          <div className="divider-gold mt-4 w-20" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="bg-[#161616] border border-white/5 rounded-2xl p-6 hover:border-gold/20 transition-colors">
                <div className="mb-4"><div className="p-2 rounded-lg bg-gold/10 w-fit"><Icon size={16} className="text-gold" /></div></div>
                {stat.raw ? (
                  <p className="font-serif text-3xl font-bold text-white mb-1">
                    <NumberTicker value={stat.value} suffix="" duration={1500} />
                  </p>
                ) : (
                  <p className="font-serif text-3xl font-bold text-white mb-1">{stat.formatted}</p>
                )}
                <p className="text-white/30 text-xs font-sans uppercase tracking-wider">{stat.label}</p>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuickLink href="/dashboard/imoveis/novo" title="Cadastrar Imóvel" desc="Adicionar novo imóvel ao portfólio" />
          <QuickLink href="/dashboard/imoveis" title="Ver Imóveis" desc="Explorar todos os imóveis cadastrados" />
          {role === "construtora" && (
            <QuickLink href="/dashboard/lancamentos" title="Lançamentos" desc="Gerenciar empreendimentos em lançamento" />
          )}
          {role === "admin" && (
            <>
              <QuickLink href="/dashboard/usuarios" title="Usuários" desc="Gerenciar e cadastrar usuários" />
              <QuickLink href="/dashboard/admin" title="Organizações" desc="Gerenciar imobiliárias e construtoras" />
            </>
          )}
        </div>
      </div>
    )
  }

  // ── Imobiliária / Corretor dashboard ──────────────────────────
  const orgId = profile?.organization_id ?? null

  const [
    { count: totalLeads },
    { count: myProperties },
  ] = await Promise.all([
    orgId
      ? adminClient.from("leads").select("*", { count: "exact", head: true }).eq("org_id", orgId)
      : adminClient.from("leads").select("*", { count: "exact", head: true }).eq("org_id", user.id),
    adminClient.from("properties").select("*", { count: "exact", head: true })
      .eq("created_by", user.id).eq("status", "disponivel"),
  ])

  const stats2 = [
    { label: "Imóveis Ativos",  value: myProperties ?? 0, icon: Home,           raw: true as const },
    { label: "Leads Recebidos", value: totalLeads ?? 0,   icon: MessageSquare,  raw: true as const },
  ]

  const quickLinks =
    role === "imobiliaria"
      ? [
          { href: "/dashboard/vitrine",   title: "Base de Imóveis",  desc: "Todos os imóveis disponíveis no sistema" },
          { href: "/dashboard/minisite",  title: "Meu Minisite",     desc: "Visualizar e editar seu site" },
          { href: "/dashboard/equipe",    title: "Minha Equipe",     desc: "Gerenciar corretores da imobiliária" },
          { href: "/dashboard/leads",     title: "Leads",            desc: "Consultas e contatos recebidos" },
        ]
      : [
          { href: "/dashboard/vitrine",   title: "Base de Imóveis",  desc: "Todos os imóveis disponíveis" },
          { href: "/dashboard/minisite",  title: "Meu Minisite",     desc: "Visualizar e editar seu minisite" },
          { href: "/dashboard/selecoes",  title: "Seleções",         desc: "Criar e compartilhar curadoria de imóveis" },
          { href: "/dashboard/corretor",  title: "Meus Links",       desc: "Links rastreáveis para imóveis" },
        ]

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans mb-2">{ROLE_WELCOME[role]}</p>
        <h1 className="font-serif text-4xl font-bold text-white">
          Olá,{" "}
          <AnimatedGradientText className="font-serif text-4xl font-bold italic">{firstName}</AnimatedGradientText>
        </h1>
        <div className="divider-gold mt-4 w-20" />
      </div>

      {/* Profile completeness hint for corretores */}
      {role === "corretor" && (!profile?.whatsapp || !profile?.creci) && (
        <div className="mb-8 bg-gold/5 border border-gold/20 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-gold text-sm font-sans font-medium">Complete seu perfil</p>
            <p className="text-white/40 text-xs font-sans mt-0.5">
              Adicione WhatsApp e CRECI para que apareçam no seu minisite.
            </p>
          </div>
          <Link href="/dashboard/configuracoes"
            className="flex items-center gap-2 px-4 py-2 border border-gold/30 text-gold text-xs uppercase tracking-wider font-sans hover:bg-gold/10 transition-colors rounded-lg flex-shrink-0">
            Completar <ArrowRight size={12} />
          </Link>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-10">
        {stats2.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="bg-[#161616] border border-white/5 rounded-2xl p-6 hover:border-gold/20 transition-colors">
              <div className="mb-4"><div className="p-2 rounded-lg bg-gold/10 w-fit"><Icon size={16} className="text-gold" /></div></div>
              <p className="font-serif text-3xl font-bold text-white mb-1">
                <NumberTicker value={stat.value} suffix="" duration={1500} />
              </p>
              <p className="text-white/30 text-xs font-sans uppercase tracking-wider">{stat.label}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickLinks.map((l) => (
          <QuickLink key={l.href} href={l.href} title={l.title} desc={l.desc} />
        ))}
      </div>

      {/* Minisite CTA */}
      <div className="mt-6 bg-[#161616] border border-gold/10 rounded-2xl p-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gold/10"><Globe size={16} className="text-gold" /></div>
          <div>
            <p className="text-white/80 text-sm font-sans font-medium">Seu minisite está publicado</p>
            <p className="text-white/30 text-xs font-sans mt-0.5">
              {role === "corretor" ? `/corretor/${user.id}` : "Acesse via Meu Minisite"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/minisite"
            className="flex items-center gap-1.5 px-4 py-2 border border-white/10 text-white/50 hover:text-gold hover:border-gold/30 text-xs uppercase tracking-wider font-sans transition-colors rounded-lg">
            <BookOpen size={12} /> Editar
          </Link>
          {role === "corretor" && (
            <a href={`/corretor/${user.id}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-gold text-graphite hover:bg-gold-light text-xs uppercase tracking-wider font-sans transition-colors rounded-lg">
              <ExternalLink size={12} /> Ver Site
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
