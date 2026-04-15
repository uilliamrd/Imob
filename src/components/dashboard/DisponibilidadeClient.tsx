"use client"

import { useState } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { ChevronDown, ChevronUp, Building2, Check, Clock, X } from "lucide-react"
import type { Property, Development } from "@/types/database"

const STATUS_OPTIONS = [
  { value: "disponivel", label: "Disponível", cls: "bg-emerald-900/30 text-emerald-300 border-emerald-700/40", dot: "bg-emerald-400" },
  { value: "reserva",    label: "Reservado",  cls: "bg-amber-900/30 text-amber-300 border-amber-700/40",    dot: "bg-amber-400"   },
  { value: "vendido",    label: "Vendido",    cls: "bg-zinc-800 text-zinc-400 border-zinc-700/40",           dot: "bg-zinc-500"    },
] as const

type Status = "disponivel" | "reserva" | "vendido"

interface Props {
  developments: Development[]
  properties: Property[]
}

export function DisponibilidadeClient({ developments, properties: initial }: Props) {
  const [properties, setProperties] = useState(initial)
  const [expanded, setExpanded] = useState<string | null>(developments[0]?.id ?? null)
  const [saving, setSaving] = useState<string | null>(null)

  // Unidades sem empreendimento
  const standalone = properties.filter((p) => !p.development_id)

  async function updateStatus(propertyId: string, status: Status) {
    setSaving(propertyId)
    const supabase = createClient()
    await supabase.from("properties").update({ status }).eq("id", propertyId)
    setProperties((prev) => prev.map((p) => p.id === propertyId ? { ...p, status } : p))
    setSaving(null)
  }

  function renderTable(props: Property[]) {
    if (props.length === 0) {
      return <p className="text-white/20 text-sm font-sans py-6 text-center">Nenhuma unidade cadastrada.</p>
    }

    const totals = {
      disponivel: props.filter((p) => p.status === "disponivel").length,
      reserva:    props.filter((p) => p.status === "reserva").length,
      vendido:    props.filter((p) => p.status === "vendido").length,
    }

    return (
      <>
        {/* Mini stats */}
        <div className="flex gap-4 mb-4 px-1">
          {STATUS_OPTIONS.map((s) => (
            <div key={s.value} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${s.dot}`} />
              <span className="text-white/30 text-xs font-sans">{totals[s.value]} {s.label}</span>
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="grid grid-cols-12 gap-3 px-4 py-2.5 text-[10px] uppercase tracking-[0.15em] text-white/20 font-sans border-b border-white/5">
          <span className="col-span-4">Unidade</span>
          <span className="col-span-2 text-center">Área</span>
          <span className="col-span-2 text-center">Dorms</span>
          <span className="col-span-2 text-right">Preço</span>
          <span className="col-span-2 text-right">Status</span>
        </div>

        <div className="divide-y divide-white/[0.03]">
          {props.map((p) => {
            const currentStatus = STATUS_OPTIONS.find((s) => s.value === p.status) ?? STATUS_OPTIONS[0]
            return (
              <div key={p.id} className="grid grid-cols-12 gap-3 px-4 py-3 items-center hover:bg-white/[0.02] transition-colors">
                <div className="col-span-4">
                  <p className="text-white/80 text-sm font-sans">{p.title}</p>
                  {p.code && <p className="text-white/20 text-[10px] font-sans">#{p.code}</p>}
                </div>
                <div className="col-span-2 text-center text-white/40 text-xs font-sans">
                  {p.features.area_m2 ? `${p.features.area_m2} m²` : "—"}
                </div>
                <div className="col-span-2 text-center text-white/40 text-xs font-sans">
                  {p.features.suites ? `${p.features.suites} suítes` : p.features.dormitorios ? `${p.features.dormitorios} dorms` : "—"}
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-white/60 text-xs font-sans">
                    {p.price >= 1_000_000
                      ? "R$ " + (p.price / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "M"
                      : "R$ " + p.price.toLocaleString("pt-BR")}
                  </span>
                </div>
                <div className="col-span-2 flex justify-end">
                  <div className="relative group">
                    <button className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full border uppercase tracking-wider transition-colors ${currentStatus.cls} ${saving === p.id ? "opacity-50" : ""}`}>
                      {saving === p.id
                        ? <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                        : <div className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot}`} />
                      }
                      {currentStatus.label}
                    </button>
                    {/* Dropdown on hover */}
                    <div className="absolute right-0 top-full mt-1 w-36 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-2xl z-10 hidden group-hover:block">
                      {STATUS_OPTIONS.map((s) => (
                        <button key={s.value} onClick={() => updateStatus(p.id, s.value as Status)}
                          className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-sans hover:bg-white/5 transition-colors ${p.status === s.value ? "text-gold" : "text-white/60"}`}>
                          {p.status === s.value ? <Check size={11} /> : <div className={`w-2 h-2 rounded-full ${s.dot}`} />}
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </>
    )
  }

  return (
    <div className="space-y-4">
      {developments.map((dev) => {
        const devProps = properties.filter((p) => p.development_id === dev.id)
        const isExpanded = expanded === dev.id
        return (
          <div key={dev.id} className="bg-[#161616] border border-white/5 rounded-2xl overflow-hidden">
            <button
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
              onClick={() => setExpanded(isExpanded ? null : dev.id)}
            >
              <div className="flex items-center gap-3">
                {dev.cover_image
                  ? <Image src={dev.cover_image} alt="" width={36} height={36} className="w-9 h-9 rounded-lg object-cover border border-white/10" />
                  : <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center"><Building2 size={15} className="text-white/20" /></div>
                }
                <div className="text-left">
                  <p className="text-white/80 text-sm font-sans font-medium">{dev.name}</p>
                  <p className="text-white/25 text-xs font-sans">{devProps.length} unidades</p>
                </div>
              </div>
              {isExpanded ? <ChevronUp size={14} className="text-white/20" /> : <ChevronDown size={14} className="text-white/20" />}
            </button>
            {isExpanded && (
              <div className="border-t border-white/5 py-2">
                {renderTable(devProps)}
              </div>
            )}
          </div>
        )
      })}

      {standalone.length > 0 && (
        <div className="bg-[#161616] border border-white/5 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 flex items-center gap-2 border-b border-white/5">
            <X size={14} className="text-white/20" />
            <p className="text-white/40 text-sm font-sans">Sem empreendimento</p>
          </div>
          <div className="py-2">{renderTable(standalone)}</div>
        </div>
      )}

      {developments.length === 0 && standalone.length === 0 && (
        <div className="py-16 text-center text-white/20 font-sans">
          Nenhuma unidade encontrada. Cadastre imóveis primeiro.
        </div>
      )}
    </div>
  )
}
