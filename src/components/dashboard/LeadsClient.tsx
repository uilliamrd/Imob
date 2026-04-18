"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Phone, Home, Clock, ChevronDown, ChevronUp, MessageSquare, AlertTriangle, X, ExternalLink } from "lucide-react"
import type { Lead, LeadStatus, LeadConflict } from "@/types/database"

const STATUS_OPTIONS: { value: LeadStatus; label: string; cls: string }[] = [
  { value: "novo",        label: "Novo",        cls: "bg-blue-900/30 text-blue-300 border-blue-700/40" },
  { value: "em_contato",  label: "Em Contato",  cls: "bg-amber-900/30 text-amber-300 border-amber-700/40" },
  { value: "convertido",  label: "Convertido",  cls: "bg-emerald-900/30 text-emerald-300 border-emerald-700/40" },
  { value: "perdido",     label: "Perdido",     cls: "bg-zinc-800 text-zinc-400 border-zinc-700/40" },
]

function statusCls(status: LeadStatus) {
  return STATUS_OPTIONS.find((o) => o.value === status)?.cls ?? ""
}
function statusLabel(status: LeadStatus) {
  return STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status
}

type ConflictItem = Pick<LeadConflict, "id" | "original_lead_id" | "acknowledged">

interface Props {
  initialLeads: Lead[]
  initialConflicts?: ConflictItem[]
}

export function LeadsClient({ initialLeads, initialConflicts = [] }: Props) {
  const [leads, setLeads] = useState(initialLeads)
  const [conflicts, setConflicts] = useState(initialConflicts)
  const [updating, setUpdating] = useState<string | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const conflictedLeadIds = new Set(conflicts.map((c) => c.original_lead_id))

  async function acknowledgeConflict(conflictId: string) {
    const supabase = createClient()
    await supabase.from("lead_conflicts").update({ acknowledged: true }).eq("id", conflictId)
    setConflicts((prev) => prev.filter((c) => c.id !== conflictId))
  }

  async function acknowledgeAll() {
    const supabase = createClient()
    const ids = conflicts.map((c) => c.id)
    await supabase.from("lead_conflicts").update({ acknowledged: true }).in("id", ids)
    setConflicts([])
  }

  const filtered = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search) ||
      (l.property_slug ?? "").toLowerCase().includes(search.toLowerCase())
  )

  async function updateStatus(id: string, status: LeadStatus) {
    setUpdating(id)
    setOpenDropdown(null)
    const supabase = createClient()
    await supabase.from("leads").update({ status }).eq("id", id)
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)))
    setUpdating(null)
  }

  function formatDate(ts: string) {
    const d = new Date(ts)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffH = Math.floor(diffMs / 3_600_000)
    if (diffH < 1) return "Agora há pouco"
    if (diffH < 24) return `Há ${diffH}h`
    const diffD = Math.floor(diffH / 24)
    if (diffD === 1) return "Ontem"
    if (diffD < 7) return `Há ${diffD} dias`
    return d.toLocaleDateString("pt-BR")
  }

  const counts = {
    novo:       leads.filter((l) => l.status === "novo").length,
    em_contato: leads.filter((l) => l.status === "em_contato").length,
    convertido: leads.filter((l) => l.status === "convertido").length,
  }

  return (
    <div>
      {/* Banner de conflito */}
      {conflicts.length > 0 && (
        <div className="mb-6 flex items-start gap-3 p-4 bg-amber-900/15 border border-amber-700/40 rounded-xl">
          <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-amber-300 font-sans text-sm font-medium leading-snug">
              {conflicts.length === 1
                ? "1 dos seus clientes também foi captado por outro corretor."
                : `${conflicts.length} dos seus clientes também foram captados por outro corretor.`}
            </p>
            <p className="text-amber-400/60 font-sans text-xs mt-0.5">
              Verifique os leads marcados abaixo e entre em contato com seu cliente.
            </p>
          </div>
          <button
            onClick={acknowledgeAll}
            className="flex-shrink-0 text-[10px] uppercase tracking-[0.15em] font-sans text-amber-400/70 hover:text-amber-300 border border-amber-700/40 hover:border-amber-600/60 px-3 py-1.5 rounded-lg transition-colors"
          >
            Reconhecer todos
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Novos",       value: counts.novo,       color: "text-blue-400",    icon: MessageSquare },
          { label: "Em Contato",  value: counts.em_contato, color: "text-amber-400",   icon: Phone },
          { label: "Convertidos", value: counts.convertido, color: "text-emerald-400", icon: Home },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Icon size={14} className={s.color} />
                <p className="text-muted-foreground text-xs uppercase tracking-wider font-sans">{s.label}</p>
              </div>
              <p className="font-serif text-3xl font-bold text-white">{s.value}</p>
            </div>
          )
        })}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Filtrar por nome, telefone ou imóvel..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-card border border-border text-white placeholder-muted-foreground/40 px-4 py-3 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/40 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold text-white">Mensagens Recebidas</h2>
          <span className="text-muted-foreground/50 text-xs font-sans">{filtered.length} leads</span>
        </div>

        <div className="grid grid-cols-12 gap-4 px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-sans border-b border-border">
          <span className="col-span-3">Contato</span>
          <span className="col-span-3">Imóvel</span>
          <span className="col-span-2">Origem</span>
          <span className="col-span-2 flex items-center gap-1"><Clock size={9} /> Hora</span>
          <span className="col-span-2">Status</span>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground/50 font-sans text-sm">
              Nenhum lead encontrado.
            </div>
          ) : (
            filtered.map((lead) => {
              const isConflicted = conflictedLeadIds.has(lead.id)
              const conflictItem = conflicts.find((c) => c.original_lead_id === lead.id)
              return (
              <div key={lead.id} className={`relative ${isConflicted ? "bg-amber-900/5" : ""}`}>
                {isConflicted && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-500/50 rounded-full" />}
                <div
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors cursor-pointer"
                  onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
                >
                  <div className="col-span-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-foreground/80 text-sm font-sans font-medium">{lead.name}</p>
                      {isConflicted && conflictItem && (
                        <button
                          onClick={(e) => { e.stopPropagation(); acknowledgeConflict(conflictItem.id) }}
                          title="Reconhecer e dispensar aviso"
                          className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-900/30 border border-amber-700/40 text-amber-400 rounded-full text-[9px] font-sans uppercase tracking-wide hover:bg-amber-900/50 transition-colors"
                        >
                          <AlertTriangle size={8} /> conflito
                          <X size={7} className="ml-0.5 opacity-60" />
                        </button>
                      )}
                    </div>
                    <a
                      href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-muted-foreground hover:text-gold text-xs font-sans flex items-center gap-1 mt-0.5 transition-colors"
                    >
                      <Phone size={9} />{lead.phone}
                    </a>
                  </div>

                  <div className="col-span-3">
                    <p className="text-muted-foreground text-xs font-sans flex items-center gap-1">
                      <Home size={9} className="text-gold/40 flex-shrink-0" />
                      <span className="truncate">{lead.property?.title ?? lead.property_slug ?? "—"}</span>
                    </p>
                  </div>

                  <div className="col-span-2">
                    <span className="text-muted-foreground text-xs font-sans capitalize">{lead.source}</span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-muted-foreground/60 text-xs font-sans">{formatDate(lead.created_at)}</span>
                  </div>

                  <div className="col-span-1 relative">
                    <button
                      disabled={updating === lead.id}
                      onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === lead.id ? null : lead.id) }}
                      className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border uppercase tracking-wider cursor-pointer transition-opacity ${statusCls(lead.status)} ${updating === lead.id ? "opacity-50" : ""}`}
                    >
                      {statusLabel(lead.status)}
                      <ChevronDown size={9} />
                    </button>

                    {openDropdown === lead.id && (
                      <div className="absolute top-8 left-0 z-20 bg-[#1a1a1a] border border-border rounded-xl overflow-hidden shadow-2xl min-w-[130px]">
                        {STATUS_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={(e) => { e.stopPropagation(); updateStatus(lead.id, opt.value) }}
                            className={`w-full text-left px-4 py-2.5 text-xs font-sans hover:bg-muted/50 transition-colors ${lead.status === opt.value ? "text-gold" : "text-foreground/60"}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="col-span-1 flex justify-end">
                    {expandedId === lead.id
                      ? <ChevronUp size={13} className="text-muted-foreground/40" />
                      : <ChevronDown size={13} className="text-muted-foreground/20" />
                    }
                  </div>
                </div>

                {expandedId === lead.id && (
                  <div className="px-6 pb-4 bg-white/[0.015] border-t border-white/[0.04]">
                    <div className="mt-3 flex flex-wrap gap-4 text-xs font-sans">
                      {lead.notes && (
                        <p className="text-muted-foreground w-full">
                          <span className="text-foreground/40 uppercase tracking-wider text-[10px] mr-2">Mensagem</span>
                          {lead.notes}
                        </p>
                      )}
                      {lead.cidade_cliente && (
                        <span className="text-muted-foreground">
                          <span className="text-foreground/40 uppercase tracking-wider text-[10px] mr-1">Cidade</span>
                          {lead.cidade_cliente}
                        </span>
                      )}
                      {lead.perfil_imovel && (
                        <span className="text-muted-foreground">
                          <span className="text-foreground/40 uppercase tracking-wider text-[10px] mr-1">Perfil</span>
                          {lead.perfil_imovel}
                        </span>
                      )}
                      {(lead.preco_min || lead.preco_max) && (
                        <span className="text-muted-foreground">
                          <span className="text-foreground/40 uppercase tracking-wider text-[10px] mr-1">Faixa</span>
                          {lead.preco_min ? `R$ ${lead.preco_min.toLocaleString("pt-BR")}` : "—"}
                          {" "}-{" "}
                          {lead.preco_max ? `R$ ${lead.preco_max.toLocaleString("pt-BR")}` : "—"}
                        </span>
                      )}
                      {lead.tipo_negociacao && (
                        <span className="text-muted-foreground">
                          <span className="text-foreground/40 uppercase tracking-wider text-[10px] mr-1">Negociação</span>
                          {lead.tipo_negociacao}
                        </span>
                      )}
                    </div>
                    {lead.property?.slug && (
                      <Link
                        href={`/imovel/${lead.property.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-gold/70 hover:text-gold text-xs font-sans transition-colors mt-2 w-fit"
                      >
                        <ExternalLink size={11} /> Ver imóvel
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )})
          )}
        </div>
      </div>
    </div>
  )
}
