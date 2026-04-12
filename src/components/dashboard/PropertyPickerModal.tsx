"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Search, X, Plus, Check, Maximize2, BedDouble, Car, Hash, Building2 } from "lucide-react"
import type { Property, Development } from "@/types/database"

function formatPrice(price: number) {
  if (price >= 1_000_000)
    return "R$ " + (price / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1 }) + " Mi"
  return "R$ " + price.toLocaleString("pt-BR")
}

interface PropertyPickerModalProps {
  onClose: () => void
  onAdd: (propertyId: string) => void
  alreadyAdded: string[]
  orgId?: string | null
  userId?: string
}

export function PropertyPickerModal({ onClose, onAdd, alreadyAdded, orgId, userId }: PropertyPickerModalProps) {
  const [searchDev, setSearchDev] = useState("")
  const [searchApto, setSearchApto] = useState("")
  const [selectedDev, setSelectedDev] = useState<Development | null>(null)
  const [devResults, setDevResults] = useState<Development[]>([])
  const [results, setResults] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)
  const [adding, setAdding] = useState<string | null>(null)
  const [addedNow, setAddedNow] = useState<Set<string>>(new Set())

  async function searchDevelopments(q: string) {
    if (!q.trim()) { setDevResults([]); return }
    const supabase = createClient()
    const { data } = await supabase.from("developments").select("*").ilike("name", `%${q}%`).limit(8)
    setDevResults((data ?? []) as Development[])
  }

  async function loadUnitsForDev(dev: Development) {
    setSelectedDev(dev)
    setDevResults([])
    setSearchDev(dev.name)
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("properties")
      .select("*")
      .eq("development_id", dev.id)
      .order("title")
    setResults((data ?? []) as Property[])
    setLoading(false)
  }

  async function searchByApto(q: string) {
    setSearchApto(q)
    if (!q.trim() && !selectedDev) return
    setLoading(true)
    const supabase = createClient()
    let query = supabase.from("properties").select("*").eq("visibility", "publico").order("title").limit(30)
    if (selectedDev) query = query.eq("development_id", selectedDev.id)
    if (q.trim()) query = query.ilike("title", `%${q}%`)
    const { data } = await query
    setResults((data ?? []) as Property[])
    setLoading(false)
  }

  async function handleAdd(propertyId: string) {
    setAdding(propertyId)
    const supabase = createClient()
    await supabase.from("property_listings").insert({
      property_id: propertyId,
      org_id: orgId ?? null,
      user_id: userId ?? null,
    })
    onAdd(propertyId)
    setAddedNow((prev) => new Set([...prev, propertyId]))
    setAdding(null)
  }

  const isAdded = (id: string) => alreadyAdded.includes(id) || addedNow.has(id)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#161616] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col mx-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <h2 className="font-serif text-xl font-semibold text-white">Adicionar Imóvel do Sistema</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Search area */}
        <div className="px-6 py-4 border-b border-white/5 space-y-3">
          {/* Search by development */}
          <div className="relative">
            <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input type="text" placeholder="Buscar por empreendimento (nome do prédio/condomínio)..."
              value={searchDev}
              onChange={(e) => { setSearchDev(e.target.value); searchDevelopments(e.target.value) }}
              className="w-full bg-[#111] border border-white/10 text-white placeholder-white/20 pl-9 pr-4 py-2.5 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/50 transition-colors"
            />
            {/* Dev autocomplete */}
            {devResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden z-10 shadow-xl">
                {devResults.map((dev) => (
                  <button key={dev.id} type="button" onClick={() => loadUnitsForDev(dev)}
                    className="w-full text-left px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                    <p className="text-white/90 text-sm font-sans">{dev.name}</p>
                    {(dev.neighborhood || dev.city) && (
                      <p className="text-white/30 text-xs font-sans">{dev.neighborhood}{dev.city ? `, ${dev.city}` : ""}</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter by unit */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input type="text" placeholder="Filtrar por nº do apto, quadra/lote ou título..."
              value={searchApto}
              onChange={(e) => searchByApto(e.target.value)}
              onFocus={() => { if (selectedDev && results.length === 0) loadUnitsForDev(selectedDev) }}
              className="w-full bg-[#111] border border-white/10 text-white placeholder-white/20 pl-9 pr-4 py-2.5 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/50 transition-colors"
            />
          </div>

          {selectedDev && (
            <div className="flex items-center gap-2 text-xs text-gold/70 font-sans">
              <Building2 size={11} />
              <span>Empreendimento: <strong>{selectedDev.name}</strong></span>
              <button onClick={() => { setSelectedDev(null); setSearchDev(""); setResults([]) }}
                className="ml-1 text-white/30 hover:text-white/60">
                <X size={11} />
              </button>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {loading && <div className="px-6 py-8 text-center text-white/30 text-sm font-sans">Buscando...</div>}
          {!loading && results.length === 0 && (
            <div className="px-6 py-10 text-center text-white/20 text-sm font-sans">
              {selectedDev
                ? "Nenhum imóvel encontrado neste empreendimento."
                : "Busque por um empreendimento para ver os imóveis disponíveis."}
            </div>
          )}
          {results.map((p) => {
            const added = isAdded(p.id)
            return (
              <div key={p.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02]">
                {p.images[0] ? (
                  <img src={p.images[0]} alt="" className="w-16 h-11 rounded-lg object-cover border border-white/10 flex-shrink-0" />
                ) : (
                  <div className="w-16 h-11 rounded-lg bg-white/5 flex-shrink-0 flex items-center justify-center">
                    <span className="font-serif text-white/20 text-xl">R</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {p.code && <span className="text-white/20 text-[10px] font-sans flex items-center gap-0.5"><Hash size={9}/>{p.code}</span>}
                    <p className="text-white/90 text-sm font-sans truncate font-medium">{p.title}</p>
                  </div>
                  <div className="flex items-center gap-3 text-white/30 text-xs font-sans mt-0.5">
                    {p.features.numero_apto && <span>Apto {p.features.numero_apto}</span>}
                    {p.neighborhood && <span>{p.neighborhood}</span>}
                    {p.features.area_m2 && <span className="flex items-center gap-0.5"><Maximize2 size={9}/>{p.features.area_m2}m²</span>}
                    {(p.features.suites || p.features.dormitorios) && (
                      <span className="flex items-center gap-0.5">
                        <BedDouble size={9}/>{p.features.suites ?? p.features.dormitorios}
                      </span>
                    )}
                    {p.features.vagas && <span className="flex items-center gap-0.5"><Car size={9}/>{p.features.vagas}v</span>}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <p className="text-gold font-serif text-sm font-semibold">{formatPrice(p.price)}</p>
                  <button onClick={() => !added && handleAdd(p.id)} disabled={added || adding === p.id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans transition-colors ${
                      added ? "bg-emerald-900/20 text-emerald-400 border border-emerald-700/40 cursor-default"
                            : "bg-gold text-graphite hover:bg-gold-light disabled:opacity-50"
                    }`}>
                    {added ? <><Check size={11}/> Adicionado</> : adding === p.id ? "..." : <><Plus size={11}/> Adicionar</>}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="px-6 py-4 border-t border-white/5 flex justify-between items-center">
          <p className="text-white/20 text-xs font-sans">{results.length > 0 ? `${results.length} imóvel(is) encontrado(s)` : ""}</p>
          <button onClick={onClose} className="text-white/30 text-sm font-sans hover:text-white/60 transition-colors">Fechar</button>
        </div>
      </div>
    </div>
  )
}
