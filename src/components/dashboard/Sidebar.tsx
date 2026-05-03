"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, Building2, Users, Link2, Settings, LogOut, Home, Globe,
  MapPin, Database, MessageSquare, BarChart3, ClipboardList, Flame,
  ExternalLink, BookOpen, Layers, ListChecks, RotateCcw, Megaphone,
  Inbox, CreditCard, ChevronLeft, ChevronRight,
  Send, UserCheck, Lock, Calendar, BarChart2, Star, Search,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { ThemeSwitch } from "@/components/ThemeSwitch"
import { PlanBadge } from "@/components/dashboard/PlanBadge"
import { UpgradeCard } from "@/components/dashboard/UpgradeCard"
import { transitions } from "@/lib/design-system/motion"
import type { UserRole, OrgPlan, OrgType } from "@/types/database"

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  roles: UserRole[]
}

interface LockedItem {
  label: string
  icon: React.ElementType
}

const NAV_ITEMS: NavItem[] = [
  // ── Visão Geral / Buscar Imóveis ────────────────────────────────────────
  { href: "/dashboard",                  label: "Visão Geral",      icon: LayoutDashboard, roles: ["admin", "construtora"] },
  { href: "/dashboard",                  label: "Base de Imóveis",  icon: Search,          roles: ["imobiliaria", "corretor"] },
  // ── Admin ────────────────────────────────────────────────────────────────
  { href: "/dashboard/imoveis",          label: "Imóveis",          icon: Home,            roles: ["admin"] },
  { href: "/dashboard/usuarios",         label: "Usuários",         icon: Users,           roles: ["admin"] },
  { href: "/dashboard/planos",           label: "Planos",           icon: Layers,          roles: ["admin"] },
  { href: "/dashboard/imobiliarias",     label: "Imobiliárias",     icon: Building2,       roles: ["admin"] },
  { href: "/dashboard/construtoras",     label: "Construtoras",     icon: Building2,       roles: ["admin"] },
  { href: "/dashboard/empreendimentos",  label: "Empreendimentos",  icon: Layers,          roles: ["admin"] },
  { href: "/dashboard/locais",           label: "Locais",           icon: MapPin,          roles: ["admin", "construtora"] },
  { href: "/dashboard/anuncios",         label: "Anúncios",         icon: Megaphone,       roles: ["admin"] },
  { href: "/dashboard/submissoes",       label: "Submissões",       icon: Inbox,           roles: ["admin"] },
  { href: "/dashboard/mercado",          label: "Mercado",          icon: BarChart3,       roles: ["admin"] },
  { href: "/dashboard/financeiro",       label: "Financeiro",       icon: CreditCard,      roles: ["admin"] },
  { href: "/dashboard/assinaturas",      label: "Assinaturas",      icon: CreditCard,      roles: ["admin"] },
  { href: "/dashboard/datacenter",       label: "Data Center",      icon: Database,        roles: ["admin"] },
  { href: "/dashboard/configuracoes",    label: "Configurações",    icon: Settings,        roles: ["admin"] },
  // ── Imobiliária — Etapa 1 ────────────────────────────────────────────────
  { href: "/dashboard/vitrine",          label: "Imóveis",          icon: Building2,       roles: ["imobiliaria"] },
  { href: "/dashboard/anuncios",         label: "Disparar Anúncios",icon: Send,            roles: ["imobiliaria"] },
  { href: "/dashboard/equipe",           label: "Corretores",       icon: Users,           roles: ["imobiliaria"] },
  { href: "/dashboard/leads",            label: "Leads",            icon: UserCheck,       roles: ["imobiliaria"] },
  { href: "/dashboard/minisite",         label: "Meu Minisite",     icon: Globe,           roles: ["imobiliaria"] },
  // ── Corretor — Etapa 1 ───────────────────────────────────────────────────
  { href: "/dashboard/vitrine",          label: "Meus Imóveis",     icon: Home,            roles: ["corretor"] },
  { href: "/dashboard/anuncios",         label: "Disparar Anúncios",icon: Send,            roles: ["corretor"] },
  { href: "/dashboard/leads",            label: "Meus Leads",       icon: Users,           roles: ["corretor"] },
  { href: "/dashboard/minisite",         label: "Meu Minisite",     icon: Globe,           roles: ["corretor"] },
  // ── Construtora ──────────────────────────────────────────────────────────
  { href: "/dashboard/imoveis",          label: "Imóveis",          icon: Home,            roles: ["construtora"] },
  { href: "/dashboard/lancamentos",      label: "Lançamentos",      icon: Flame,           roles: ["construtora"] },
  { href: "/dashboard/disponibilidade",  label: "Disponibilidade",  icon: ClipboardList,   roles: ["construtora"] },
  { href: "/dashboard/analytics",        label: "Analytics",        icon: BarChart3,       roles: ["construtora"] },
  { href: "/dashboard/mercado",          label: "Mercado",          icon: BarChart3,       roles: ["construtora"] },
  { href: "/dashboard/minisite",         label: "Meu Site",         icon: ExternalLink,    roles: ["construtora"] },
  { href: "/dashboard/configuracoes",    label: "Configurações",    icon: Settings,        roles: ["construtora"] },
  // ── Secretária ───────────────────────────────────────────────────────────
  { href: "/dashboard/imoveis",          label: "Imóveis",          icon: Home,            roles: ["secretaria"] },
  { href: "/dashboard/leads",            label: "Leads",            icon: MessageSquare,   roles: ["secretaria"] },
  { href: "/dashboard/mercado",          label: "Mercado",          icon: BarChart3,       roles: ["secretaria"] },
  { href: "/dashboard/minisite",         label: "Meu Site",         icon: ExternalLink,    roles: ["secretaria"] },
  { href: "/dashboard/configuracoes",    label: "Configurações",    icon: Settings,        roles: ["secretaria"] },
]

// Itens bloqueados removidos — corretor/imobiliária não têm restrições de menu
const LOCKED_ITEMS: Partial<Record<UserRole, LockedItem[]>> = {}

// Texto de upgrade customizado por role
const ROLE_UPGRADE: Partial<Record<UserRole, { title: string; features: string[]; nextPlan: string }>> = {
  corretor: {
    title: "Desbloqueie agenda, relatórios e mais",
    nextPlan: "Corretor Pro",
    features: ["Agenda de atendimentos", "Relatórios de performance", "Avaliações de clientes"],
  },
  imobiliaria: {
    title: "Desbloqueie vitrine pública e mais",
    nextPlan: "Imobiliária Pro",
    features: ["Vitrine pública de imóveis", "Relatórios avançados", "Captação de leads online"],
  },
}

const UPGRADE_FEATURES: Record<OrgPlan, string[]> = {
  free:       ["Leads ilimitados", "Anúncios em destaque", "Analytics avançado"],
  starter:    ["Anúncios em destaque", "Analytics avançado", "Suporte prioritário"],
  pro:        ["Analytics avançado", "Suporte prioritário", "API de integração"],
  enterprise: [],
}

const NEXT_PLAN: Record<OrgPlan, string | null> = {
  free:       "Starter",
  starter:    "Pro",
  pro:        "Enterprise",
  enterprise: null,
}

interface SidebarProps {
  role: UserRole
  userName: string
  userAvatar?: string | null
  orgSlug?: string | null
  userId?: string
  plan?: OrgPlan
  orgType?: OrgType | null
}

export function Sidebar({ role, userName, userAvatar, orgSlug, userId, plan = "free", orgType }: SidebarProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role))
  const lockedItems  = LOCKED_ITEMS[role] ?? []
  const roleUpgrade  = ROLE_UPGRADE[role]
  const nextPlan     = roleUpgrade?.nextPlan ?? NEXT_PLAN[plan]
  const upgradeFeatures = roleUpgrade?.features ?? UPGRADE_FEATURES[plan]
  const showUpgrade  = nextPlan !== null

  const roleLabels: Record<UserRole, string> = {
    admin:      "Administrador",
    imobiliaria:"Imobiliária",
    corretor:   "Corretor",
    construtora:"Construtora",
    secretaria: "Secretária",
  }

  const minisiteHref =
    role === "construtora" && orgSlug ? `/construtora/${orgSlug}` :
    role === "imobiliaria" && orgSlug ? `/imobiliaria/${orgSlug}` :
    role === "corretor"    && userId   ? `/corretor/${userId}` :
    null

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={transitions.smooth}
      className="hidden lg:flex min-h-screen bg-sidebar border-r border-sidebar-border flex-col overflow-hidden shrink-0"
    >
      {/* Brand + toggle */}
      <div className="relative flex items-center px-4 py-5 border-b border-sidebar-border/60 shrink-0">
        <AnimatePresence mode="wait" initial={false}>
          {collapsed ? (
            <motion.div
              key="collapsed-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold-dark)] flex items-center justify-center mx-auto"
            >
              <span className="text-[#0F0F0F] font-serif font-bold text-sm">BI</span>
            </motion.div>
          ) : (
            <motion.div
              key="expanded-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-baseline gap-0"
            >
              <span className="font-serif text-[17px] font-bold text-sidebar-foreground">Base</span>
              <span className="font-serif text-[17px] font-bold text-[var(--gold)]">Imob</span>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setCollapsed((v) => !v)}
          className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-card border border-border shadow-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/40 transition-colors z-10"
          aria-label={collapsed ? "Expandir sidebar" : "Colapsar sidebar"}
        >
          {collapsed
            ? <ChevronRight size={12} strokeWidth={2} />
            : <ChevronLeft size={12} strokeWidth={2} />}
        </button>
      </div>

      {/* User info */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mx-3 mt-3 mb-1 px-3 py-3 rounded-2xl bg-sidebar-accent/40 border border-sidebar-border/40">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  {userAvatar ? (
                    <Image src={userAvatar} alt={userName} width={36} height={36} className="w-9 h-9 rounded-xl object-cover" />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--gold)]/30 to-[var(--gold)]/10 border border-[var(--gold)]/30 flex items-center justify-center">
                      <span className="text-[var(--gold)] font-serif font-bold text-sm">{userName[0]?.toUpperCase()}</span>
                    </div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-sidebar" />
                </div>
                <div className="overflow-hidden flex-1 min-w-0">
                  <p className="text-sidebar-foreground/90 text-[13px] font-sans font-medium truncate">{userName}</p>
                  <p className="text-[var(--gold)]/50 text-[9px] uppercase tracking-[0.15em] font-sans">{roleLabels[role]}</p>
                </div>
              </div>
              <div className="mt-2.5">
                <PlanBadge role={role} plan={plan} orgType={orgType} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed avatar */}
      {collapsed && (
        <div className="flex justify-center py-3 shrink-0">
          {userAvatar ? (
            <Image src={userAvatar} alt={userName} width={32} height={32} className="w-8 h-8 rounded-xl object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--gold)]/30 to-[var(--gold)]/10 border border-[var(--gold)]/30 flex items-center justify-center">
              <span className="text-[var(--gold)] font-serif font-bold text-xs">{userName[0]?.toUpperCase()}</span>
            </div>
          )}
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link
              key={item.href + item.roles[0]}
              href={item.href}
              title={collapsed ? item.label : undefined}
            >
              <motion.div
                whileHover={{ x: collapsed ? 0 : 3 }}
                transition={{ duration: 0.12 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 relative group ${
                  isActive
                    ? "bg-gradient-to-r from-[var(--gold)]/20 to-[var(--gold)]/5 text-[var(--gold)]"
                    : "text-sidebar-foreground/40 hover:text-sidebar-foreground/80 hover:bg-sidebar-accent/60"
                } ${collapsed ? "justify-center" : ""}`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[var(--gold)] rounded-r-full" />
                )}
                <Icon size={15} className={`shrink-0 ${isActive ? "text-[var(--gold)]" : ""}`} />
                {!collapsed && (
                  <span className={`text-[13px] font-sans truncate ${isActive ? "font-medium" : ""}`}>
                    {item.label}
                  </span>
                )}
              </motion.div>
            </Link>
          )
        })}

        {/* Itens bloqueados */}
        {lockedItems.length > 0 && !collapsed && (
          <div className="pt-2 mt-2 border-t border-sidebar-border/30">
            {lockedItems.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  title="Em breve"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sidebar-foreground/20 cursor-not-allowed select-none"
                >
                  <Icon size={15} className="shrink-0" />
                  <span className="text-[13px] font-sans truncate flex-1">{item.label}</span>
                  <div className="flex items-center gap-1">
                    <Lock size={10} className="text-sidebar-foreground/20" />
                    <span className="text-[9px] uppercase tracking-wider font-sans text-[var(--gold)]/50 bg-[var(--gold)]/8 px-1.5 py-0.5 rounded-full border border-[var(--gold)]/15">
                      Em breve
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Itens bloqueados — estado colapsado (só ícone + lock) */}
        {lockedItems.length > 0 && collapsed && (
          <div className="pt-2 mt-2 border-t border-sidebar-border/30 space-y-0.5">
            {lockedItems.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.label}
                  title={`${item.label} — Em breve`}
                  className="flex items-center justify-center px-3 py-2.5 rounded-xl text-sidebar-foreground/20 cursor-not-allowed relative"
                >
                  <Icon size={15} />
                  <Lock size={8} className="absolute bottom-1.5 right-1.5 text-[var(--gold)]/40" />
                </div>
              )
            })}
          </div>
        )}
      </nav>

      {/* Ver meu site */}
      {minisiteHref && !collapsed && (
        <div className="px-2 pb-1">
          <a
            href={minisiteHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-[var(--gold)]/20 text-[var(--gold)]/60 hover:text-[var(--gold)] hover:border-[var(--gold)]/40 hover:bg-[var(--gold)]/5 transition-all duration-200 w-full text-[13px] font-sans"
          >
            <ExternalLink size={15} />
            Ver Meu Site
          </a>
        </div>
      )}

      {/* Upgrade card — apenas para admin/construtora */}
      {showUpgrade && !collapsed && role !== "corretor" && role !== "imobiliaria" && (
        <div className="px-2 pb-2">
          <UpgradeCard
            currentPlan={plan}
            nextPlan={nextPlan!}
            features={upgradeFeatures}
          />
        </div>
      )}

      {/* Footer */}
      <div className={`px-2 pb-4 flex ${collapsed ? "flex-col items-center gap-2" : "items-center gap-1"} shrink-0 border-t border-sidebar-border/40 pt-3`}>
        <ThemeSwitch />
        <Link
          href="/dashboard/configuracoes"
          title={collapsed ? "Configurações" : undefined}
          className="flex items-center justify-center p-2 rounded-lg text-sidebar-foreground/30 hover:text-sidebar-foreground/70 hover:bg-sidebar-accent/60 transition-colors"
        >
          <Settings size={15} />
        </Link>
        <button
          onClick={handleSignOut}
          title={collapsed ? "Sair" : undefined}
          className={`flex items-center gap-2 px-2 py-2 rounded-lg text-sidebar-foreground/25 hover:text-red-400 hover:bg-red-500/8 transition-all duration-200 font-sans ${collapsed ? "" : "flex-1 text-[13px]"}`}
        >
          <LogOut size={15} className="shrink-0" />
          {!collapsed && "Sair"}
        </button>
      </div>
    </motion.aside>
  )
}
