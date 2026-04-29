"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Link2, MessageCircle, ShieldCheck, Copy, Check, ArrowLeft } from "lucide-react"
import { PremiumButton } from "@/components/ui/premium"

// ── Back button ───────────────────────────────────────────────────────────────

export function BackButton() {
  const router = useRouter()
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="inline-flex items-center gap-1.5 text-sm font-sans text-muted-foreground hover:text-foreground transition-colors mb-6 group"
    >
      <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
      Voltar para Base de Imóveis
    </button>
  )
}

// ── Notes editor ─────────────────────────────────────────────────────────────

interface NotesProps {
  propertyId: string
  initialNote: string
}

export function PropertyNotesEditor({ propertyId, initialNote }: NotesProps) {
  const [note, setNote] = useState(initialNote)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const save = useCallback(async (text: string) => {
    setSaving(true)
    try {
      await fetch(`/api/notes/${propertyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: text }),
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }, [propertyId])

  function handleChange(val: string) {
    setNote(val)
    setSaved(false)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => save(val), 1500)
  }

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current) }, [])

  return (
    <div className="bg-card border border-border rounded-xl p-5 elevation-soft">
      <div className="mb-3">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-sans">Minhas Anotações</p>
        <p className="text-xs text-muted-foreground/60 font-sans mt-0.5">Somente você pode ver estas anotações</p>
      </div>
      <textarea
        value={note}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Adicione notas sobre este imóvel, cliente interessado, histórico de visitas..."
        className="w-full min-h-[120px] px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm font-sans resize-none focus:outline-none focus:border-[var(--gold)]/60 transition-colors"
      />
      <div className="flex items-center justify-end mt-2 h-5">
        {saving && (
          <span className="text-xs text-muted-foreground font-sans flex items-center gap-1">
            <span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
            Salvando...
          </span>
        )}
        {saved && !saving && (
          <span className="text-xs text-emerald-500 font-sans flex items-center gap-1">
            <Check size={12} /> Salvo
          </span>
        )}
      </div>
    </div>
  )
}

// ── Share panel ───────────────────────────────────────────────────────────────

interface ShareProps {
  trackedPath: string
  propertyTitle: string
  propertyCity: string | null
  propertyPrice: number
}

function formatPrice(p: number): string {
  if (p >= 1_000_000) return `R$ ${(p / 1_000_000).toFixed(p % 1_000_000 === 0 ? 0 : 1)} mi`
  if (p >= 1_000) return `R$ ${(p / 1_000).toFixed(0)} mil`
  return p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export function PropertySharePanel({ trackedPath, propertyTitle, propertyCity, propertyPrice }: ShareProps) {
  const [copied, setCopied] = useState(false)
  const [trackedLink, setTrackedLink] = useState("")

  useEffect(() => {
    setTrackedLink(window.location.origin + trackedPath)
  }, [trackedPath])

  async function copyLink() {
    if (!trackedLink) return
    await navigator.clipboard.writeText(trackedLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  function openWhatsApp() {
    if (!trackedLink) return
    const msg = encodeURIComponent(
      `Olá! Encontrei um imóvel que pode te interessar 🏠\n${propertyTitle}${propertyCity ? ` — ${propertyCity}` : ""}\n${formatPrice(propertyPrice)}\nVeja todos os detalhes: ${trackedLink}`
    )
    window.open(`https://wa.me/?text=${msg}`, "_blank", "noopener,noreferrer")
  }

  return (
    <div className="bg-card border border-border rounded-2xl p-6 elevation-card">
      <p className="font-serif text-base font-semibold text-foreground">Compartilhar este imóvel</p>
      <p className="text-xs text-muted-foreground font-sans mt-1 mb-5">
        Seu link rastreado — saberemos que o lead veio de você
      </p>

      <div className="space-y-3">
        <PremiumButton
          variant="gold"
          size="lg"
          icon={copied ? Check : Link2}
          onClick={copyLink}
          className="w-full"
        >
          {copied ? "Link copiado!" : "Copiar link rastreado"}
        </PremiumButton>

        <PremiumButton
          variant="outline"
          size="lg"
          onClick={openWhatsApp}
          className="w-full border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/8"
        >
          <MessageCircle size={18} className="text-emerald-500" />
          Abrir no WhatsApp
        </PremiumButton>
      </div>

      {/* Link read-only */}
      {copied && trackedLink && (
        <div className="mt-4 flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
          <input
            readOnly
            value={trackedLink}
            className="flex-1 bg-transparent text-xs font-sans text-muted-foreground focus:outline-none truncate"
          />
          <button type="button" onClick={copyLink} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <Copy size={13} />
          </button>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2">
        <ShieldCheck size={14} className="text-[var(--forest)] shrink-0" />
        <p className="text-xs text-muted-foreground font-sans">
          Este link identifica você como origem do lead
        </p>
      </div>
    </div>
  )
}

// ── Info card ─────────────────────────────────────────────────────────────────

interface InfoCardProps {
  code?: number | null
  createdAt: string
  updatedAt: string
  orgName?: string | null
}

export function PropertyInfoCard({ code, createdAt, updatedAt, orgName }: InfoCardProps) {
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })

  return (
    <div className="bg-card border border-border rounded-2xl p-5 elevation-soft">
      <p className="text-xs uppercase tracking-wider text-muted-foreground font-sans mb-3">Informações</p>
      <dl className="space-y-2">
        {code && (
          <div className="flex justify-between items-center">
            <dt className="text-xs text-muted-foreground font-sans">Código</dt>
            <dd className="text-xs font-sans font-medium text-foreground">#{code}</dd>
          </div>
        )}
        <div className="flex justify-between items-center">
          <dt className="text-xs text-muted-foreground font-sans">Cadastrado em</dt>
          <dd className="text-xs font-sans text-foreground">{fmt(createdAt)}</dd>
        </div>
        <div className="flex justify-between items-center">
          <dt className="text-xs text-muted-foreground font-sans">Última atualização</dt>
          <dd className="text-xs font-sans text-foreground">{fmt(updatedAt)}</dd>
        </div>
        {orgName && (
          <div className="flex justify-between items-center">
            <dt className="text-xs text-muted-foreground font-sans">Empresa</dt>
            <dd className="text-xs font-sans font-medium text-foreground truncate max-w-[140px]">{orgName}</dd>
          </div>
        )}
      </dl>
    </div>
  )
}
