"use client"

import { useState } from "react"
import { X, Sparkles, Zap, CheckCircle2, Loader2 } from "lucide-react"
import { HIGHLIGHT_UPSELLS, BOOST_OPTIONS } from "@/lib/plans"
import type { Property } from "@/types/database"

interface Props {
  property: Property
  onClose: () => void
}

type Tab = "destaque" | "boost"

export function UpsellModal({ property, onClose }: Props) {
  const [tab, setTab]       = useState<Tab>("destaque")
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const highlights = Object.values(HIGHLIGHT_UPSELLS).sort((a, b) => a.prioridade - b.prioridade)
  const boosts     = Object.values(BOOST_OPTIONS).sort((a, b) => a.duracao_dias - b.duracao_dias)

  async function handleSolicitar() {
    if (!selected) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/upsell", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: tab === "destaque" ? "highlight" : "boost", property_id: property.id, option_id: selected }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Erro desconhecido")
      setSuccess(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao enviar solicitação")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-gold/60 font-sans mb-0.5">Impulsionar Imóvel</p>
            <h2 className="font-serif text-xl font-semibold text-foreground line-clamp-1">{property.title}</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="px-6 py-12 text-center">
            <CheckCircle2 size={40} className="text-emerald-400 mx-auto mb-4" />
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">Solicitação enviada!</h3>
            <p className="text-muted-foreground font-sans text-sm max-w-xs mx-auto">
              Nossa equipe entrará em contato para confirmar o pagamento e ativar o serviço.
            </p>
            <button
              onClick={onClose}
              className="mt-8 px-6 py-2.5 bg-gold/10 hover:bg-gold/20 text-gold text-sm font-sans rounded-lg transition-colors"
            >
              Fechar
            </button>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-border">
              {(["destaque", "boost"] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setSelected(null); setError(null) }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs uppercase tracking-wider font-sans transition-colors border-b-2 ${
                    tab === t
                      ? "border-gold text-gold"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "destaque" ? <Sparkles size={13} /> : <Zap size={13} />}
                  {t === "destaque" ? "Destaques" : "Boosts"}
                </button>
              ))}
            </div>

            {/* Options */}
            <div className="p-4 space-y-2.5 max-h-72 overflow-y-auto">
              {tab === "destaque" ? (
                highlights.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => setSelected(h.id)}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all ${
                      selected === h.id
                        ? "border-gold/60 bg-gold/5"
                        : "border-border hover:border-border/80 bg-background"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-foreground font-sans text-sm font-medium">{h.nome}</p>
                        <p className="text-muted-foreground font-sans text-xs mt-0.5">{h.descricao}</p>
                      </div>
                      <span className="font-serif text-gold font-semibold text-base flex-shrink-0 ml-4">
                        R$ {h.preco}
                      </span>
                    </div>
                  </button>
                ))
              ) : (
                boosts.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelected(b.id)}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all ${
                      selected === b.id
                        ? "border-gold/60 bg-gold/5"
                        : "border-border hover:border-border/80 bg-background"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-foreground font-sans text-sm font-medium">{b.nome}</p>
                        <p className="text-muted-foreground font-sans text-xs mt-0.5">{b.duracao_dias} dias de impulsionamento</p>
                      </div>
                      <span className="font-serif text-gold font-semibold text-base flex-shrink-0 ml-4">
                        R$ {b.preco}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border">
              {error && (
                <p className="text-red-400 text-xs font-sans mb-3">{error}</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-border text-muted-foreground hover:text-foreground text-sm font-sans rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSolicitar}
                  disabled={!selected || loading}
                  className="flex-1 py-2.5 bg-gold hover:bg-gold/90 disabled:opacity-40 disabled:cursor-not-allowed text-[#0a0a0a] text-sm font-sans font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  Solicitar
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
