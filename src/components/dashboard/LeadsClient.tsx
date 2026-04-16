"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Phone, Home, Clock, ChevronDown, MessageSquare } from "lucide-react"
import type { Lead, LeadStatus } from "@/types/database"

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

interface Props {
  initialLeads: Lead[]
}

export function LeadsClient({ initialLeads }: Props) {
  const [leads, setLeads] = useState(initialLeads)
  const [updating, setUpdating] = useState<string | null>(null)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [search, setSearch] = useState("")

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
            filtered.map((lead) => (
              <div key={lead.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors relative">
                <div className="col-span-3">
                  <p className="text-foreground/80 text-sm font-sans font-medium">{lead.name}</p>
                  <a
                    href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
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

                <div className="col-span-2 relative">
                  <button
                    disabled={updating === lead.id}
                    onClick={() => setOpenDropdown(openDropdown === lead.id ? null : lead.id)}
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
                          onClick={() => updateStatus(lead.id, opt.value)}
                          className={`w-full text-left px-4 py-2.5 text-xs font-sans hover:bg-muted/50 transition-colors ${lead.status === opt.value ? "text-gold" : "text-foreground/60"}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
