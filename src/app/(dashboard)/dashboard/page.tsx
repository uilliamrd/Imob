import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import Image from "next/image"
import { redirect } from "next/navigation"
import { NumberTicker } from "@/components/magicui/number-ticker"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import {
  Home, TrendingUp, Link2, DollarSign, ArrowRight,
  BookOpen, ExternalLink, Globe,
  Building2, Search, Clock, MapPin,
  Users, MessageSquare, BedDouble, Car, Maximize2,
} from "lucide-react"
import Link from "next/link"
import type { UserRole, Organization, Property, PropertyFeatures } from "@/types/database"

const ROLE_WELCOME: Record<UserRole, string> = {
  admin:       "Painel de Controle",
  imobiliaria: "Painel da Imobiliária",
  corretor:    "Painel do Corretor",
  construtora: "Painel da Construtora",
}

function formatPrice(price: number) {
  if (price >= 1_000_000)
    return `R$ ${(price / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Mi`
  return `R$ ${price.toLocaleString("pt-BR")}`
}

function formatVGV(value: number) {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `R$ ${(value / 1_000).toFixed(0)}K`
  return `R$ ${value.toFixed(0)}`
}

function StatusBadge({ status }: { status: string }) {
  const map = {
    disponivel: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    reserva:    "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30",
    vendido:    "text-muted-foreground bg-muted border-border",
  } as Record<string, string>
  const label = { disponivel: "Disponível", reserva: "Reserva", vendido: "Vendido" } as Record<string, string>
  return (
    <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-sans uppercase tracking-wider ${map[status] ?? map.vendido}`}>
      {label[status] ?? status}
    </span>
  )
}

function FeatureChips({ features }: { features: PropertyFeatures }) {
  return (
    <div className="flex items-center gap-2 mt-1">
      {(features.suites || features.dormitorios) && (
        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground font-sans">
          <BedDouble size={9} className="text-gold/60" />
          {features.suites ?? features.dormitorios}
        </span>
      )}
      {features.vagas && (
        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground font-sans">
          <Car size={9} className="text-gold/60" />
          {features.vagas}v
        </span>
      )}
      {features.area_m2 && (
        <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground font-sans">
          <Maximize2 size={9} className="text-gold/60" />
          {features.area_m2}m²
        </span>
      )}
    </div>
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
    ]

    return (
      <div className="px-4 py-6 lg:p-8 max-w-6xl">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans mb-2">{ROLE_WELCOME[role]}</p>
          <h1 className="font-serif text-4xl font-bold text-foreground">
            Olá,{" "}
            <AnimatedGradientText className="font-serif text-4xl font-bold italic">{firstName}</AnimatedGradientText>
          </h1>
          <div className="divider-gold mt-4 w-20" />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="bg-card border border-border rounded-2xl p-5 shadow-sm dark:shadow-none hover:border-gold/20 transition-colors">
                <div className="mb-4"><div className="p-2 rounded-lg bg-gold/10 w-fit"><Icon size={16} className="text-gold" /></div></div>
                {stat.raw ? (
                  <p className="font-serif text-3xl font-bold text-foreground mb-1">
                    <NumberTicker value={stat.value} suffix="" duration={1500} />
                  </p>
                ) : (
                  <p className="font-serif text-3xl font-bold text-foreground mb-1">{stat.formatted}</p>
                )}
                <p className="text-muted-foreground text-xs font-sans uppercase tracking-wider">{stat.label}</p>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { href: "/dashboard/imoveis/novo", title: "Cadastrar Imóvel",   desc: "Novo imóvel ao portfólio",      icon: Home      },
            { href: "/dashboard/imoveis",      title: "Ver Imóveis",        desc: "Todos os imóveis cadastrados",  icon: Building2 },
            ...(role === "construtora" ? [{ href: "/dashboard/lancamentos", title: "Lançamentos", desc: "Empreendimentos em lançamento", icon: TrendingUp }] : []),
            ...(role === "admin" ? [
              { href: "/dashboard/usuarios",   title: "Usuários",           desc: "Gerenciar e cadastrar usuários", icon: Users    },
              { href: "/dashboard/admin",      title: "Organizações",       desc: "Imobiliárias e construtoras",   icon: Building2 },
            ] : []),
          ].map((l) => {
            const Icon = l.icon
            return (
              <Link key={l.href} href={l.href}
                className="group bg-card border border-border rounded-2xl p-4 hover:border-gold/40 hover:shadow-md dark:hover:shadow-none transition-all duration-300 flex flex-col gap-3">
                <div className="p-2 bg-gold/10 rounded-xl w-fit">
                  <Icon size={16} className="text-gold" />
                </div>
                <div>
                  <p className="font-sans font-semibold text-foreground text-sm group-hover:text-gold transition-colors">{l.title}</p>
                  <p className="text-muted-foreground text-xs mt-0.5 leading-snug">{l.desc}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    )
  }

  // ── Imobiliária / Corretor dashboard ──────────────────────────
  const orgId = profile?.organization_id ?? null

  type ConstrRecentItem = {
    id: string
    title: string
    slug: string
    price: number
    neighborhood: string | null
    city: string | null
    images: string[] | null
    status: string
    features: PropertyFeatures
    org_id: string | null
  }

  const [
    { count: myProperties },
    { data: construtoras },
    { data: constrRecent },
  ] = await Promise.all([
    adminClient.from("properties").select("*", { count: "exact", head: true })
      .eq("created_by", user.id).eq("status", "disponivel"),
    adminClient.from("organizations")
      .select("id, name, slug, logo, brand_colors")
      .eq("type", "construtora")
      .not("slug", "is", null),
    adminClient.from("properties")
      .select("id, title, slug, price, neighborhood, city, images, status, features, org_id")
      .not("org_id", "is", null)
      .eq("visibility", "publico")
      .order("created_at", { ascending: false })
      .limit(6),
  ])

  const { data: recentProperties } = role === "corretor"
    ? await adminClient
        .from("properties")
        .select("id, title, slug, price, neighborhood, city, images, status, org_id")
        .eq("visibility", "publico")
        .order("created_at", { ascending: false })
        .limit(6)
    : { data: null }

  const quickLinks =
    role === "imobiliaria"
      ? [
          { href: "/dashboard/vitrine",   title: "Base de Imóveis",  desc: "Todos os imóveis",           icon: Globe          },
          { href: "/dashboard/minisite",  title: "Meu Minisite",     desc: "Visualizar e editar site",   icon: ExternalLink   },
          { href: "/dashboard/equipe",    title: "Minha Equipe",     desc: "Gerenciar corretores",       icon: Users          },
          { href: "/dashboard/leads",     title: "Leads",            desc: "Contatos recebidos",         icon: MessageSquare  },
        ]
      : [
          { href: "/dashboard/vitrine",   title: "Base de Imóveis",  desc: "Todos os imóveis",           icon: Globe          },
          { href: "/dashboard/minisite",  title: "Meu Minisite",     desc: "Editar seu minisite",        icon: ExternalLink   },
          { href: "/dashboard/selecoes",  title: "Seleções",         desc: "Curadoria para clientes",    icon: BookOpen       },
          { href: "/dashboard/corretor",  title: "Meus Links",       desc: "Links rastreáveis",          icon: Link2          },
        ]

  const construtorasList = (construtoras ?? []) as Array<Organization & { id: string; name: string; slug: string | null; logo: string | null; brand_colors: Organization["brand_colors"] }>
  const constrRecentList = (constrRecent ?? []) as ConstrRecentItem[]
  const recentList = (recentProperties ?? []) as Array<Pick<Property, "id" | "title" | "slug" | "price" | "neighborhood" | "city" | "images" | "status" | "org_id">>

  return (
    <div className="px-4 py-6 lg:p-8 max-w-5xl">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="mb-7">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans mb-2">{ROLE_WELCOME[role]}</p>
        <h1 className="font-serif text-3xl lg:text-4xl font-bold text-foreground">
          Olá,{" "}
          <AnimatedGradientText className="font-serif text-3xl lg:text-4xl font-bold italic">{firstName}</AnimatedGradientText>
        </h1>
        <div className="divider-gold mt-4 w-20" />
      </div>

      {/* ── Profile hint ───────────────────────────────────── */}
      {role === "corretor" && (!profile?.whatsapp || !profile?.creci) && (
        <div className="mb-5 bg-gold/5 border border-gold/20 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-gold text-sm font-sans font-medium">Complete seu perfil</p>
            <p className="text-muted-foreground text-xs font-sans mt-0.5">
              Adicione WhatsApp e CRECI para aparecerem no seu minisite.
            </p>
          </div>
          <Link href="/dashboard/minisite"
            className="flex items-center gap-1.5 px-4 py-2 border border-gold/30 text-gold text-xs uppercase tracking-wider font-sans hover:bg-gold/10 transition-colors rounded-lg flex-shrink-0">
            Completar <ArrowRight size={11} />
          </Link>
        </div>
      )}

      {/* ── Quick search ───────────────────────────────────── */}
      {role === "corretor" && (
        <form action="/dashboard/vitrine" method="GET" className="mb-6">
          <div className="relative">
            <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
            <input
              name="search"
              type="text"
              placeholder="Buscar imóvel por bairro, tipo, nome..."
              className="w-full bg-card border border-border text-foreground placeholder-muted-foreground/40 pl-11 pr-32 py-3.5 rounded-2xl font-sans text-sm focus:outline-none focus:border-gold/40 transition-colors shadow-sm dark:shadow-none"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-gold text-graphite text-xs uppercase tracking-[0.15em] font-sans rounded-xl hover:bg-gold-light transition-colors"
            >
              Buscar
            </button>
          </div>
        </form>
      )}

      {/* ── KPI Hero — Imóveis Ativos ──────────────────────── */}
      <div className="bg-gradient-to-br from-gold/15 via-gold/5 to-transparent border border-gold/25 rounded-2xl p-6 mb-5 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-gold/8 rounded-full blur-2xl pointer-events-none" />
        <div className="relative">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 bg-gold/15 rounded-xl border border-gold/20">
              <Home size={20} className="text-gold" />
            </div>
            <Link href="/dashboard/vitrine"
              className="flex items-center gap-1 text-xs font-sans text-gold/60 hover:text-gold transition-colors">
              Ver base <ArrowRight size={10} />
            </Link>
          </div>
          <p className="font-serif text-5xl font-bold text-foreground mb-1">
            <NumberTicker value={myProperties ?? 0} suffix="" duration={1500} />
          </p>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-sans">
            Imóveis Ativos no Portfólio
          </p>
        </div>
      </div>

      {/* ── Nav 2×2 grid ───────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-7">
        {quickLinks.map((l) => {
          const Icon = l.icon
          return (
            <Link key={l.href} href={l.href}
              className="group bg-card border border-border rounded-2xl p-4 hover:border-gold/40 hover:shadow-md dark:hover:shadow-none transition-all duration-300 flex flex-col gap-3">
              <div className="p-2 bg-gold/10 rounded-xl w-fit">
                <Icon size={16} className="text-gold" />
              </div>
              <div>
                <p className="font-sans font-semibold text-foreground text-sm group-hover:text-gold transition-colors">{l.title}</p>
                <p className="text-muted-foreground text-[11px] mt-0.5 leading-snug">{l.desc}</p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* ── Construtoras em Destaque ───────────────────────── */}
      {construtorasList.length > 0 && (
        <div className="mb-7">
          {/* Header card */}
          <div className="bg-gradient-to-r from-gold/8 to-transparent border border-gold/20 rounded-2xl p-5 mb-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Building2 size={12} className="text-gold/70" />
                  <p className="text-[10px] uppercase tracking-[0.25em] text-gold/60 font-sans">Construtoras Parceiras</p>
                </div>
                <p className="font-serif text-foreground text-base font-semibold leading-tight">
                  Empreendimentos em Destaque
                </p>
                <p className="text-muted-foreground text-xs font-sans mt-1">
                  {construtorasList.length} construtora{construtorasList.length > 1 ? "s" : ""} com unidades disponíveis
                </p>
              </div>
              <div className="p-3 bg-gold/10 rounded-xl hidden sm:flex items-center justify-center">
                <Building2 size={22} className="text-gold/70" />
              </div>
            </div>
          </div>

          {/* Logo chip strip */}
          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {construtorasList.map((org) => {
              const accent = org.brand_colors?.primary ?? "#C4A052"
              return (
                <a
                  key={org.id}
                  href={`/construtora/${org.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 flex items-center gap-2.5 bg-card border border-border rounded-xl px-4 py-2.5 hover:border-gold/30 hover:shadow-sm dark:hover:shadow-none transition-all group"
                >
                  {org.logo ? (
                    <Image src={org.logo} alt={org.name} width={72} height={20} className="h-5 w-auto object-contain" />
                  ) : (
                    <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: accent + "20" }}>
                      <Building2 size={10} style={{ color: accent }} />
                    </div>
                  )}
                  <span className="text-foreground/70 text-sm font-sans group-hover:text-foreground transition-colors whitespace-nowrap">{org.name}</span>
                  <ExternalLink size={10} className="text-muted-foreground/30 group-hover:text-gold/50 transition-colors" />
                </a>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Unidades Recentes de Construtoras ─────────────── */}
      {constrRecentList.length > 0 && (
        <div className="mb-7">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={13} className="text-gold/60" />
              <p className="text-[10px] uppercase tracking-[0.25em] text-gold/60 font-sans">Unidades Recentes</p>
            </div>
            <Link href="/dashboard/vitrine" className="text-muted-foreground hover:text-gold text-xs font-sans transition-colors">
              Ver todas →
            </Link>
          </div>

          {/* Mobile: lista */}
          <div className="sm:hidden space-y-2.5">
            {constrRecentList.map((p) => (
              <a key={p.id} href={`/imovel/${p.slug}`} target="_blank" rel="noopener noreferrer"
                className="flex gap-3 p-3 bg-card border border-border rounded-xl hover:border-gold/20 transition-colors">
                <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                  {p.images?.[0]
                    ? <Image src={p.images[0]} alt={p.title} fill className="object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Home size={16} className="text-muted-foreground/30" /></div>
                  }
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <p className="font-serif text-foreground text-[14px] font-semibold leading-snug line-clamp-2">{p.title}</p>
                    {(p.neighborhood || p.city) && (
                      <p className="text-muted-foreground text-[11px] font-sans mt-0.5 flex items-center gap-1">
                        <MapPin size={9} />{p.neighborhood ?? p.city}
                      </p>
                    )}
                    <FeatureChips features={p.features} />
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-serif text-gold text-sm font-semibold">{formatPrice(p.price)}</span>
                    <StatusBadge status={p.status} />
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Desktop: grid */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {constrRecentList.map((p) => (
              <a key={p.id} href={`/imovel/${p.slug}`} target="_blank" rel="noopener noreferrer"
                className="group bg-card border border-border rounded-xl overflow-hidden hover:border-gold/20 hover:shadow-md dark:hover:shadow-none transition-all">
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {p.images?.[0]
                    ? <Image src={p.images[0]} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center"><Home size={20} className="text-muted-foreground/20" /></div>
                  }
                  <div className="absolute top-2 left-2">
                    <StatusBadge status={p.status} />
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-serif text-foreground text-sm font-semibold leading-tight line-clamp-1 mb-1">{p.title}</p>
                  {(p.neighborhood || p.city) && (
                    <p className="text-muted-foreground text-xs font-sans flex items-center gap-1 mb-1">
                      <MapPin size={9} />{p.neighborhood ?? p.city}
                    </p>
                  )}
                  <FeatureChips features={p.features} />
                  <p className="font-serif text-gold text-sm font-semibold mt-2">{formatPrice(p.price)}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── Recém Adicionados — corretor only ─────────────── */}
      {role === "corretor" && recentList.length > 0 && (
        <div className="mb-7">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-gold/60" />
              <p className="text-[10px] uppercase tracking-[0.25em] text-gold/60 font-sans">Recém Adicionados</p>
            </div>
            <Link href="/dashboard/vitrine" className="text-muted-foreground hover:text-gold text-xs font-sans transition-colors">
              Ver todos →
            </Link>
          </div>

          {/* Mobile: lista */}
          <div className="sm:hidden space-y-2.5">
            {recentList.map((p) => (
              <a key={p.id} href={`/imovel/${p.slug}`} target="_blank" rel="noopener noreferrer"
                className="flex gap-3 p-3 bg-card border border-border rounded-xl hover:border-gold/20 transition-colors">
                <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                  {p.images?.[0]
                    ? <Image src={p.images[0]} alt={p.title} fill className="object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Home size={16} className="text-muted-foreground/30" /></div>
                  }
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <p className="font-serif text-foreground text-[14px] font-semibold leading-snug line-clamp-2">{p.title}</p>
                    {(p.neighborhood || p.city) && (
                      <p className="text-muted-foreground text-[11px] font-sans mt-0.5 flex items-center gap-1">
                        <MapPin size={9} />{p.neighborhood ?? p.city}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-serif text-gold text-sm font-semibold">{formatPrice(p.price)}</span>
                    <StatusBadge status={p.status} />
                  </div>
                </div>
              </a>
            ))}
          </div>

          {/* Desktop: grid */}
          <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentList.map((p) => (
              <a key={p.id} href={`/imovel/${p.slug}`} target="_blank" rel="noopener noreferrer"
                className="group bg-card border border-border rounded-xl overflow-hidden hover:border-gold/20 hover:shadow-md dark:hover:shadow-none transition-all">
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {p.images?.[0]
                    ? <Image src={p.images[0]} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    : <div className="w-full h-full flex items-center justify-center"><Home size={20} className="text-muted-foreground/20" /></div>
                  }
                  <div className="absolute top-2 left-2">
                    <StatusBadge status={p.status} />
                  </div>
                </div>
                <div className="p-3">
                  <p className="font-serif text-foreground text-sm font-semibold leading-tight line-clamp-1 mb-1">{p.title}</p>
                  {(p.neighborhood || p.city) && (
                    <p className="text-muted-foreground text-xs font-sans flex items-center gap-1 mb-2">
                      <MapPin size={9} />{p.neighborhood ?? p.city}
                    </p>
                  )}
                  <p className="font-serif text-gold text-sm font-semibold">{formatPrice(p.price)}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* ── Minisite CTA ───────────────────────────────────── */}
      <div className="bg-card border border-gold/15 rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm dark:shadow-none">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gold/10"><Globe size={15} className="text-gold" /></div>
          <div>
            <p className="text-foreground/80 text-sm font-sans font-medium">Seu minisite está publicado</p>
            <p className="text-muted-foreground text-xs font-sans mt-0.5">
              {role === "corretor" ? `/corretor/${user.id}` : "Acesse via Meu Minisite"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/minisite"
            className="flex items-center gap-1.5 px-3 py-2 border border-border text-muted-foreground hover:text-gold hover:border-gold/30 text-xs uppercase tracking-wider font-sans transition-colors rounded-lg">
            <BookOpen size={11} /> Editar
          </Link>
          {role === "corretor" && (
            <a href={`/corretor/${user.id}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 bg-gold text-graphite hover:bg-gold-light text-xs uppercase tracking-wider font-sans transition-colors rounded-lg">
              <ExternalLink size={11} /> Ver Site
            </a>
          )}
        </div>
      </div>

    </div>
  )
}
