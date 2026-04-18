"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import {
  Search, X, SlidersHorizontal, MapPin, BedDouble, Maximize2, Car,
  Building2, ArrowRight, Home, ChevronDown, ChevronUp, Sparkles, Star, ChevronRight
} from "lucide-react"
import type { PortalProperty, PortalOrg } from "@/app/(portal)/page"

interface Props {
  properties: PortalProperty[]
  construtoras: PortalOrg[]
  imobiliarias: PortalOrg[]
  superDestaques: PortalProperty[]
  destaqueIds: Set<string>
  heroImage: string | null
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

function formatPrice(p: number) {
  if (p >= 1_000_000)
    return "R$ " + (p / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + " Mi"
  return "R$ " + p.toLocaleString("pt-BR")
}

// ─── OrgCard ─────────────────────────────────────────────────
function OrgCard({ org, href }: { org: PortalOrg; href: string }) {
  const accent = org.brand_colors?.primary ?? "#C9A96E"
  return (
    <Link href={href}
      className="group flex flex-col items-center gap-3 p-5 bg-white border border-[#E8E4DC] hover:border-gold/40 hover:shadow-[0_4px_24px_rgba(201,169,110,0.10)] rounded-2xl transition-all duration-300 text-center">
      <div className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0"
        style={{ backgroundColor: accent + "18" }}>
        {org.logo ? (
          <Image src={org.logo} alt={org.name} width={40} height={40} className="object-contain" />
        ) : (
          <Building2 size={20} style={{ color: accent }} />
        )}
      </div>
      <div className="flex-1 min-w-0 w-full">
        <p className="font-serif text-sm font-semibold text-[#1C1C1C] leading-tight line-clamp-2">{org.name}</p>
        {org.hero_tagline && (
          <p className="text-[10px] font-sans mt-0.5 text-[#8B7355] line-clamp-1">{org.hero_tagline}</p>
        )}
        {org.availableCount > 0 && (
          <p className="text-[10px] font-sans mt-1" style={{ color: accent }}>
            {org.availableCount} disponível{org.availableCount !== 1 ? "is" : ""}
          </p>
        )}
      </div>
    </Link>
  )
}

// ─── PropertyCard ─────────────────────────────────────────────
function PropertyCard({ p, isDestaque, isFeatured }: { p: PortalProperty; isDestaque?: boolean; isFeatured?: boolean }) {
  return (
    <Link href={`/imovel/${p.slug}`}
      className={`group bg-white rounded-2xl overflow-hidden flex flex-col border transition-all duration-300 ${
        isFeatured
          ? "border-gold/30 shadow-[0_2px_20px_rgba(201,169,110,0.12)] hover:shadow-[0_4px_32px_rgba(201,169,110,0.20)] hover:border-gold/60"
          : isDestaque
          ? "border-gold/25 hover:border-gold/50 hover:shadow-[0_2px_16px_rgba(201,169,110,0.10)]"
          : "border-[#E8E4DC] hover:border-gold/30 hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
      }`}>
      <div className={`relative overflow-hidden bg-[#F0EBE3] ${isFeatured ? "aspect-[4/3]" : "aspect-video"}`}>
        {p.images?.[0] ? (
          <Image src={p.images[0]} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Home size={22} className="text-[#C9A96E]/30" />
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          {isFeatured && (
            <span className="flex items-center gap-1 px-2.5 py-1 bg-gold text-[#1C1C1C] rounded-full text-[9px] font-sans uppercase tracking-wider font-semibold shadow">
              <Sparkles size={8} /> Destaque
            </span>
          )}
          {isDestaque && !isFeatured && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-gold/90 text-[#1C1C1C] rounded-full text-[9px] font-sans uppercase tracking-wider font-semibold">
              <Star size={7} /> Destaque
            </span>
          )}
        </div>
        {p.organization && (
          <div className="absolute bottom-2 left-2">
            <span className="text-[9px] px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded-full font-sans text-white/80">
              {p.organization.name}
            </span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="font-serif text-[#1C1C1C] text-sm font-semibold leading-tight line-clamp-2 mb-1">{p.title}</p>
        {(p.neighborhood || p.city) && (
          <p className="text-[#8B7355] text-xs font-sans flex items-center gap-1 mb-3">
            <MapPin size={9} className="flex-shrink-0 text-[#C9A96E]" />
            {[p.neighborhood, p.city].filter(Boolean).join(", ")}
          </p>
        )}
        <div className="flex items-center gap-3 text-[#8B7355] text-[11px] font-sans mb-3">
          {p.features.area_m2 && (
            <span className="flex items-center gap-1"><Maximize2 size={9} className="text-[#C9A96E]" />{p.features.area_m2}m²</span>
          )}
          {(p.features.suites || p.features.dormitorios || p.features.quartos) && (
            <span className="flex items-center gap-1">
              <BedDouble size={9} className="text-[#C9A96E]" />
              {p.features.suites ?? p.features.dormitorios ?? p.features.quartos}
            </span>
          )}
          {p.features.vagas && (
            <span className="flex items-center gap-1"><Car size={9} className="text-[#C9A96E]" />{p.features.vagas}v</span>
          )}
        </div>
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#F0EBE3]">
          <p className="font-serif text-[#C9A96E] text-base font-semibold">{formatPrice(p.price)}</p>
          <ArrowRight size={13} className="text-[#C9A96E]/40 group-hover:text-[#C9A96E] group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </Link>
  )
}

// ─── Section Header ────────────────────────────────────────────
function SectionHeader({ label, title, action }: { label: string; title: string; action?: { href: string; text: string } }) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#C9A96E] font-sans mb-1">{label}</p>
        <h2 className="font-serif text-2xl font-bold text-[#1C1C1C] leading-tight">{title}</h2>
      </div>
      {action && (
        <Link href={action.href} className="flex items-center gap-1 text-xs font-sans text-[#8B7355] hover:text-[#C9A96E] transition-colors flex-shrink-0 ml-4">
          {action.text} <ChevronRight size={12} />
        </Link>
      )}
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────
export function PortalHome({ properties, construtoras, imobiliarias, superDestaques, destaqueIds, heroImage }: Props) {
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
  const [showFilters, setShowFilters]   = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "25%"])

  const cityOptions = Array.from(new Set(properties.map((p) => p.city).filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b, "pt-BR"))

  const bairroOptions = Array.from(
    new Set(
      properties
        .filter((p) => !filterCity || p.city === filterCity)
        .map((p) => p.neighborhood)
        .filter(Boolean) as string[]
    )
  ).sort((a, b) => a.localeCompare(b, "pt-BR"))

  const activeFilters = [filterNegocio, filterCategoria, filterCity, filterBairro, filterBeds, filterVagas, priceMin, priceMax, filterOrg].filter(Boolean).length
  function clearAll() { setSearch(""); setNegocio(""); setCategoria(""); setCity(""); setBairro(""); setBeds(""); setVagas(""); setPriceMin(""); setPriceMax(""); setOrg("") }

  const filtered = properties.filter((p) => {
    const q = search.toLowerCase()
    const numPriceMin = parseBRNumber(priceMin)
    const numPriceMax = parseBRNumber(priceMax)
    return (
      (!q || p.title.toLowerCase().includes(q) || (p.neighborhood ?? "").toLowerCase().includes(q) || (p.city ?? "").toLowerCase().includes(q)) &&
      (!filterNegocio || p.tipo_negocio === filterNegocio) &&
      (!filterCategoria || p.categoria === filterCategoria) &&
      (!filterCity || p.city === filterCity) &&
      (!filterBairro || p.neighborhood === filterBairro) &&
      (!filterBeds || ((p.features.dormitorios ?? p.features.suites ?? p.features.quartos ?? 0) as number) >= parseInt(filterBeds)) &&
      (!filterVagas || ((p.features.vagas ?? 0) as number) >= parseInt(filterVagas)) &&
      (!numPriceMin || p.price >= numPriceMin) &&
      (!numPriceMax || p.price <= numPriceMax) &&
      (!filterOrg || p.org_id === filterOrg)
    )
  })

  const sortedFiltered = [
    ...filtered.filter((p) => destaqueIds.has(p.id)),
    ...filtered.filter((p) => !destaqueIds.has(p.id)),
  ]

  const isSearching = !!(search || activeFilters > 0)
  const superDestaqueIds = new Set(superDestaques.map((p) => p.id))
  const listedProperties = isSearching
    ? sortedFiltered
    : sortedFiltered.filter((p) => !superDestaqueIds.has(p.id))

  const SELECT_CLASS = "bg-white border border-[#E8E4DC] text-[#1C1C1C]/70 px-3 py-2.5 rounded-xl font-sans text-sm focus:outline-none focus:border-[#C9A96E]/40 transition-colors min-w-0"

  return (
    <div className="bg-[#FAF8F5] min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────── */}
      <div ref={heroRef} className="relative h-[65vw] min-h-[320px] max-h-[520px] overflow-hidden">
        <motion.div className="absolute inset-0 w-full h-[130%] -top-[15%]" style={{ y: yBg }}>
          {heroImage ? (
            <Image src={heroImage} alt="Portal" fill className="object-cover" priority />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#1C1C1C] via-[#2a2a2a] to-[#1C1C1C]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/15" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-transparent" />
        </motion.div>

        <div className="relative z-10 h-full flex flex-col justify-end px-5 pb-8 max-w-2xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.7 }}
            className="text-[9px] uppercase tracking-[0.45em] text-[#C9A96E] font-sans mb-2">
            Portal de Imóveis
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.8 }}
            className="font-serif text-3xl sm:text-4xl md:text-5xl text-white font-bold leading-tight mb-2">
            A Arte de Viver o<br /><span style={{ color: "#C9A96E" }} className="italic">Extraordinário</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6 }}
            className="text-white/60 font-sans text-sm mb-5">
            {properties.length > 0
              ? `${properties.length} imóvel${properties.length !== 1 ? "is" : ""} selecionados`
              : "Imóveis de alto padrão selecionados"}
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.5 }}
            onClick={() => document.getElementById("imoveis")?.scrollIntoView({ behavior: "smooth" })}
            className="self-start flex items-center gap-2 px-6 py-3 bg-[#C9A96E] text-[#1C1C1C] text-xs uppercase tracking-[0.2em] font-sans font-medium hover:bg-[#D4B87A] transition-colors rounded-sm">
            Explorar Imóveis <ChevronDown size={13} />
          </motion.button>
        </div>
      </div>

      {/* ── SEARCH BAR ────────────────────────────────────────── */}
      <div className="sticky top-[64px] z-30 bg-white border-b border-[#E8E4DC] shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3">
          {/* Main search row */}
          <div className="flex gap-2 mb-2">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8B7355]/50" />
              <input
                type="text"
                placeholder="Busque por título, bairro, cidade ou tipo..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#E8E4DC] text-[#1C1C1C] placeholder-[#8B7355]/40 pl-11 pr-4 py-3.5 rounded-xl font-sans text-sm focus:outline-none focus:border-[#C9A96E]/50 transition-colors"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8B7355]/50 hover:text-[#1C1C1C]">
                  <X size={13} />
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-4 rounded-xl border font-sans text-sm transition-colors ${
                activeFilters > 0
                  ? "border-[#C9A96E]/50 text-[#C9A96E] bg-[#C9A96E]/08"
                  : "border-[#E8E4DC] text-[#8B7355] hover:border-[#C9A96E]/30 hover:text-[#1C1C1C]"
              }`}
            >
              <SlidersHorizontal size={14} />
              {activeFilters > 0 && (
                <span className="min-w-[18px] min-h-[18px] rounded-full bg-[#C9A96E] text-[#1C1C1C] text-[9px] font-bold flex items-center justify-center px-1">
                  {activeFilters}
                </span>
              )}
              {showFilters ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>

          {/* Quick inline filters — always visible */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            <select value={filterCategoria} onChange={(e) => setCategoria(e.target.value)} className={SELECT_CLASS + " flex-shrink-0"}>
              <option value="">Tipo de imóvel</option>
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterCity} onChange={(e) => { setCity(e.target.value); setBairro("") }} className={SELECT_CLASS + " flex-shrink-0"}>
              <option value="">Cidade</option>
              {cityOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input
              type="text"
              placeholder="Preço máximo"
              value={priceMax}
              onChange={(e) => setPriceMax(maskBRNumber(e.target.value))}
              className={SELECT_CLASS + " flex-shrink-0 w-36"}
            />
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div className="mt-2 p-3 bg-[#FAF8F5] border border-[#E8E4DC] rounded-xl grid grid-cols-2 sm:grid-cols-3 gap-2">
              <select value={filterNegocio} onChange={(e) => setNegocio(e.target.value)} className={SELECT_CLASS}>
                <option value="">Tipo de negócio</option>
                <option value="Venda">Venda</option>
                <option value="Locação">Locação</option>
              </select>
              {bairroOptions.length > 0 && (
                <select value={filterBairro} onChange={(e) => setBairro(e.target.value)} className={SELECT_CLASS}>
                  <option value="">Bairro</option>
                  {bairroOptions.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              )}
              <select value={filterBeds} onChange={(e) => setBeds(e.target.value)} className={SELECT_CLASS}>
                <option value="">Dormitórios</option>
                <option value="1">1+</option><option value="2">2+</option>
                <option value="3">3+</option><option value="4">4+</option>
              </select>
              <select value={filterVagas} onChange={(e) => setVagas(e.target.value)} className={SELECT_CLASS}>
                <option value="">Vagas</option>
                <option value="1">1+</option><option value="2">2+</option><option value="3">3+</option>
              </select>
              <input
                type="text"
                placeholder="Preço mínimo"
                value={priceMin}
                onChange={(e) => setPriceMin(maskBRNumber(e.target.value))}
                className={SELECT_CLASS}
              />
              <select value={filterOrg} onChange={(e) => setOrg(e.target.value)} className={SELECT_CLASS}>
                <option value="">Construtora / Imobiliária</option>
                {[...construtoras, ...imobiliarias].map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
              {activeFilters > 0 && (
                <button onClick={clearAll} className="flex items-center justify-center gap-1 py-2.5 rounded-xl border border-[#E8E4DC] text-[#8B7355] hover:text-[#1C1C1C] text-xs font-sans transition-colors col-span-2 sm:col-span-1">
                  <X size={11} /> Limpar filtros
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-8 pb-16 space-y-12">

        {/* ── CONSTRUTORAS DESTAQUE ─────────────────────────── */}
        {construtoras.length > 0 && !isSearching && (
          <section>
            <SectionHeader
              label="Destaque"
              title="Construtoras"
              action={{ href: "/construtoras", text: "Ver todas" }}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {construtoras.slice(0, 8).map((org) => (
                <OrgCard key={org.id} org={org} href={`/construtora/${org.slug}`} />
              ))}
            </div>
          </section>
        )}

        {/* ── IMOBILIÁRIAS ─────────────────────────────────── */}
        {imobiliarias.length > 0 && !isSearching && (
          <section>
            <SectionHeader
              label="Parceiros"
              title="Imobiliárias"
              action={{ href: "/imobiliarias", text: "Ver todas" }}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {imobiliarias.slice(0, 4).map((org) => (
                <OrgCard key={org.id} org={org} href={`/imobiliaria/${org.slug}`} />
              ))}
            </div>
          </section>
        )}

        {/* ── COLEÇÕES EXCLUSIVAS (Super Destaques) ─────────── */}
        {superDestaques.length > 0 && !isSearching && (
          <section>
            <SectionHeader label="Coleções Exclusivas" title="Imóveis em Destaque" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {superDestaques.slice(0, 4).map((p) => (
                <PropertyCard key={p.id} p={p} isFeatured />
              ))}
            </div>
          </section>
        )}

        {/* ── TODOS OS IMÓVEIS ──────────────────────────────── */}
        <section id="imoveis">
          <div className="flex items-baseline justify-between mb-5">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-[#C9A96E] font-sans mb-1">Disponíveis</p>
              <h2 className="font-serif text-2xl font-bold text-[#1C1C1C]">
                {isSearching ? "Resultados" : "Vivência & Estilo de Vida"}
              </h2>
            </div>
            <p className="text-sm font-sans text-[#8B7355] flex-shrink-0 ml-4">
              <span className="text-[#1C1C1C] font-medium">{filtered.length}</span>
              {filtered.length !== properties.length && <span className="text-[#8B7355]/50"> de {properties.length}</span>}
              {" "}imóvel{filtered.length !== 1 ? "is" : ""}
            </p>
          </div>

          {listedProperties.length === 0 ? (
            <div className="py-20 text-center">
              <Home size={28} className="mx-auto text-[#C9A96E]/25 mb-3" />
              <p className="text-[#8B7355] font-sans text-sm">
                {properties.length === 0
                  ? "Nenhum imóvel disponível no portal ainda."
                  : "Nenhum imóvel encontrado."}
              </p>
              {activeFilters > 0 && (
                <button onClick={clearAll} className="mt-2 text-[#C9A96E] text-sm font-sans hover:underline">
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
              {listedProperties.map((p) => (
                <PropertyCard key={p.id} p={p} isDestaque={destaqueIds.has(p.id)} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
