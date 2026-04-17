"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ArrowRight } from "lucide-react"

const NAV_LINKS = [
  { href: "/construtoras", label: "Construtoras" },
  { href: "/imobiliarias", label: "Imobiliárias" },
  { href: "/corretores", label: "Corretores" },
]

const CTA_LINK = { href: "/venda", label: "Venda seu Imóvel" }

export function PortalNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-[#E8E4DC]">
      <div className="max-w-5xl mx-auto px-4 sm:px-5 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#1C1C1C] flex items-center justify-center">
            <span className="font-serif text-[#C9A96E] text-sm font-bold leading-none">R·I</span>
          </div>
          <div className="hidden sm:flex flex-col leading-none">
            <span className="font-serif text-[#1C1C1C] text-sm font-semibold">RealState</span>
            <span className="text-[8px] uppercase tracking-[0.3em] text-[#8B7355]/50 font-sans">Intelligence</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[11px] uppercase tracking-[0.15em] font-sans transition-colors ${
                pathname === link.href
                  ? "text-[#C9A96E]"
                  : "text-[#8B7355] hover:text-[#1C1C1C]"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href={CTA_LINK.href}
            className="text-[10px] uppercase tracking-[0.15em] font-sans transition-all px-4 py-1.5 rounded-full border border-[#C9A96E]/40 text-[#C9A96E] hover:bg-[#C9A96E] hover:text-[#1C1C1C]"
          >
            {CTA_LINK.label}
          </Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-[#1C1C1C] text-[#F5F0E8] hover:bg-[#C9A96E] hover:text-[#1C1C1C] transition-colors text-[10px] uppercase tracking-[0.2em] font-sans rounded-sm"
          >
            Corretor <ArrowRight size={9} />
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 text-[#8B7355] hover:text-[#1C1C1C] transition-colors"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[#E8E4DC] bg-white">
          <div className="max-w-5xl mx-auto px-4 py-4 space-y-1">
            {[...NAV_LINKS, { href: CTA_LINK.href, label: CTA_LINK.label }].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between py-3 text-sm font-sans border-b border-[#E8E4DC]/60 transition-colors ${
                  pathname === link.href ? "text-[#C9A96E]" : "text-[#8B7355] hover:text-[#1C1C1C]"
                }`}
              >
                {link.label}
                <ChevronRight />
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 mt-3 py-3.5 bg-[#1C1C1C] text-[#F5F0E8] text-xs uppercase tracking-[0.2em] font-sans rounded-sm"
            >
              Acesso Corretor <ArrowRight size={11} />
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

function ChevronRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}
