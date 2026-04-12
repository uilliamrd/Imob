"use client"

import { useEffect } from "react"
import { AlertTriangle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-full border border-red-500/20 bg-red-900/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={24} className="text-red-400" />
        </div>
        <div className="divider-gold mb-8 mx-auto w-16" />
        <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
          Algo deu errado
        </h2>
        <p className="text-muted-foreground font-sans text-sm leading-relaxed mb-8">
          Ocorreu um erro inesperado. Nossa equipe foi notificada.
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-gold text-graphite hover:bg-gold-light transition-colors text-xs uppercase tracking-[0.2em] font-sans rounded-lg"
          >
            Tentar Novamente
          </button>
          <a
            href="/"
            className="px-6 py-3 border border-border text-muted-foreground hover:border-gold/40 hover:text-gold transition-colors text-xs uppercase tracking-[0.2em] font-sans rounded-lg"
          >
            Início
          </a>
        </div>
      </div>
    </div>
  )
}
