"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Search, X, SlidersHorizontal, Building2, Home, ChevronDown, ChevronUp, Sparkles
} from "lucide-react"
import { PropertyCard, EmptyState } from "@/components/ui/premium"
import type { PortalProperty, PortalOrg } from "@/types/portal"

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
            <Sparkles size={13} className="text-[var(--gold)]" />
            <p className="text-xs uppercase tracking-[0.25em] text-[var(--gold)] font-sans">Super Destaques</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {superDestaques.map((p) => (
              <PropertyCard
                key={p.id}
                id={p.id}
                slug={p.slug}
                title={p.title}
                price={p.price}
                neighborhood={p.neighborhood}
                city={p.city}
                images={p.images}
                quartos={p.features.suites ?? p.features.dormitorios ?? p.features.quartos ?? null}
                vagas={p.features.vagas ?? null}
                area_m2={p.features.area_m2 ?? null}
                tipo_negocio={p.tipo_negocio}
                badge={{ label: "Super Destaque", variant: "gold" }}
                className="border-[color-mix(in_srgb,var(--gold)_40%,transparent)] shadow-[0_0_24px_rgba(201,169,110,0.12)]"
                showCompare
              />
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
        <EmptyState
          icon={Home}
          title={properties.length === 0 ? "Nenhum imóvel disponível" : "Nenhum resultado"}
          description={properties.length === 0
            ? "Novos imóveis em breve."
            : "Tente outros filtros ou termos de busca."}
          action={activeFilters > 0 ? (
            <button onClick={clearAll} className="text-sm text-[var(--forest)] font-medium hover:underline">
              Limpar filtros
            </button>
          ) : undefined}
        />
      )}

      {/* Property grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedFiltered.map((p) => {
          const isDestaque = destaqueIds.has(p.id)
          return (
            <PropertyCard
              key={p.id}
              id={p.id}
              slug={p.slug}
              title={p.title}
              price={p.price}
              neighborhood={p.neighborhood}
              city={p.city}
              images={p.images}
              quartos={p.features.suites ?? p.features.dormitorios ?? p.features.quartos ?? null}
              vagas={p.features.vagas ?? null}
              area_m2={p.features.area_m2 ?? null}
              tipo_negocio={p.tipo_negocio}
              badge={isDestaque ? { label: "Destaque", variant: "gold" } : undefined}
              className={isDestaque ? "border-[color-mix(in_srgb,var(--gold)_30%,transparent)] shadow-[0_0_16px_rgba(201,169,110,0.08)]" : undefined}
              showCompare
            />
          )
        })}
      </div>
    </div>
  )
}
