"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, Globe, MessageSquare, ExternalLink, Home,
  Flame, BarChart3, Users, Building2, BookOpen, Link2,
  ClipboardList, MoreHorizontal, X, Settings, LogOut,
  Database, Layers, MapPin, ListChecks,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { ThemeSwitch } from "@/components/ThemeSwitch"
import type { UserRole } from "@/types/database"

interface NavItemDef {
  href: string
  label: string
  icon: React.ElementType
}

const PRIMARY: Record<UserRole, NavItemDef[]> = {
  corretor: [
    { href: "/dashboard",           label: "Início",  icon: LayoutDashboard },
    { href: "/dashboard/vitrine",   label: "Imóveis", icon: Globe },
    { href: "/dashboard/catalogo",  label: "Vitrine", icon: ListChecks },
    { href: "/dashboard/leads",     label: "Leads",   icon: MessageSquare },
  ],
  imobiliaria: [
    { href: "/dashboard",           label: "Início",  icon: LayoutDashboard },
    { href: "/dashboard/vitrine",   label: "Imóveis", icon: Globe },
    { href: "/dashboard/catalogo",  label: "Vitrine", icon: ListChecks },
    { href: "/dashboard/leads",     label: "Leads",   icon: MessageSquare },
  ],
  construtora: [
    { href: "/dashboard",                label: "Início",    icon: LayoutDashboard },
    { href: "/dashboard/imoveis",        label: "Imóveis",   icon: Home },
    { href: "/dashboard/lancamentos",    label: "Lançam.",   icon: Flame },
    { href: "/dashboard/analytics",      label: "Analytics", icon: BarChart3 },
  ],
  admin: [
    { href: "/dashboard",           label: "Início",   icon: LayoutDashboard },
    { href: "/dashboard/imoveis",   label: "Imóveis",  icon: Home },
    { href: "/dashboard/usuarios",  label: "Usuários", icon: Users },
    { href: "/dashboard/admin",     label: "Orgs",     icon: Building2 },
  ],
  secretaria: [
    { href: "/dashboard",          label: "Início",  icon: LayoutDashboard },
    { href: "/dashboard/imoveis",  label: "Imóveis", icon: Home },
    { href: "/dashboard/leads",    label: "Leads",   icon: MessageSquare },
    { href: "/dashboard/minisite", label: "Meu Site",icon: ExternalLink },
  ],
}

const SECONDARY: Record<UserRole, NavItemDef[]> = {
  corretor: [
    { href: "/dashboard/selecoes",  label: "Seleções",  icon: BookOpen },
    { href: "/dashboard/minisite",  label: "Meu Site",  icon: ExternalLink },
    { href: "/dashboard/corretor",  label: "Meus Links", icon: Link2 },
  ],
  imobiliaria: [
    { href: "/dashboard/equipe",        label: "Equipe",   icon: Users },
    { href: "/dashboard/minisite",      label: "Meu Site", icon: ExternalLink },
    { href: "/dashboard/configuracoes", label: "Config",   icon: Settings },
  ],
  construtora: [
    { href: "/dashboard/disponibilidade", label: "Disponib.", icon: ClipboardList },
    { href: "/dashboard/minisite",        label: "Meu Site",  icon: ExternalLink },
    { href: "/dashboard/configuracoes",   label: "Config",    icon: Settings },
  ],
  admin: [
    { href: "/dashboard/empreendimentos", label: "Empreend.",  icon: Layers },
    { href: "/dashboard/locais",          label: "Locais",     icon: MapPin },
    { href: "/dashboard/datacenter",      label: "Data",       icon: Database },
    { href: "/dashboard/configuracoes",   label: "Config",     icon: Settings },
  ],
  secretaria: [
    { href: "/dashboard/mercado",        label: "Mercado",  icon: BarChart3 },
    { href: "/dashboard/configuracoes",  label: "Config",   icon: Settings },
  ],
}

interface Props {
  role: UserRole
  userName: string
  userAvatar?: string | null
  orgSlug?: string | null
  userId?: string
}

export function BottomNav({ role, userName, userAvatar, orgSlug, userId }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const primary = PRIMARY[role] ?? PRIMARY.corretor
  const secondary = SECONDARY[role] ?? []

  const minisiteHref =
    role === "construtora" && orgSlug ? `/construtora/${orgSlug}` :
    role === "imobiliaria" && orgSlug ? `/imobiliaria/${orgSlug}` :
    role === "corretor" && userId     ? `/corretor/${userId}` :
    null

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  function isActive(href: string) {
    return href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href)
  }

  return (
    <>
      {/* Bottom Nav Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-sidebar/95 backdrop-blur-xl border-t border-sidebar-border safe-bottom">
        <div className="flex items-stretch h-16">
          {primary.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors relative"
                onClick={() => setOpen(false)}
              >
                <Icon size={20} className={active ? "text-gold" : "text-sidebar-foreground/35"} />
                <span className={`text-[10px] font-sans leading-none ${active ? "text-gold" : "text-sidebar-foreground/35"}`}>
                  {item.label}
                </span>
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gold rounded-b-full" />
                )}
              </Link>
            )
          })}

          {/* More button */}
          <button
            onClick={() => setOpen(!open)}
            className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors relative"
          >
            {open ? (
              <X size={20} className="text-gold" />
            ) : (
              <MoreHorizontal size={20} className="text-sidebar-foreground/35" />
            )}
            <span className={`text-[10px] font-sans leading-none ${open ? "text-gold" : "text-sidebar-foreground/35"}`}>
              Mais
            </span>
          </button>
        </div>
      </nav>

      {/* Slide-up More Sheet */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="lg:hidden fixed bottom-16 left-0 right-0 z-50 bg-sidebar border-t border-sidebar-border rounded-t-2xl pb-2"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-4">
                <div className="w-10 h-1 bg-sidebar-foreground/20 rounded-full" />
              </div>

              {/* User info + theme switch */}
              <div className="px-5 pb-4 flex items-center justify-between border-b border-sidebar-border mb-2">
                <div className="flex items-center gap-3">
                  {userAvatar ? (
                    <Image src={userAvatar} alt={userName} width={40} height={40} className="w-10 h-10 rounded-full object-cover border border-gold/20" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center border border-gold/30">
                      <span className="text-gold font-serif font-bold">{userName[0]?.toUpperCase()}</span>
                    </div>
                  )}
                  <div>
                    <p className="text-sidebar-foreground/90 text-sm font-sans font-medium">{userName}</p>
                    <p className="text-gold/50 text-[10px] uppercase tracking-wider font-sans">{role}</p>
                  </div>
                </div>
                <ThemeSwitch />
              </div>

              {/* Secondary nav items */}
              <div className="px-3 space-y-0.5">
                {secondary.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                        active
                          ? "bg-gold/15 text-gold"
                          : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground/90"
                      }`}
                    >
                      <Icon size={16} />
                      <span className="text-sm font-sans">{item.label}</span>
                    </Link>
                  )
                })}

                {/* Ver meu site */}
                {minisiteHref && (
                  <a
                    href={minisiteHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gold/20 text-gold/70 hover:text-gold transition-colors mt-2"
                  >
                    <ExternalLink size={16} />
                    <span className="text-sm font-sans">Ver Meu Site</span>
                  </a>
                )}

                {/* Sign out */}
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sidebar-foreground/30 hover:text-red-400 hover:bg-red-900/10 transition-colors"
                >
                  <LogOut size={16} />
                  <span className="text-sm font-sans">Sair</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
