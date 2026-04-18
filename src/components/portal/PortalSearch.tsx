"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Search, X, SlidersHorizontal, MapPin, BedDouble, Maximize2, Car,
  Building2, ArrowRight, Home, ChevronDown, ChevronUp, Sparkles, Star
} from "lucide-react"
import type { PortalProperty, PortalOrg } from "@/app/(portal)/page"

interface Props {
  properties: PortalProperty[]
  construtoras: PortalOrg[]
  superDestaques?: PortalProperty[]
  destaqueIds?: Set<string>
}

const CATEGORIAS = [
  "Apartamento", "Casa", "Casa em Condomínio", "Cobertura",
  "Kitnet / Studio", "Terreno", "Lote em Condomínio Fechado", "Lote em Rua",
  "Sala Comercial", "Loja", "Galpão / Depósito", "Sítio / Fazenda",
]

function parseBRNumber(val: string): number {
  return parseInt(val.replace(/\./g, "").replace(",", ".")) || 0
}

function maskBRNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  if (!digits) return ""
  return Number(digits).toLocaleString("pt-BR")
}

function formatPrice(price: number) {
  if (price >= 1_000_000)
    return "R$ " + (price / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + " Mi"
  return "R$ " + price.toLocaleString("pt-BR")
}

export function PortalSearch({ properties, construtoras, superDestaques = [], destaqueIds = new Set() }: Props) {
  const [search, setSearch]             = useState("")
  const [filterNegocio, setNegocio]     = useState("")
  const [filterCategoria, setCategoria] = useState("")
  const [filterCity, setCity]           = useState("")
  const [filterBairro, setBairro]       = useState("")
  const [filterBeds, setBeds]           = useState("")
  const [filterVagas, setVagas]         = useState("")
  const [priceMin, setPriceMin]         = useState("")
  const [priceMax, setPriceMax]         = useState("")
  const [filterOrg, setOrg]             = useState("")
  const [filterDev, setDev]             = useState("")
  const [showFilters, setShowFilters]   = useState(false)

  // Derived filter options
  const cityOptions = Array.from(
    new Set(properties.map((p) => p.city).filter(Boolean) as string[])
  ).sort((a, b) => a.localeCompare(b, "pt-BR"))

  const bairroOptions = Array.from(
    new Set(
      properties
        .filter((p) => !filterCity || p.city === filterCity)
        .map((p) => p.neighborhood)
        .filter(Boolean) as string[]
    )
  ).sort((a, b) => a.localeCompare(b, "pt-BR"))

  const devOptions = Array.from(
    new Map(
      properties
        .filter((p) => p.development && (!filterOrg || p.org_id === filterOrg))
        .map((p) => [p.development!.id, p.development!])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))

  // Filtering
  const filtered = properties.filter((p) => {
    const q = search.toLowerCase()
    const matchText = !q ||
      p.title.toLowerCase().includes(q) ||
      (p.neighborhood ?? "").toLowerCase().includes(q) ||
      (p.city ?? "").toLowerCase().includes(q)
    const matchNegocio = !filterNegocio || p.tipo_negocio === filterNegocio
    const matchCategoria = !filterCategoria || p.categoria === filterCategoria
    const matchCity = !filterCity || p.city === filterCity
    const matchBairro = !filterBairro || p.neighborhood === filterBairro
    const minBeds = filterBeds ? parseInt(filterBeds) : 0
    const beds = (p.features.dormitorios ?? p.features.suites ?? p.features.quartos ?? 0) as number
    const matchBeds = !minBeds || beds >= minBeds
    const minVagas = filterVagas ? parseInt(filterVagas) : 0
    const vagas = (p.features.vagas ?? 0) as number
    const matchVagas = !minVagas || vagas >= minVagas
    const numPriceMin = parseBRNumber(priceMin)
    const numPriceMax = parseBRNumber(priceMax)
    const matchPrice = (!numPriceMin || p.price >= numPriceMin) && (!numPriceMax || p.price <= numPriceMax)
    const matchOrg = !filterOrg || p.org_id === filterOrg
    const matchDev = !filterDev || p.development_id === filterDev
    return matchText && matchNegocio && matchCategoria && matchCity && matchBairro && matchBeds && matchVagas && matchPrice && matchOrg && matchDev
  })

  // Sort: destaques first, then by date
  const sortedFiltered = [
    ...filtered.filter((p) => destaqueIds.has(p.id)),
    ...filtered.filter((p) => !destaqueIds.has(p.id)),
  ]

  const activeFilters = [filterNegocio, filterCategoria, filterCity, filterBairro, filterBeds, filterVagas, priceMin, priceMax, filterOrg, filterDev]
    .filter(Boolean).length

  function clearAll() {
    setSearch(""); setNegocio(""); setCategoria(""); setCity(""); setBairro(""); setBeds(""); setVagas(""); setPriceMin(""); setPriceMax(""); setOrg(""); setDev("")
  }

  const SELECT_CLASS =
    "bg-card border border-border text-foreground/70 px-3 py-2.5 rounded-xl font-sans text-sm focus:outline-none focus:border-gold/40 transition-colors min-w-0"

  return (
    <div>
      {/* Construtoras em destaque */}
      {construtoras.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs uppercase tracking-[0.25em] text-gold/60 font-sans">Construtoras</p>
            <Link href="/construtoras" className="text-xs font-sans text-muted-foreground hover:text-gold transition-colors">
              Ver todas →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {construtoras.map((org) => {
              const accent = org.brand_colors?.primary ?? "#C9A96E"
              return (
                <Link
                  key={org.id}
                  href={`/construtora/${org.slug}`}
                  className="flex flex-col items-center gap-2 p-4 bg-card border border-border hover:border-gold/30 rounded-xl transition-colors text-center"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: accent + "20" }}>
                    {org.logo ? (
                      <Image src={org.logo} alt={org.name} width={32} height={32} className="object-contain" />
                    ) : (
                      <Building2 size={18} style={{ color: accent }} />
                    )}
                  </div>
                  <div className="w-full">
                    <p className="font-sans text-xs text-foreground font-medium leading-tight line-clamp-2">{org.name}</p>
                    {org.hero_tagline && (
                      <p className="text-[10px] font-sans text-muted-foreground mt-0.5 line-clamp-1">{org.hero_tagline}</p>
                    )}
                    {org.availableCount > 0 && (
                      <p className="text-[10px] font-sans mt-1" style={{ color: accent }}>
                        {org.availableCount} disponível{org.availableCount !== 1 ? "is" : ""}
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Search bar */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por título, bairro ou cidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border text-foreground placeholder-muted-foreground/40 pl-10 pr-4 py-3 rounded-xl font-sans text-sm focus:outline-none focus:border-gold/40 transition-colors"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-sans text-sm transition-colors ${
            activeFilters > 0
              ? "border-gold/40 text-gold bg-gold/5"
              : "border-border text-muted-foreground hover:border-gold/30 hover:text-foreground"
          }`}
        >
          <SlidersHorizontal size={15} />
          <span className="hidden sm:inline">Filtros</span>
          {activeFilters > 0 && (
            <span className="w-5 h-5 rounded-full bg-gold text-graphite text-[10px] font-bold flex items-center justify-center">
              {activeFilters}
            </span>
          )}
          {showFilters ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="bg-card border border-border rounded-xl p-4 mb-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <select value={filterNegocio} onChange={(e) => setNegocio(e.target.value)} className={SELECT_CLASS}>
            <option value="">Tipo de negócio</option>
            <option value="Venda">Venda</option>
            <option value="Locação">Locação</option>
          </select>

          <select value={filterCategoria} onChange={(e) => setCategoria(e.target.value)} className={SELECT_CLASS}>
            <option value="">Tipo</option>
            {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <select value={filterCity} onChange={(e) => { setCity(e.target.value); setBairro("") }} className={SELECT_CLASS}>
            <option value="">Cidade</option>
            {cityOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          {bairroOptions.length > 0 && (
            <select value={filterBairro} onChange={(e) => setBairro(e.target.value)} className={SELECT_CLASS}>
              <option value="">Bairro</option>
              {bairroOptions.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          )}

          <select value={filterBeds} onChange={(e) => setBeds(e.target.value)} className={SELECT_CLASS}>
            <option value="">Dormitórios</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
            <option value="4">4+</option>
          </select>

          <select value={filterVagas} onChange={(e) => setVagas(e.target.value)} className={SELECT_CLASS}>
            <option value="">Vagas</option>
            <option value="1">1+</option>
            <option value="2">2+</option>
            <option value="3">3+</option>
          </select>

          <input
            type="text"
            placeholder="Preço mínimo"
            value={priceMin}
            onChange={(e) => setPriceMin(maskBRNumber(e.target.value))}
            className={SELECT_CLASS}
          />
          <input
            type="text"
            placeholder="Preço máximo"
            value={priceMax}
            onChange={(e) => setPriceMax(maskBRNumber(e.target.value))}
            className={SELECT_CLASS}
          />

          <select
            value={filterOrg}
            onChange={(e) => { setOrg(e.target.value); setDev("") }}
            className={SELECT_CLASS}
          >
            <option value="">Construtora</option>
            {construtoras.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>

          {devOptions.length > 0 && (
            <select value={filterDev} onChange={(e) => setDev(e.target.value)} className={SELECT_CLASS}>
              <option value="">Empreendimento</option>
              {devOptions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          )}

          {activeFilters > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground text-xs font-sans transition-colors col-span-1"
            >
              <X size={12} /> Limpar filtros
            </button>
          )}
        </div>
      )}

      {/* ── Super Destaques ─────────────────────────────── */}
      {superDestaques.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={13} className="text-gold" />
            <p className="text-xs uppercase tracking-[0.25em] text-gold font-sans">Super Destaques</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {superDestaques.map((p) => (
              <Link
                key={p.id}
                href={`/imovel/${p.slug}`}
                className="group relative bg-card border-2 border-gold/40 hover:border-gold rounded-xl overflow-hidden transition-all duration-300 flex flex-col shadow-[0_0_24px_rgba(201,169,110,0.12)]"
              >
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {p.images[0] ? (
                    <Image src={p.images[0]} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Home size={24} className="text-muted-foreground/20" /></div>
                  )}
                  {/* Super Destaque badge */}
                  <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-gold text-graphite rounded-full text-[9px] font-sans uppercase tracking-wider font-semibold shadow-lg">
                    <Sparkles size={9} />
                    Super Destaque
                  </div>
                  {p.organization && (
                    <div className="absolute bottom-2 left-2">
                      <span className="text-[9px] px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-full font-sans text-white/70">{p.organization.name}</span>
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <p className="font-serif text-foreground text-sm font-semibold leading-tight line-clamp-2 mb-1">{p.title}</p>
                  {(p.neighborhood || p.city) && (
                    <p className="text-muted-foreground text-xs font-sans flex items-center gap-1 mb-3">
                      <MapPin size={9} className="flex-shrink-0" />
                      {[p.neighborhood, p.city].filter(Boolean).join(", ")}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-muted-foreground text-[11px] font-sans mb-3">
                    {p.features.area_m2 && <span className="flex items-center gap-1"><Maximize2 size={9} className="text-gold/50" />{p.features.area_m2}m²</span>}
                    {(p.features.suites || p.features.dormitorios || p.features.quartos) && (
                      <span className="flex items-center gap-1"><BedDouble size={9} className="text-gold/50" />{p.features.suites ?? p.features.dormitorios ?? p.features.quartos}</span>
                    )}
                    {p.features.vagas && <span className="flex items-center gap-1"><Car size={9} className="text-gold/50" />{p.features.vagas}v</span>}
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <p className="font-serif text-gold text-base font-semibold">{formatPrice(p.price)}</p>
                    <ArrowRight size={13} className="text-muted-foreground/30 group-hover:text-gold group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="divider-gold opacity-20 mt-8" />
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm font-sans text-muted-foreground">
          <span className="text-foreground font-medium">{filtered.length}</span>
          {filtered.length !== properties.length && (
            <span className="text-muted-foreground/50"> de {properties.length}</span>
          )}{" "}
          imóvel{filtered.length !== 1 ? "is" : ""}
        </p>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="py-24 text-center">
          <Home size={32} className="mx-auto text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground font-sans text-sm">
            {properties.length === 0
              ? "Nenhum imóvel disponível no portal ainda."
              : "Nenhum imóvel encontrado com os filtros aplicados."}
          </p>
          {activeFilters > 0 && (
            <button onClick={clearAll} className="mt-3 text-gold text-sm font-sans hover:underline">
              Limpar filtros
            </button>
          )}
        </div>
      )}

      {/* Property grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedFiltered.map((p) => {
          const isDestaque = destaqueIds.has(p.id)
          return (
          <Link
            key={p.id}
            href={`/imovel/${p.slug}`}
            className={`group bg-card rounded-xl overflow-hidden transition-all duration-300 flex flex-col ${
              isDestaque
                ? "border border-gold/40 hover:border-gold shadow-[0_0_16px_rgba(201,169,110,0.08)]"
                : "border border-border hover:border-gold/30"
            }`}
          >
            {/* Image */}
            <div className="aspect-video bg-muted relative overflow-hidden">
              {p.images[0] ? (
                <Image
                  src={p.images[0]}
                  alt={p.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Home size={24} className="text-muted-foreground/20" />
                </div>
              )}
              {isDestaque && (
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-gold/90 text-graphite rounded-full text-[9px] font-sans uppercase tracking-wider font-semibold">
                  <Star size={8} />
                  Destaque
                </div>
              )}
              {p.organization && (
                <div className="absolute bottom-2 left-2">
                  <span className="text-[9px] px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-full font-sans text-white/70">
                    {p.organization.name}
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
              <p className="font-serif text-foreground text-sm font-semibold leading-tight line-clamp-2 mb-1">
                {p.title}
              </p>
              {(p.neighborhood || p.city) && (
                <p className="text-muted-foreground text-xs font-sans flex items-center gap-1 mb-3">
                  <MapPin size={9} className="flex-shrink-0" />
                  {[p.neighborhood, p.city].filter(Boolean).join(", ")}
                </p>
              )}

              <div className="flex items-center gap-3 text-muted-foreground text-[11px] font-sans mb-3">
                {p.features.area_m2 && (
                  <span className="flex items-center gap-1">
                    <Maximize2 size={9} className="text-gold/50" />
                    {p.features.area_m2}m²
                  </span>
                )}
                {(p.features.suites || p.features.dormitorios || p.features.quartos) && (
                  <span className="flex items-center gap-1">
                    <BedDouble size={9} className="text-gold/50" />
                    {p.features.suites ?? p.features.dormitorios ?? p.features.quartos}
                  </span>
                )}
                {p.features.vagas && (
                  <span className="flex items-center gap-1">
                    <Car size={9} className="text-gold/50" />
                    {p.features.vagas}v
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between mt-auto">
                <p className="font-serif text-gold text-base font-semibold">
                  {formatPrice(p.price)}
                </p>
                <ArrowRight size={13} className="text-muted-foreground/30 group-hover:text-gold group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </Link>
          )
        })}
      </div>
    </div>
  )
}
