"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, Search, Zap, ChevronDown, LogOut, User, Settings, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { GlobalSearch } from "./GlobalSearch"
import type { UserRole } from "@/types/database"

interface DashboardTopbarProps {
  userName: string
  userAvatar?: string | null
  role: UserRole
  userId: string
  title?: string
  breadcrumb?: { label: string; href?: string }[]
  actions?: React.ReactNode
  notificationCount?: number
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return "Bom dia"
  if (h < 18) return "Boa tarde"
  return "Boa noite"
}

const ROLE_SUBTITLES: Record<UserRole, string> = {
  admin:       "Visão completa da plataforma",
  imobiliaria: "Acompanhe sua operação hoje",
  corretor:    "Mantenha seu pipeline aquecido",
  construtora: "Performance comercial em tempo real",
  secretaria:  "Organize o dia da equipe",
}

const QUICK_ACTION: Record<UserRole, { label: string; href: string }> = {
  admin:       { label: "Novo imóvel",  href: "/dashboard/imoveis/novo" },
  imobiliaria: { label: "Novo imóvel",  href: "/dashboard/imoveis/novo" },
  corretor:    { label: "Novo imóvel",  href: "/dashboard/imoveis/novo" },
  construtora: { label: "Novo imóvel",  href: "/dashboard/imoveis/novo" },
  secretaria:  { label: "Ver imóveis",  href: "/dashboard/imoveis" },
}

export function DashboardTopbar({
  userName,
  userAvatar,
  role,
  userId: _userId,
  title,
  breadcrumb,
  actions,
  notificationCount = 0,
}: DashboardTopbarProps) {
  const [menuOpen, setMenuOpen]     = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const menuRef                     = useRef<HTMLDivElement>(null)
  const router                      = useRouter()
  const firstName                   = userName.split(" ")[0]
  const quickAction                 = QUICK_ACTION[role]

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <>
      <header className="hidden lg:flex sticky top-0 z-30 items-center justify-between px-8 h-[60px] bg-background/80 backdrop-blur-xl border-b border-border/50 flex-shrink-0 gap-4">

        {/* Left: breadcrumb or greeting */}
        <div className="flex items-center gap-1.5 min-w-0">
          {breadcrumb && breadcrumb.length > 0 ? (
            <nav className="flex items-center gap-1 text-sm font-sans overflow-hidden">
              <Link href="/dashboard" className="text-muted-foreground hover:text-[var(--gold)] transition-colors shrink-0">
                Início
              </Link>
              {breadcrumb.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1 min-w-0">
                  <ChevronRight size={12} className="text-muted-foreground/40 shrink-0" />
                  {crumb.href && i < breadcrumb.length - 1 ? (
                    <Link href={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors truncate">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-foreground font-medium truncate">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          ) : title ? (
            <div>
              <p className="font-serif text-[15px] font-semibold text-foreground leading-tight">{title}</p>
            </div>
          ) : (
            <div>
              <p className="font-sans text-foreground font-semibold text-[14px] leading-tight">
                {getGreeting()}, {firstName} 👋
              </p>
              <p className="text-muted-foreground text-[11px] font-sans mt-0.5 leading-none">{ROLE_SUBTITLES[role]}</p>
            </div>
          )}
        </div>

        {/* Right: actions + search + bell + avatar */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Page actions slot */}
          {actions && <div className="flex items-center gap-2">{actions}</div>}

          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-muted/50 border border-border/60 text-muted-foreground text-xs font-sans hover:border-[var(--gold)]/30 hover:bg-muted/80 hover:text-foreground transition-all duration-200"
          >
            <Search size={13} />
            <span className="hidden xl:inline text-[11px]">Buscar...</span>
            <kbd className="hidden xl:inline ml-0.5 px-1.5 py-0.5 rounded-md bg-background border border-border/70 text-[9px] font-mono text-muted-foreground/50">
              ⌘K
            </kbd>
          </button>

          {/* Quick action */}
          <Link
            href={quickAction.href}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--gold)] text-[#0F0F0F] hover:bg-[var(--gold-light)] text-[11px] uppercase tracking-[0.15em] font-sans transition-all duration-200 shadow-sm shadow-[var(--gold)]/20 font-medium"
          >
            <Zap size={12} />
            <span className="hidden xl:inline">{quickAction.label}</span>
          </Link>

          {/* Bell */}
          <button aria-label="Notificações" className="relative w-9 h-9 rounded-xl border border-border/60 bg-muted/40 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/30 hover:bg-muted/70 transition-all duration-200">
            <Bell size={14} />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--gold)] text-[#0F0F0F] text-[9px] font-bold flex items-center justify-center">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button>

          {/* Avatar + dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Menu do usuário"
              aria-expanded={menuOpen}
              className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-xl border border-border/60 bg-muted/40 hover:border-[var(--gold)]/30 hover:bg-muted/70 transition-all duration-200"
            >
              {userAvatar ? (
                <Image src={userAvatar} alt={userName} width={26} height={26} className="w-[26px] h-[26px] rounded-lg object-cover" />
              ) : (
                <div className="w-[26px] h-[26px] rounded-lg bg-gradient-to-br from-[var(--gold)]/30 to-[var(--gold)]/10 border border-[var(--gold)]/30 flex items-center justify-center shrink-0">
                  <span className="text-[var(--gold)] font-serif font-bold text-xs">{firstName[0]?.toUpperCase()}</span>
                </div>
              )}
              <ChevronDown size={11} className={`text-muted-foreground transition-transform duration-200 ${menuOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-52 bg-card border border-border/70 rounded-2xl shadow-xl shadow-black/10 overflow-hidden z-50"
                >
                  <div className="px-4 py-3 border-b border-border/50">
                    <p className="text-sm font-sans font-medium text-foreground truncate">{userName}</p>
                    <p className="text-[11px] font-sans text-muted-foreground capitalize mt-0.5">{role}</p>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    <Link href="/dashboard/configuracoes" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-sans text-foreground/70 hover:text-foreground hover:bg-muted/60 transition-colors">
                      <User size={13} /> Perfil
                    </Link>
                    <Link href="/dashboard/configuracoes" onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-sans text-foreground/70 hover:text-foreground hover:bg-muted/60 transition-colors">
                      <Settings size={13} /> Configurações
                    </Link>
                    <div className="my-1 border-t border-border/40" />
                    <button onClick={handleSignOut}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-sans text-red-400 hover:bg-red-500/10 transition-colors w-full text-left">
                      <LogOut size={13} /> Sair
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
