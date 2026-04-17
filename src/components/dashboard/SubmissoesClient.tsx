"use client"

import { useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  User, Phone, Mail, MapPin, Home, DollarSign, BedDouble, Car,
  Clock, Eye, CheckCircle, XCircle, AlertTriangle, Copy, Star,
  Sparkles, Shield, ChevronDown, ChevronUp, FileText,
} from "lucide-react"
import type { PropertySubmission } from "@/app/(dashboard)/dashboard/submissoes/page"

type Status = PropertySubmission["status"]
type Plan = PropertySubmission["plan"]

const STATUS_CONFIG: Record<Status, { label: string; color: string; icon: React.ElementType }> = {
  pending:   { label: "Pendente",    color: "text-blue-400 bg-blue-900/20 border-blue-700/40",      icon: Clock },
  reviewing: { label: "Em Revisão",  color: "text-amber-400 bg-amber-900/20 border-amber-700/40",   icon: Eye },
  approved:  { label: "Aprovado",    color: "text-emerald-400 bg-emerald-900/20 border-emerald-700/40", icon: CheckCircle },
  rejected:  { label: "Rejeitado",   color: "text-red-400 bg-red-900/20 border-red-700/40",         icon: XCircle },
  duplicate: { label: "Duplicado",   color: "text-orange-400 bg-orange-900/20 border-orange-700/40", icon: Copy },
}

const PLAN_CONFIG: Record<Plan, { label: string; color: string; icon: React.ElementType }> = {
  free:           { label: "Gratuito",       color: "text-zinc-400 border-zinc-700/40",    icon: Home },
  destaque:       { label: "Destaque",       color: "text-amber-400 border-amber-700/40",  icon: Star },
  super_destaque: { label: "Super Destaque", color: "text-gold border-gold/40",            icon: Sparkles },
  exclusivo:      { label: "Exclusivo",      color: "text-emerald-400 border-emerald-700/40", icon: Shield },
}

const STATUS_TABS: Array<{ id: Status | "all"; label: string }> = [
  { id: "all",       label: "Todos" },
  { id: "pending",   label: "Pendentes" },
  { id: "reviewing", label: "Em Revisão" },
  { id: "duplicate", label: "Duplicados" },
  { id: "approved",  label: "Aprovados" },
  { id: "rejected",  label: "Rejeitados" },
]

function formatPrice(price: number | null) {
  if (!price) return "—"
  if (price >= 1_000_000)
    return "R$ " + (price / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + " Mi"
  return "R$ " + price.toLocaleString("pt-BR")
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

export function SubmissoesClient({ initialSubmissions }: { initialSubmissions: PropertySubmission[] }) {
  const supabase = createClient()
  const [submissions, setSubmissions] = useState(initialSubmissions)
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState<string | null>(null)

  const stats = useMemo(() => ({
    total:     submissions.length,
    pending:   submissions.filter((s) => s.status === "pending").length,
    reviewing: submissions.filter((s) => s.status === "reviewing").length,
    duplicate: submissions.filter((s) => s.status === "duplicate").length,
    paid:      submissions.filter((s) => s.plan !== "free").length,
  }), [submissions])

  const filtered = useMemo(() =>
    statusFilter === "all" ? submissions : submissions.filter((s) => s.status === statusFilter),
  [submissions, statusFilter])

  async function setStatus(id: string, status: Status) {
    setSaving(id)
    const adminNotes = notes[id] ?? undefined
    const { error } = await supabase
      .from("property_submissions")
      .update({ status, ...(adminNotes !== undefined ? { admin_notes: adminNotes } : {}) })
      .eq("id", id)
    if (!error) {
      setSubmissions((prev) => prev.map((s) =>
        s.id === id ? { ...s, status, admin_notes: adminNotes ?? s.admin_notes } : s
      ))
    }
    setSaving(null)
  }

  async function saveNotes(id: string) {
    setSaving(id)
    await supabase
      .from("property_submissions")
      .update({ admin_notes: notes[id] ?? "" })
      .eq("id", id)
    setSubmissions((prev) => prev.map((s) =>
      s.id === id ? { ...s, admin_notes: notes[id] ?? s.admin_notes } : s
    ))
    setSaving(null)
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { label: "Total",       value: stats.total,     accent: "text-foreground" },
          { label: "Pendentes",   value: stats.pending,   accent: "text-blue-400" },
          { label: "Em Revisão",  value: stats.reviewing, accent: "text-amber-400" },
          { label: "Duplicados",  value: stats.duplicate, accent: "text-orange-400" },
          { label: "Planos Pagos",value: stats.paid,      accent: "text-gold" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-sans mb-1">{s.label}</p>
            <p className={`font-serif text-3xl font-bold ${s.accent}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto mb-5">
        {STATUS_TABS.map((t) => (
          <button key={t.id} onClick={() => setStatusFilter(t.id)}
            className={`px-4 py-2 rounded-lg text-xs uppercase tracking-[0.15em] font-sans transition-colors whitespace-nowrap ${
              statusFilter === t.id
                ? "bg-gold/15 text-gold"
                : "text-muted-foreground hover:text-foreground hover:bg-card"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground/40 font-sans text-sm border border-dashed border-border rounded-xl">
          Nenhuma submissão encontrada.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => {
            const StatusIcon = STATUS_CONFIG[s.status].icon
            const PlanIcon = PLAN_CONFIG[s.plan].icon
            const isOpen = expanded === s.id

            return (
              <div key={s.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-gold/10 transition-colors">
                {/* Header row */}
                <button
                  onClick={() => setExpanded(isOpen ? null : s.id)}
                  className="w-full flex items-start gap-4 p-4 text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-serif text-foreground text-sm font-semibold">{s.owner_name}</p>
                        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                          <span className="flex items-center gap-1 text-xs font-sans text-muted-foreground/70">
                            <Phone size={9} />{s.owner_phone}
                          </span>
                          {s.owner_email && (
                            <span className="flex items-center gap-1 text-xs font-sans text-muted-foreground/50">
                              <Mail size={9} />{s.owner_email}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Plan badge */}
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] uppercase font-sans tracking-wider ${PLAN_CONFIG[s.plan].color}`}>
                          <PlanIcon size={9} />{PLAN_CONFIG[s.plan].label}
                        </span>
                        {/* Status badge */}
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] uppercase font-sans tracking-wider ${STATUS_CONFIG[s.status].color}`}>
                          <StatusIcon size={9} />{STATUS_CONFIG[s.status].label}
                        </span>
                      </div>
                    </div>

                    {/* Property summary */}
                    <div className="flex items-center gap-4 mt-2 flex-wrap">
                      {s.tipo && (
                        <span className="flex items-center gap-1 text-xs font-sans text-muted-foreground/60 capitalize">
                          <Home size={9} />{s.tipo}
                        </span>
                      )}
                      {(s.neighborhood || s.city) && (
                        <span className="flex items-center gap-1 text-xs font-sans text-muted-foreground/60">
                          <MapPin size={9} />{[s.neighborhood, s.city].filter(Boolean).join(", ")}
                        </span>
                      )}
                      {s.price && (
                        <span className="flex items-center gap-1 text-xs font-sans text-muted-foreground/60">
                          <DollarSign size={9} />{formatPrice(s.price)}
                        </span>
                      )}
                      {s.quartos && (
                        <span className="flex items-center gap-1 text-xs font-sans text-muted-foreground/60">
                          <BedDouble size={9} />{s.quartos} quartos
                        </span>
                      )}
                      {s.vagas && (
                        <span className="flex items-center gap-1 text-xs font-sans text-muted-foreground/60">
                          <Car size={9} />{s.vagas} vagas
                        </span>
                      )}
                      <span className="text-[10px] font-sans text-muted-foreground/30 ml-auto">
                        {formatDate(s.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 mt-1">
                    {isOpen ? <ChevronUp size={14} className="text-muted-foreground/40" /> : <ChevronDown size={14} className="text-muted-foreground/40" />}
                  </div>
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="border-t border-border px-4 pb-4 pt-4 space-y-4">
                    {/* Duplicate warning */}
                    {s.status === "duplicate" && s.matched_property_id && (
                      <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-orange-900/10 border border-orange-700/30">
                        <AlertTriangle size={12} className="text-orange-400 flex-shrink-0 mt-0.5" />
                        <p className="text-orange-400 text-xs font-sans">
                          Endereço similar encontrado no sistema. ID: <span className="font-mono text-[10px]">{s.matched_property_id}</span>
                        </p>
                      </div>
                    )}

                    {/* Full address */}
                    {s.address && (
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 font-sans mb-1">Endereço</p>
                        <p className="text-sm font-sans text-foreground/80 flex items-center gap-1.5">
                          <MapPin size={11} className="text-muted-foreground/40" />
                          {s.address}{s.neighborhood ? `, ${s.neighborhood}` : ""}{s.city ? ` — ${s.city}` : ""}{s.cep ? ` (CEP ${s.cep})` : ""}
                        </p>
                      </div>
                    )}

                    {/* Description */}
                    {s.description && (
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 font-sans mb-1">Descrição</p>
                        <p className="text-sm font-sans text-foreground/70 leading-relaxed flex gap-1.5">
                          <FileText size={11} className="text-muted-foreground/30 flex-shrink-0 mt-0.5" />
                          {s.description}
                        </p>
                      </div>
                    )}

                    {/* Admin notes */}
                    <div>
                      <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 font-sans block mb-1.5">
                        Notas internas
                      </label>
                      <textarea
                        rows={2}
                        defaultValue={s.admin_notes ?? ""}
                        onChange={(e) => setNotes((n) => ({ ...n, [s.id]: e.target.value }))}
                        placeholder="Observações para a equipe..."
                        className="w-full bg-muted/30 border border-border text-foreground/80 placeholder-muted-foreground/30 px-3 py-2 rounded-lg font-sans text-xs focus:outline-none focus:border-gold/40 transition-colors resize-none"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {s.status !== "reviewing" && (
                        <button onClick={() => setStatus(s.id, "reviewing")} disabled={saving === s.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-sans text-amber-400 hover:bg-amber-900/20 transition-colors border border-transparent hover:border-amber-700/40 disabled:opacity-40">
                          <Eye size={10} /> Em Revisão
                        </button>
                      )}
                      {s.status !== "approved" && (
                        <button onClick={() => setStatus(s.id, "approved")} disabled={saving === s.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-sans text-emerald-400 hover:bg-emerald-900/20 transition-colors border border-transparent hover:border-emerald-700/40 disabled:opacity-40">
                          <CheckCircle size={10} /> Aprovar
                        </button>
                      )}
                      {s.status !== "rejected" && (
                        <button onClick={() => setStatus(s.id, "rejected")} disabled={saving === s.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-sans text-red-400 hover:bg-red-900/20 transition-colors border border-transparent hover:border-red-700/40 disabled:opacity-40">
                          <XCircle size={10} /> Rejeitar
                        </button>
                      )}
                      {notes[s.id] !== undefined && notes[s.id] !== (s.admin_notes ?? "") && (
                        <button onClick={() => saveNotes(s.id)} disabled={saving === s.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-sans text-gold hover:bg-gold/10 transition-colors border border-gold/30 ml-auto disabled:opacity-40">
                          {saving === s.id ? "Salvando..." : "Salvar notas"}
                        </button>
                      )}
                    </div>

                    {/* Contact CTA */}
                    <a
                      href={`https://wa.me/${s.owner_phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${s.owner_name}! Recebemos o cadastro do seu imóvel na RealState Intelligence e gostaríamos de conversar sobre os próximos passos.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-sans text-gold/60 hover:text-gold transition-colors"
                    >
                      <Phone size={10} /> Entrar em contato via WhatsApp
                    </a>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
