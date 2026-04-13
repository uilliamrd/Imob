"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Building2,
  Users,
  Link2,
  Settings,
  LogOut,
  Home,
  Globe,
  MapPin,
  Database,
  MessageSquare,
  BarChart3,
  ClipboardList,
  Flame,
  ExternalLink,
  BookOpen,
  Layers,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { UserRole } from "@/types/database"

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
  roles: UserRole[]
}

const NAV_ITEMS: NavItem[] = [
  // ── Todos
  { href: "/dashboard",                label: "Visão Geral",      icon: LayoutDashboard, roles: ["admin", "imobiliaria", "corretor", "construtora"] },

  // ── Admin
  { href: "/dashboard/imoveis",           label: "Imóveis",          icon: Home,      roles: ["admin"] },
  { href: "/dashboard/usuarios",          label: "Usuários",         icon: Users,     roles: ["admin"] },
  { href: "/dashboard/admin",             label: "Organizações",     icon: Building2, roles: ["admin"] },
  { href: "/dashboard/empreendimentos",   label: "Empreendimentos",  icon: Layers,    roles: ["admin"] },
  { href: "/dashboard/locais",            label: "Locais",           icon: MapPin,    roles: ["admin"] },
  { href: "/dashboard/datacenter",     label: "Data Center",      icon: Database,        roles: ["admin"] },
  { href: "/dashboard/configuracoes",  label: "Configurações",    icon: Settings,        roles: ["admin"] },

  // ── Imobiliária
  { href: "/dashboard/imoveis",        label: "Imóveis",          icon: Home,            roles: ["imobiliaria"] },
  { href: "/dashboard/vitrine",        label: "Base de Imóveis",  icon: Globe,           roles: ["imobiliaria"] },
  { href: "/dashboard/equipe",         label: "Minha Equipe",     icon: Users,           roles: ["imobiliaria"] },
  { href: "/dashboard/leads",          label: "Leads",            icon: MessageSquare,   roles: ["imobiliaria"] },
  { href: "/dashboard/organizacao",    label: "Branding",         icon: Building2,       roles: ["imobiliaria"] },
  { href: "/dashboard/configuracoes",  label: "Configurações",    icon: Settings,        roles: ["imobiliaria"] },

  // ── Corretor
  { href: "/dashboard/imoveis",        label: "Imóveis",          icon: Home,            roles: ["corretor"] },
  { href: "/dashboard/vitrine",        label: "Base de Imóveis",  icon: Globe,           roles: ["corretor"] },
  { href: "/dashboard/corretor",       label: "Meus Links",       icon: Link2,           roles: ["corretor"] },
  { href: "/dashboard/selecoes",       label: "Seleções",         icon: BookOpen,        roles: ["corretor"] },
  { href: "/dashboard/leads",          label: "Leads",            icon: MessageSquare,   roles: ["corretor"] },
  { href: "/dashboard/organizacao",    label: "Branding",         icon: Building2,       roles: ["corretor"] },
  { href: "/dashboard/configuracoes",  label: "Configurações",    icon: Settings,        roles: ["corretor"] },

  // ── Construtora
  { href: "/dashboard/imoveis",        label: "Imóveis",          icon: Home,            roles: ["construtora"] },
  { href: "/dashboard/lancamentos",    label: "Lançamentos",      icon: Flame,           roles: ["construtora"] },
  { href: "/dashboard/disponibilidade",label: "Disponibilidade",  icon: ClipboardList,   roles: ["construtora"] },
  { href: "/dashboard/analytics",      label: "Analytics",        icon: BarChart3,       roles: ["construtora"] },
  { href: "/dashboard/organizacao",    label: "Branding",         icon: Building2,       roles: ["construtora"] },
  { href: "/dashboard/configuracoes",  label: "Configurações",    icon: Settings,        roles: ["construtora"] },
]

interface SidebarProps {
  role: UserRole
  userName: string
  userAvatar?: string | null
  orgSlug?: string | null
  userId?: string
}

export function Sidebar({ role, userName, userAvatar, orgSlug, userId }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role))

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const roleLabels: Record<UserRole, string> = {
    admin: "Administrador",
    imobiliaria: "Imobiliária",
    corretor: "Corretor",
    construtora: "Construtora",
  }

  // "Ver meu site" link per role
  const minisiteHref =
    role === "construtora" && orgSlug ? `/construtora/${orgSlug}` :
    role === "imobiliaria" && orgSlug ? `/imobiliaria/${orgSlug}` :
    role === "corretor" && userId     ? `/corretor/${userId}` :
    null

  return (
    <aside className="w-64 min-h-screen bg-[#111111] border-r border-white/5 flex flex-col">
      {/* Brand */}
      <div className="px-6 py-8 border-b border-white/5">
        <p className="text-[10px] uppercase tracking-[0.4em] text-gold/50 font-sans mb-1">
          RealState
        </p>
        <h2 className="font-serif text-xl font-bold text-white">Intelligence</h2>
      </div>

      {/* User info */}
      <div className="px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          {userAvatar ? (
            <img src={userAvatar} alt={userName} className="w-9 h-9 rounded-full object-cover border border-gold/20" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-gold/20 flex items-center justify-center border border-gold/30">
              <span className="text-gold font-serif font-bold text-sm">
                {userName[0]?.toUpperCase()}
              </span>
            </div>
          )}
          <div className="overflow-hidden">
            <p className="text-white/90 text-sm font-sans font-medium truncate">{userName}</p>
            <p className="text-gold/60 text-[10px] uppercase tracking-wider">{roleLabels[role]}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link key={item.href + item.roles[0]} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                transition={{ duration: 0.15 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative group ${
                  isActive
                    ? "bg-gold/15 text-gold"
                    : "text-white/40 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-gold rounded-r-full" />
                )}
                <Icon size={16} />
                <span className="text-sm font-sans">{item.label}</span>
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Ver meu site */}
      {minisiteHref && (
        <div className="px-3 pb-3">
          <a href={minisiteHref} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-gold/20 text-gold/70 hover:text-gold hover:border-gold/50 hover:bg-gold/5 transition-colors w-full text-sm font-sans">
            <ExternalLink size={16} />
            Ver Meu Site
          </a>
        </div>
      )}

      {/* Sign out */}
      <div className="px-3 pb-6">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-900/10 transition-colors w-full text-sm font-sans"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  )
}
