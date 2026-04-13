"use client"

import { useState, useTransition } from "react"
import { createClient } from "@/lib/supabase/client"
import { Search, Plus, Check, BedDouble, Car, Maximize2, SlidersHorizontal, X, Eye, ChevronDown, ChevronUp, MapPin, Hash } from "lucide-react"
import type { Property, UserRole } from "@/types/database"

function formatPrice(price: number) {
  if (price >= 1_000_000)
    return "R$ " + (price / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + " Mi"
  return "R$ " + price.toLocaleString("pt-BR")
}

interface Props {
  properties: Property[]
  listedIds: Set<string>
  userId: string
  orgId: string | null
  role: UserRole
}

export function VitrineClient({ properties, listedIds: initial, userId, orgId, role }: Props) {
  const [listed, setListed] = useState(initial)
  const [search, setSearch] = useState("")
  const [filterDorms, setFilterDorms] = useState<number | null>(null)
  const [filterMin, setFilterMin] = useState("")
  const [filterMax, setFilterMax] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const filtered = properties.filter((p) => {
    const q = search.toLowerCase()
    const matchSearch = !q || p.title.toLowerCase().includes(q) || (p.neighborhood ?? "").toLowerCase().includes(q) || (p.city ?? "").toLowerCase().includes(q)
    const matchDorms = filterDorms === null || (p.features.suites ?? p.features.dormitorios ?? 0) >= filterDorms
    const matchMin = !filterMin || p.price >= Number(filterMin.replace(/\D/g, ""))
    const matchMax = !filterMax || p.price <= Number(filterMax.replace(/\D/g, ""))
    return matchSearch && matchDorms && matchMin && matchMax
  })

  async function toggleListing(propertyId: string) {
    const supabase = createClient()
    const isListed = listed.has(propertyId)

    startTransition(async () => {
      if (isListed) {
        const q = supabase.from("property_listings").delete()
        if (role === "imobiliaria" && orgId) q.eq("org_id", orgId)
        else q.eq("user_id", userId)
        await q.eq("property_id", propertyId)
        setListed((prev) => { const next = new Set(prev); next.delete(propertyId); return next })
      } else {
        await supabase.from("property_listings").insert({
          property_id: propertyId,
          user_id: userId,
          org_id: orgId ?? null,
        })
        setListed((prev) => new Set(prev).add(propertyId))
      }
    })
  }

  const activeFilters = (filterDorms !== null ? 1 : 0) + (filterMin ? 1 : 0) + (filterMax ? 1 : 0)

  return (
    <div>
      {/* Search + filter bar */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            placeholder="Buscar por nome, bairro, cidade... (ex: Bela Vista 402)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#161616] border border-white/10 text-white placeholder-white/20 pl-9 pr-4 py-3 rounded-xl font-sans text-sm focus:outline-none focus:border-gold/40 transition-colors"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-xs uppercase tracking-[0.15em] font-sans transition-colors ${
            showFilters || activeFilters > 0 ? "border-gold/50 text-gold bg-gold/10" : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
          }`}
        >
          <SlidersHorizontal size={14} />
          Filtros {activeFilters > 0 && `(${activeFilters})`}
        </button>
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <div className="bg-[#161616] border border-white/5 rounded-xl p-4 mb-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-white/30 font-sans block mb-1.5">Dormitórios mín.</label>
            <div className="flex gap-1">
              {[null, 1, 2, 3, 4].map((n) => (
                <button key={n ?? "all"} onClick={() => setFilterDorms(n)}
                  className={`flex-1 py-1.5 rounded text-xs font-sans transition-colors ${
                    filterDorms === n ? "bg-gold text-graphite" : "bg-white/5 text-white/40 hover:bg-white/10"
                  }`}>
                  {n === null ? "Todos" : `${n}+`}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-white/30 font-sans block mb-1.5">Preço mín.</label>
            <input type="text" placeholder="R$ 0" value={filterMin} onChange={(e) => setFilterMin(e.target.value)}
              className="w-full bg-[#111] border border-white/10 text-white placeholder-white/20 px-3 py-1.5 rounded font-sans text-sm focus:outline-none focus:border-gold/40" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.15em] text-white/30 font-sans block mb-1.5">Preço máx.</label>
            <input type="text" placeholder="R$ 99.999.999" value={filterMax} onChange={(e) => setFilterMax(e.target.value)}
              className="w-full bg-[#111] border border-white/10 text-white placeholder-white/20 px-3 py-1.5 rounded font-sans text-sm focus:outline-none focus:border-gold/40" />
          </div>
          <div className="flex items-end">
            <button onClick={() => { setFilterDorms(null); setFilterMin(""); setFilterMax("") }}
              className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-xs font-sans transition-colors">
              <X size={12} /> Limpar filtros
            </button>
          </div>
        </div>
      )}

      {/* Count */}
      <p className="text-white/20 text-xs font-sans mb-4">{filtered.length} imóveis encontrados · {listed.size} no seu portfólio</p>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((p) => {
          const isListed = listed.has(p.id)
          return (
            <div key={p.id} className={`bg-[#161616] border rounded-2xl overflow-hidden transition-all duration-200 ${
              isListed ? "border-gold/30" : "border-white/5 hover:border-white/10"
            }`}>
              {/* Thumbnail */}
              <div className="relative aspect-video bg-[#111]">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white/10 text-xs font-sans">Sem foto</span>
                  </div>
                )}
                {isListed && (
                  <div className="absolute top-2 right-2 bg-gold text-graphite text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-sans">
                    No portfólio
                  </div>
                )}
              </div>

              <div className="p-4">
                {p.code && (
                  <div className="flex items-center gap-1 text-white/20 text-[10px] font-sans mb-1">
                    <Hash size={9} />{p.code}
                  </div>
                )}
                <p className="font-serif text-white font-semibold text-base leading-tight mb-1">{p.title}</p>
                {(p.neighborhood || p.city) && (
                  <p className="text-white/30 text-xs font-sans mb-3 flex items-center gap-1">
                    <MapPin size={10} />{p.neighborhood}{p.city ? `, ${p.city}` : ""}
                  </p>
                )}

                <div className="flex items-center gap-3 text-white/40 text-xs font-sans mb-3">
                  {(p.features.suites || p.features.dormitorios) && (
                    <span className="flex items-center gap-1">
                      <BedDouble size={11} className="text-gold/50" />
                      {p.features.suites ? `${p.features.suites} suítes` : `${p.features.dormitorios} dorms`}
                    </span>
                  )}
                  {p.features.vagas && (
                    <span className="flex items-center gap-1"><Car size={11} className="text-gold/50" />{p.features.vagas} vaga{p.features.vagas > 1 ? "s" : ""}</span>
                  )}
                  {p.features.area_m2 && (
                    <span className="flex items-center gap-1"><Maximize2 size={11} className="text-gold/50" />{p.features.area_m2} m²</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-serif text-gold text-base font-semibold">{formatPrice(p.price)}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpanded(expanded === p.id ? null : p.id)}
                      className="p-1.5 rounded-lg border border-white/10 text-white/30 hover:text-gold hover:border-gold/30 transition-colors"
                      title="Ver detalhes"
                    >
                      {expanded === p.id ? <ChevronUp size={12} /> : <Eye size={12} />}
                    </button>
                    <button
                      onClick={() => toggleListing(p.id)}
                      disabled={pending}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs uppercase tracking-[0.1em] font-sans transition-all duration-200 ${
                        isListed
                          ? "bg-gold/10 border border-gold/30 text-gold hover:bg-red-900/20 hover:border-red-500/30 hover:text-red-400"
                          : "bg-white/5 border border-white/10 text-white/50 hover:bg-gold/10 hover:border-gold/30 hover:text-gold"
                      }`}
                    >
                      {isListed ? <><Check size={11} /> Adicionado</> : <><Plus size={11} /> Adicionar</>}
                    </button>
                  </div>
                </div>

                {/* Detail panel */}
                {expanded === p.id && (
                  <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                    {p.description && (
                      <p className="text-white/40 text-xs font-sans leading-relaxed line-clamp-4">{p.description}</p>
                    )}
                    <div className="grid grid-cols-2 gap-1 text-[11px] font-sans text-white/30">
                      {p.features.area_total && <span>Área total: {p.features.area_total}m²</span>}
                      {p.features.area_terreno && <span>Terreno: {p.features.area_terreno}m²</span>}
                      {p.features.banheiros && <span>Banheiros: {p.features.banheiros}</span>}
                      {p.features.dormitorios && <span>Dormitórios: {p.features.dormitorios}</span>}
                    </div>
                    <div className="flex gap-2 pt-1">
                      <a href={`/imovel/${p.slug}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-white/40 hover:text-gold hover:border-gold/30 transition-colors text-xs font-sans">
                        <Eye size={11} /> Ver página pública
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-20 text-center text-white/20 font-sans">
          Nenhum imóvel encontrado com os filtros aplicados.
        </div>
      )}
    </div>
  )
}
