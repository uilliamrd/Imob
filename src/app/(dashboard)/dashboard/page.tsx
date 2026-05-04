import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import Image from "next/image"
import { redirect } from "next/navigation"
import { NumberTicker } from "@/components/magicui/number-ticker"
import {
  Home, TrendingUp, Link2, DollarSign, ArrowRight,
  BookOpen, ExternalLink, Globe,
  Building2, Clock, MapPin,
  Users, MessageSquare, BedDouble, Car, Maximize2,
  ListChecks, Zap, CheckCircle2, Circle, Flame,
  BarChart3, CreditCard,
} from "lucide-react"
import Link from "next/link"
import { PlanUsage } from "@/components/dashboard/PlanUsage"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { ActivityFeed } from "@/components/dashboard/ActivityFeed"
import { BuilderProjectCard } from "@/components/dashboard/BuilderProjectCard"
import { BuscarImoveisClient } from "@/components/dashboard/BuscarImoveisClient"
import type { BuscarProperty, BuscarConstrutora } from "@/components/dashboard/BuscarImoveisClient"
import type { UserRole, OrgPlan, OrgType, Organization, Property, PropertyFeatures } from "@/types/database"

// ── Helpers ──────────────────────────────────────────────────────
function formatPrice(price: number) {
  if (price >= 1_000_000)
    return `R$ ${(price / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 })} Mi`
  return `R$ ${price.toLocaleString("pt-BR")}`
}

function formatVGV(value: number) {
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000)     return `R$ ${(value / 1_000).toFixed(0)}K`
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

// ── Command Center ────────────────────────────────────────────────
function CommandCenter({ items }: { items: { done?: boolean; label: string; href: string }[] }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-gold/10 border border-gold/15">
          <Zap size={13} className="text-gold" />
        </div>
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-sans">Hoje você precisa</p>
      </div>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <Link key={i} href={item.href}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-colors group"
          >
            {item.done
              ? <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
              : <Circle size={14} className="text-muted-foreground/30 flex-shrink-0 group-hover:text-gold/50 transition-colors" />
            }
            <span className={`text-[12px] font-sans flex-1 leading-tight ${item.done ? "line-through text-muted-foreground/40" : "text-foreground/80 group-hover:text-foreground"} transition-colors`}>
              {item.label}
            </span>
            <ArrowRight size={11} className="text-muted-foreground/20 group-hover:text-gold/50 transition-colors flex-shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}

// ── Quick link card ───────────────────────────────────────────────
function QuickLink({ href, title, desc, icon: Icon }: { href: string; title: string; desc: string; icon: React.ElementType }) {
  return (
    <Link href={href}
      className="group bg-card border border-border rounded-2xl p-4 hover:border-gold/30 hover:shadow-md dark:hover:shadow-none transition-all duration-300 flex flex-col gap-3"
    >
      <div className="p-2 bg-gold/10 rounded-xl w-fit border border-gold/10">
        <Icon size={15} className="text-gold" />
      </div>
      <div>
        <p className="font-sans font-semibold text-foreground text-[13px] group-hover:text-gold transition-colors leading-tight">{title}</p>
        <p className="text-muted-foreground text-[11px] mt-0.5 leading-snug font-sans">{desc}</p>
      </div>
    </Link>
  )
}

// ── Property mini card ────────────────────────────────────────────
type RecentProp = { id: string; title: string; slug: string; price: number; neighborhood: string | null; city: string | null; images: string[] | null; status: string }
function PropertyCard({ p }: { p: RecentProp & { features?: PropertyFeatures } }) {
  return (
    <a href={`/imovel/${p.slug}`} target="_blank" rel="noopener noreferrer"
      className="group bg-card border border-border rounded-xl overflow-hidden hover:border-gold/20 hover:shadow-md dark:hover:shadow-none transition-all"
    >
      <div className="aspect-video bg-muted relative overflow-hidden">
        {p.images?.[0]
          ? <Image src={p.images[0]} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center"><Home size={18} className="text-muted-foreground/20" /></div>
        }
        <div className="absolute top-2 left-2"><StatusBadge status={p.status} /></div>
      </div>
      <div className="p-3">
        <p className="font-serif text-foreground text-[13px] font-semibold leading-tight line-clamp-1 mb-0.5">{p.title}</p>
        {(p.neighborhood || p.city) && (
          <p className="text-muted-foreground text-[10px] font-sans flex items-center gap-1 mb-1.5">
            <MapPin size={8} />{p.neighborhood ?? p.city}
          </p>
        )}
        {p.features && <FeatureChips features={p.features} />}
        <p className="font-serif text-gold text-[13px] font-semibold mt-2">{formatPrice(p.price)}</p>
      </div>
    </a>
  )
}

// ═══════════════════════════════════════════════════════════════════
export default async function DashboardPage() {
  const supabase    = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from("profiles")
    .select("full_name, role, organization_id, whatsapp, creci")
    .eq("id", user.id)
    .single()

  const role = (profile?.role as UserRole) ?? "corretor"

  let profilePlan: OrgPlan = "free"
  if (role !== "admin") {
    const { data: planRow } = await adminClient
      .from("profiles").select("plan").eq("id", user.id).single()
    profilePlan = ((planRow as { plan?: string } | null)?.plan ?? "free") as OrgPlan
  }

  const firstName = (profile?.full_name ?? user.email ?? "Usuário").split(" ")[0]

  // ─────────────────────────────────────────────────────────────────
  // Admin / Construtora
  // ─────────────────────────────────────────────────────────────────
  if (role === "admin" || role === "construtora") {
    const now        = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const constrOrgId = role === "construtora" ? (profile?.organization_id ?? null) : null

    const baseQ  = adminClient.from("properties")
    const totalQ = constrOrgId
      ? baseQ.select("*", { count: "exact", head: true }).eq("org_id", constrOrgId)
      : baseQ.select("*", { count: "exact", head: true })
    const availQ = constrOrgId
      ? adminClient.from("properties").select("*", { count: "exact", head: true }).eq("org_id", constrOrgId).eq("status", "disponivel")
      : adminClient.from("properties").select("*", { count: "exact", head: true }).eq("status", "disponivel")
    const soldQ = constrOrgId
      ? adminClient.from("properties").select("price").eq("org_id", constrOrgId).eq("status", "vendido").gte("updated_at", monthStart)
      : adminClient.from("properties").select("price").eq("status", "vendido").gte("updated_at", monthStart)
    const devQ = constrOrgId
      ? adminClient.from("developments").select("*", { count: "exact", head: true }).eq("org_id", constrOrgId)
      : { count: 0 }

    const [
      { count: totalProperties },
      { count: availableProperties },
      { data: soldThisMonth },
      { count: devCount },
    ] = await Promise.all([totalQ, availQ, soldQ, devQ])

    // Developments for BuilderProjectCard (construtora only, max 6)
    type DevRow = { id: string; name: string; cover_image: string | null; neighborhood: string | null; city: string | null; is_delivered: boolean; is_lancamento: boolean }
    let devProjects: DevRow[] = []
    if (constrOrgId) {
      const { data: devData } = await adminClient
        .from("developments")
        .select("id, name, cover_image, neighborhood, city, is_delivered, is_lancamento")
        .eq("org_id", constrOrgId)
        .order("created_at", { ascending: false })
        .limit(6)
      devProjects = (devData ?? []) as DevRow[]
    }

    // Unit stats per development
    type UnitStat = { development_id: string; status: string }
    let unitStats: UnitStat[] = []
    if (devProjects.length > 0) {
      const devIds = devProjects.map((d) => d.id)
      const { data: us } = await adminClient
        .from("properties")
        .select("development_id, status")
        .in("development_id", devIds)
        .not("development_id", "is", null)
      unitStats = (us ?? []) as UnitStat[]
    }

    function getDevStats(devId: string) {
      const units = unitStats.filter((u) => u.development_id === devId)
      const total     = units.length
      const available = units.filter((u) => u.status === "disponivel").length
      const sold      = units.filter((u) => u.status === "vendido").length
      const percentSold = total > 0 ? Math.round((sold / total) * 100) : 0
      return { percentSold, availableUnits: available }
    }

    const vgvMes = (soldThisMonth ?? []).reduce((sum, p) => sum + (p.price ?? 0), 0)

    const isAdmin = role === "admin"
    const heroTitle = isAdmin ? "Centro de Comando" : "Performance Comercial"
    const heroSub   = isAdmin
      ? "Visão consolidada de toda a plataforma."
      : "Acompanhe suas unidades, vendas e lançamentos."

    const quickLinks = isAdmin
      ? [
          { href: "/dashboard/imoveis/novo",  title: "Cadastrar Imóvel",  desc: "Novo imóvel ao portfólio",     icon: Home      },
          { href: "/dashboard/usuarios",       title: "Usuários",          desc: "Gerenciar e cadastrar",        icon: Users     },
          { href: "/dashboard/imobiliarias",   title: "Imobiliárias",      desc: "Organizações cadastradas",     icon: Building2 },
          { href: "/dashboard/financeiro",     title: "Financeiro",        desc: "Receitas e assinaturas",       icon: CreditCard },
        ]
      : [
          { href: "/dashboard/imoveis/novo",   title: "Cadastrar Imóvel",  desc: "Novo imóvel ao portfólio",     icon: Home       },
          { href: "/dashboard/imoveis",        title: "Ver Imóveis",       desc: "Todos os imóveis",             icon: Building2  },
          { href: "/dashboard/lancamentos",    title: "Lançamentos",       desc: "Empreendimentos em destaque",  icon: Flame      },
          { href: "/dashboard/analytics",      title: "Analytics",         desc: "Performance e métricas",       icon: BarChart3  },
        ]

    const commandItems = [
      { label: "Revisar imóveis sem foto",        href: "/dashboard/imoveis"   },
      { label: "Verificar leads sem resposta",     href: "/dashboard/leads"     },
      { label: "Atualizar status de unidades",     href: "/dashboard/disponibilidade" },
      { label: "Publicar novos anúncios",          href: "/dashboard/anuncios"  },
    ]

    return (
      <div className="px-6 py-8 lg:px-8 max-w-7xl space-y-8">

        {/* ── Page header ───────────────────────────────── */}
        <PageHeader
          title={heroTitle}
          subtitle={heroSub}
          category={isAdmin ? "Admin" : "Construtora"}
          actions={
            <Link href={isAdmin ? "/dashboard/imoveis/novo" : "/dashboard/lancamentos"}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--gold)] text-[#0F0F0F] hover:bg-[var(--gold-light)] text-[11px] uppercase tracking-[0.15em] font-sans rounded-xl transition-all duration-200 shadow-md shadow-[var(--gold)]/20 font-medium"
            >
              <Zap size={12} />
              {isAdmin ? "Novo imóvel" : "Ver lançamentos"}
            </Link>
          }
        />

        {/* ── 4 KPI cards ───────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Imóveis Cadastrados"  value={totalProperties ?? 0}     icon={Home}       iconColor="muted"   />
          <StatsCard title="Unidades Disponíveis" value={availableProperties ?? 0} icon={TrendingUp} iconColor="forest"  />
          <StatsCard title="VGV do Mês"           value={formatVGV(vgvMes)}        icon={DollarSign} iconColor="gold"    />
          <StatsCard title="Lançamentos"          value={devCount ?? 0}            icon={Building2}  iconColor="muted"   />
        </div>

        {/* ── Editorial row: quick links + command center ── */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 grid grid-cols-2 gap-3">
            {quickLinks.map((l) => (
              <QuickLink key={l.href} {...l} />
            ))}
          </div>
          <CommandCenter items={commandItems} />
        </div>

        {/* ── Empreendimentos — construtora only ───────── */}
        {role === "construtora" && devProjects.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Flame size={13} className="text-gold/60" />
                <p className="text-[10px] uppercase tracking-[0.25em] text-gold/60 font-sans">Meus Empreendimentos</p>
              </div>
              <Link href="/dashboard/lancamentos" className="text-muted-foreground hover:text-gold text-[11px] font-sans transition-colors">
                Ver todos →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {devProjects.map((dev) => {
                const { percentSold, availableUnits } = getDevStats(dev.id)
                const status = dev.is_delivered ? "pronto" : dev.is_lancamento ? "lancamento" : "em_obras"
                return (
                  <BuilderProjectCard
                    key={dev.id}
                    name={dev.name}
                    image={dev.cover_image}
                    location={[dev.neighborhood, dev.city].filter(Boolean).join(", ") || null}
                    percentSold={percentSold}
                    availableUnits={availableUnits}
                    status={status as "em_obras" | "pronto" | "lancamento"}
                    href={`/dashboard/lancamentos`}
                  />
                )
              })}
            </div>
          </div>
        )}

        {/* ── Plan usage ────────────────────────────────── */}
        {role === "construtora" && (
          <PlanUsage
            role={role}
            plan={profilePlan}
            orgType={"construtora" as OrgType}
            counts={{ properties: totalProperties ?? 0, developments: devCount ?? 0, corretores: 0 }}
          />
        )}
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────
  // Imobiliária / Corretor / Secretária
  // ─────────────────────────────────────────────────────────────────
  const orgId = profile?.organization_id ?? null

  type LeadRow = { id: string; name: string | null; source: string | null; created_at: string; property: { title: string } | null }

  const [
    { count: myProperties },
    { count: catalogCount },
    { data: construtoras },
    { data: allPublicProperties },
    { data: recentLeads },
    { count: equipeCount },
  ] = await Promise.all([
    adminClient.from("properties").select("*", { count: "exact", head: true }).eq("created_by", user.id),
    supabase.from("property_listings").select("*", { count: "exact", head: true })
      .eq(role === "imobiliaria" ? "org_id" : "user_id", role === "imobiliaria" ? (orgId ?? "") : user.id),
    adminClient.from("organizations").select("id, name, slug, logo, brand_colors")
      .eq("type", "construtora").not("slug", "is", null),
    // Todos os imóveis públicos com join de organização (reutiliza padrão da vitrine)
    adminClient.from("properties")
      .select("id, code, title, slug, price, neighborhood, city, images, status, org_id, features, tipo_negocio, tags, categoria, development_id, development:developments(id, name), organization:organizations(id, name, slug, logo, brand_colors)")
      .eq("visibility", "publico")
      .order("created_at", { ascending: false }),
    adminClient
      .from("leads")
      .select("id, name, source, created_at, property:properties(title)")
      .eq(role === "imobiliaria" && orgId ? "org_id" : "corretor_id", role === "imobiliaria" && orgId ? orgId : user.id)
      .order("created_at", { ascending: false })
      .limit(5) as unknown as Promise<{ data: LeadRow[] | null }>,
    role === "imobiliaria" && orgId
      ? adminClient.from("profiles").select("*", { count: "exact", head: true })
          .eq("organization_id", orgId).eq("role", "corretor")
      : Promise.resolve({ count: 0 }),
  ])

  const construtorasList  = (construtoras ?? []) as BuscarConstrutora[]
  const propertiesForGrid = (allPublicProperties ?? []).map((p) => ({
    ...p,
    organization: Array.isArray(p.organization) ? (p.organization[0] ?? null) : p.organization,
  })) as unknown as BuscarProperty[]

  return (
    <div className="px-6 py-8 lg:px-8 max-w-7xl space-y-8">

      {/* ── Buscar Imóveis ────────────────────────────── */}
      <BuscarImoveisClient
        properties={propertiesForGrid}
        construtoras={construtorasList}
        role={role as "corretor" | "imobiliaria"}
        userName={firstName}
      />

      {/* ── Minisite CTA ──────────────────────────────── */}
      <div className="bg-gradient-to-r from-card to-muted/30 border border-border/60 rounded-2xl p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gold/10 border border-gold/15">
            <Globe size={15} className="text-gold" />
          </div>
          <div>
            <p className="text-foreground/80 text-[13px] font-sans font-semibold">Seu minisite está publicado</p>
            <p className="text-muted-foreground text-[11px] font-sans mt-0.5">
              {role === "corretor" ? `/corretor/${user.id}` : "Acesse via Meu Minisite"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/minisite"
            className="flex items-center gap-1.5 px-3 py-2 border border-border text-muted-foreground hover:text-gold hover:border-gold/30 text-[11px] uppercase tracking-wider font-sans transition-colors rounded-xl">
            <BookOpen size={11} /> Editar
          </Link>
          {role === "corretor" && (
            <a href={`/corretor/${user.id}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 bg-gold text-[#0F0F0F] hover:bg-gold-light text-[11px] uppercase tracking-wider font-sans transition-colors rounded-xl">
              <ExternalLink size={11} /> Ver Site
            </a>
          )}
        </div>
      </div>

      {/* ── Atividade Recente ─────────────────────────── */}
      {recentLeads && recentLeads.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare size={13} className="text-gold/60" />
              <p className="text-[10px] uppercase tracking-[0.25em] text-gold/60 font-sans">Atividade Recente</p>
            </div>
            <Link href="/dashboard/leads" className="text-muted-foreground hover:text-gold text-[11px] font-sans transition-colors">
              Ver todos →
            </Link>
          </div>
          <div className="bg-card border border-border rounded-2xl px-4 py-3">
            <ActivityFeed
              items={recentLeads.map((lead) => ({
                id:          lead.id,
                icon:        MessageSquare,
                iconColor:   "var(--gold)",
                title:       lead.name ? `Lead de ${lead.name}` : "Novo lead",
                description: lead.property?.title ?? undefined,
                time:        new Date(lead.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
                read:        false,
              }))}
            />
          </div>
        </div>
      )}

    </div>
  )
}
