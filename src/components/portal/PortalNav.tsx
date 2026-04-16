"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ArrowRight } from "lucide-react"

const NAV_LINKS = [
  { href: "/construtoras", label: "Construtoras" },
  { href: "/imobiliarias", label: "Imobiliárias" },
  { href: "/corretores", label: "Corretores" },
  { href: "/sobre", label: "Sobre o Portal" },
]

export function PortalNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-sm border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <span className="font-serif text-gold text-xl font-bold tracking-tight leading-none">R·I</span>
          <div className="hidden sm:flex flex-col">
            <span className="font-serif text-foreground text-sm font-semibold leading-none">RealState</span>
            <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/50 font-sans">Intelligence</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-7">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[11px] uppercase tracking-[0.15em] font-sans transition-colors ${
                pathname === link.href
                  ? "text-gold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTA + hamburger */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-gold text-graphite hover:bg-gold-light transition-colors text-[10px] uppercase tracking-[0.2em] font-sans rounded-sm"
          >
            Acesso Corretor <ArrowRight size={10} />
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border/50 bg-background">
          <div className="px-4 py-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`block py-3 text-sm font-sans border-b border-border/30 transition-colors ${
                  pathname === link.href ? "text-gold" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 mt-4 py-3 bg-gold text-graphite text-xs uppercase tracking-[0.2em] font-sans rounded-sm"
            >
              Acesso Corretor <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
