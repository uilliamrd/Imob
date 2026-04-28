"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Search, MessageCircle, User } from "lucide-react"

const TABS = [
  { href: "/",       icon: Home,          label: "Início"   },
  { href: "/#buscar",icon: Search,         label: "Buscar"   },
  { href: "/#contato",icon: MessageCircle, label: "Contato"  },
  { href: "/login",  icon: User,           label: "Conta"    },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background/95 backdrop-blur-md border-t border-border safe-bottom">
      <div className="flex items-center justify-around h-14 px-1">
        {TABS.map(({ href, icon: Icon, label }) => {
          const base  = href.split("#")[0]
          const active = base === "/" ? pathname === "/" : pathname.startsWith(base)
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 flex-1 py-2 rounded-xl transition-colors ${
                active ? "text-gold" : "text-muted-foreground/60 hover:text-foreground"
              }`}
            >
              <Icon size={19} />
              <span className="text-[9px] uppercase tracking-wider font-sans">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
