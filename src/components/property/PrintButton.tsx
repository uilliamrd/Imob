"use client"

import { Printer } from "lucide-react"

export function PrintButton() {
  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
        }
      `}</style>
      <button
        onClick={() => window.print()}
        className="no-print fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-border text-muted-foreground hover:border-gold/40 hover:text-gold hover:bg-gold/5 transition-all text-xs font-sans uppercase tracking-[0.12em] shadow-sm backdrop-blur-sm"
      >
        <Printer size={13} />
        Baixar PDF
      </button>
    </>
  )
}
