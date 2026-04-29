"use client"

import { Sun, Moon } from "lucide-react"
import { useTheme } from "./ThemeProvider"

export function ThemeSwitch() {
  const { theme, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      title={theme === "dark" ? "Modo claro" : "Modo escuro"}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all duration-300 group
        ${theme === "dark"
          ? "bg-white/5 border-white/10 hover:bg-gold/10 hover:border-gold/30"
          : "bg-black/5 border-black/10 hover:bg-gold/10 hover:border-gold/30"
        }
      `}
    >
      {theme === "dark" ? (
        <Sun size={13} className="text-white/40 group-hover:text-gold transition-colors" />
      ) : (
        <Moon size={13} className="text-foreground/40 group-hover:text-gold transition-colors" />
      )}
      <span className="text-[9px] uppercase tracking-[0.2em] font-sans hidden sm:block text-foreground/40 group-hover:text-gold/70 transition-colors">
        {theme === "dark" ? "Claro" : "Escuro"}
      </span>
    </button>
  )
}
