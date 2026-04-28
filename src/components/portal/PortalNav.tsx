"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ChevronRight, ArrowRight } from "lucide-react"
import { ThemeSwitch } from "@/components/ThemeSwitch"

const NAV_LINKS = [
  { href: "/construtoras", label: "Construtoras" },
  { href: "/imobiliarias", label: "Imobiliárias"  },
  { href: "/corretores",   label: "Corretores"    },
]

export function PortalNav() {
  const [open, setOpen]       = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const isHome   = pathname === "/"

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const transparent = isHome && !scrolled

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        transparent
          ? "bg-transparent border-transparent"
          : "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300 ${
            transparent ? "bg-white/15 backdrop-blur-sm" : "bg-foreground"
          }`}>
            <span className="font-serif text-gold text-sm font-bold leading-none">R·I</span>
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className={`font-serif text-sm font-semibold transition-colors duration-300 ${transparent ? "text-white" : "text-foreground"}`}>
              RealState
            </span>
            <span className={`text-[8px] uppercase tracking-[0.3em] font-sans transition-colors duration-300 ${transparent ? "text-white/50" : "text-muted-foreground/50"}`}>
              Intelligence
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[11px] uppercase tracking-[0.15em] font-sans transition-colors duration-200 ${
                pathname === link.href
                  ? "text-gold"
                  : transparent
                  ? "text-white/75 hover:text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/venda"
            className={`text-[10px] uppercase tracking-[0.15em] font-sans transition-all duration-200 px-4 py-1.5 rounded-full border ${
              transparent
                ? "border-white/30 text-white/80 hover:border-white hover:text-white"
                : "border-gold/40 text-gold hover:bg-gold hover:text-foreground"
            }`}
          >
            Anunciar
          </Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2.5">
          <ThemeSwitch />
          <Link
            href="/login"
            className={`hidden sm:flex items-center gap-1.5 px-4 py-2 transition-all duration-200 text-[10px] uppercase tracking-[0.2em] font-sans rounded-sm ${
              transparent
                ? "bg-white/15 text-white backdrop-blur-sm hover:bg-white/25"
                : "bg-foreground text-background hover:bg-gold hover:text-foreground"
            }`}
          >
            Entrar <ArrowRight size={9} />
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className={`md:hidden p-2 transition-colors ${transparent ? "text-white/80 hover:text-white" : "text-muted-foreground hover:text-foreground"}`}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background/98 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {[...NAV_LINKS, { href: "/venda", label: "Anunciar" }].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between py-3.5 text-sm font-sans border-b border-border/60 transition-colors ${
                  pathname === link.href ? "text-gold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
                <ChevronRight size={14} className="text-muted-foreground/40" />
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 mt-3 py-3.5 bg-foreground text-background text-xs uppercase tracking-[0.2em] font-sans rounded-xl"
            >
              Acessar Plataforma <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
