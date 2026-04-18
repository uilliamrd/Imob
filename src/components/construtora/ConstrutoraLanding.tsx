"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { ChevronDown, MessageCircle, BedDouble, Car, Maximize2, ArrowRight, Building2, Flame, CheckCircle, MapPin } from "lucide-react"
import { getTagInfo } from "@/lib/tag-icons"
import type { Organization, Property, Development } from "@/types/database"

function formatPrice(price: number) {
  if (price >= 1_000_000)
    return "R$ " + (price / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + " Mi"
  return "R$ " + price.toLocaleString("pt-BR")
}

const STATUS_MAP = {
  disponivel: { label: "Disponível", cls: "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700/50" },
  reserva:    { label: "Reservado",  cls: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700/50" },
  vendido:    { label: "Vendido",    cls: "bg-zinc-100 text-zinc-500 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-500 dark:border-zinc-700/50" },
} as const

type Section = "sobre" | "portfolio" | "imoveis" | "lancamentos"

interface Props {
  org: Organization
  properties: Property[]
  developments: Development[]
  refId?: string
  initialSection?: string
  whatsapp: string
}

export function ConstrutoraLanding({ org, properties, developments, refId, whatsapp }: Props) {
  const [activeSection, setActiveSection] = useState<Section>("sobre")
  const [unitFilter, setUnitFilter] = useState("todos")
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "20%"])

  const delivered = developments.filter((d) => d.is_delivered)
  const lancamentos = developments.filter((d) => d.is_lancamento)
  const propertiesForSale = properties.filter((p) => p.status !== "vendido")
  const filteredUnits = unitFilter === "todos" ? properties : properties.filter((p) => p.status === unitFilter)

  const refParam = refId ? `?ref=${refId}` : ""

  const navItems = (
    [
      { id: "lancamentos" as Section, label: "Lançamentos", show: org.has_lancamentos && lancamentos.length > 0 },
      { id: "imoveis"     as Section, label: "Imóveis",     show: propertiesForSale.length > 0 },
      { id: "portfolio"   as Section, label: "Portfólio",   show: true },
      { id: "sobre"       as Section, label: "Sobre",       show: true },
    ] as { id: Section; label: string; show: boolean }[]
  ).filter((n) => n.show)

  const waMsgDefault = encodeURIComponent(`Olá! Tenho interesse nos empreendimentos ${org.name}.`)
  const waMsgLanc = encodeURIComponent(`Olá! Tenho interesse nos lançamentos da ${org.name}.`)

  function scrollToContent() {
    document.getElementById("content")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────── */}
      <div ref={heroRef} className="relative h-[100svh] min-h-[580px] overflow-hidden">
        <motion.div className="absolute inset-0 w-full h-[130%] -top-[15%]" style={{ y: yBg }}>
          <div className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: org.hero_image ? `url(${org.hero_image})` : "linear-gradient(135deg, #1C1C1C 0%, #3A3A3A 50%, #1C1C1C 100%)" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
        </motion.div>

        {/* Nav */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-3">
            {org.logo
              ? <Image src={org.logo} alt={org.name} width={140} height={36} className="h-9 w-auto object-contain" />
              : <span className="font-serif text-white text-lg font-bold">{org.name}</span>
            }
          </div>
          <nav className="hidden md:flex items-center gap-1 bg-black/30 backdrop-blur-md rounded-full px-2 py-1 border border-white/10">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => { setActiveSection(item.id); scrollToContent() }}
                className={`px-5 py-2 rounded-full text-xs uppercase tracking-[0.15em] font-sans transition-all duration-300 ${
                  activeSection === item.id ? "bg-gold text-[#1C1C1C]" : "text-white/70 hover:text-white"
                }`}>
                {item.label}
                {item.id === "lancamentos" && <Flame size={10} className="inline ml-1 text-orange-400" />}
              </button>
            ))}
          </nav>
        </div>

        <motion.div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-5" style={{ y: yText, opacity }}>
          <motion.div initial={{ width: 0 }} animate={{ width: 60 }} transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }} className="h-px bg-gold mb-6" />
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xs uppercase tracking-[0.3em] text-gold font-sans mb-3">
            Empreendimentos de Alto Padrão
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.7 }}
            className="font-serif text-4xl sm:text-6xl md:text-7xl text-white font-bold leading-tight max-w-4xl">
            {org.name}
          </motion.h1>
          <motion.div initial={{ width: 0 }} animate={{ width: 48 }} transition={{ duration: 1, ease: "easeOut", delay: 1 }} className="h-px bg-gold/60 my-6" />
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.1 }}
            className="text-base md:text-xl text-white/80 font-sans font-light max-w-xl leading-relaxed px-2">
            {org.hero_tagline || "Onde a Excelência se Encontra com o Lar"}
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.4 }}
            className="flex flex-col sm:flex-row gap-3 mt-8 w-full max-w-sm sm:max-w-none sm:w-auto">
            <button onClick={() => { setActiveSection("imoveis"); scrollToContent() }}
              className="px-8 py-4 border border-gold text-gold hover:bg-gold hover:text-[#1C1C1C] transition-all duration-500 text-sm uppercase tracking-[0.2em] font-sans w-full sm:w-auto">
              Ver Imóveis
            </button>
            {org.has_lancamentos && lancamentos.length > 0 && (
              <button onClick={() => { setActiveSection("lancamentos"); scrollToContent() }}
                className="px-8 py-4 bg-gold text-[#1C1C1C] hover:bg-gold-light transition-all duration-500 text-sm uppercase tracking-[0.2em] font-sans flex items-center justify-center gap-2 w-full sm:w-auto">
                <Flame size={13} /> Lançamentos
              </button>
            )}
          </motion.div>
        </motion.div>

        <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
          <ChevronDown className="text-gold/70" size={22} />
        </motion.div>
      </div>

      {/* ── MOBILE NAV ────────────────────────────────────────── */}
      <div className="md:hidden sticky top-0 z-30 bg-[#1C1C1C] border-b border-white/10 flex overflow-x-auto">
        {navItems.map((item) => (
          <button key={item.id} onClick={() => setActiveSection(item.id)}
            className={`flex-shrink-0 px-5 py-3.5 text-xs uppercase tracking-[0.15em] font-sans transition-colors border-b-2 ${
              activeSection === item.id ? "border-gold text-gold" : "border-transparent text-white/50"
            }`}>
            {item.label}
          </button>
        ))}
      </div>

      {/* ── CONTENT ───────────────────────────────────────────── */}
      <div id="content">
        <AnimatePresence mode="wait">
          {activeSection === "sobre" && (
            <SobreSection key="sobre" org={org} whatsapp={whatsapp} waMsgDefault={waMsgDefault} />
          )}
          {activeSection === "portfolio" && (
            <PortfolioSection key="portfolio" developments={delivered} />
          )}
          {activeSection === "imoveis" && (
            <ImoveisSection key="imoveis" properties={properties} filteredUnits={filteredUnits}
              unitFilter={unitFilter} setUnitFilter={setUnitFilter} refParam={refParam}
              developments={developments} />
          )}
          {activeSection === "lancamentos" && org.has_lancamentos && (
            <LancamentosSection key="lancamentos" developments={lancamentos} whatsapp={whatsapp} waMsgLanc={waMsgLanc} />
          )}
        </AnimatePresence>
      </div>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="py-16 md:py-28 px-5 bg-[#1C1C1C] text-center border-t border-white/5">
        <p className="text-[10px] uppercase tracking-[0.4em] text-gold/60 font-sans mb-3">Entre em Contato</p>
        <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-5">
          Pronto para <span className="italic" style={{ color: "#C9A96E" }}>dar o próximo passo?</span>
        </h2>
        <a href={`https://wa.me/${whatsapp}?text=${waMsgDefault}`} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-10 py-4 bg-gold text-[#1C1C1C] hover:bg-gold-light transition-all duration-500 text-sm uppercase tracking-[0.2em] font-sans mt-2">
          <MessageCircle size={15} /> Falar com Consultor
        </a>
      </section>
    </>
  )
}

// ── Sub-sections ─────────────────────────────────────────────

function SobreSection({ org, whatsapp, waMsgDefault }: { org: Organization; whatsapp: string; waMsgDefault: string }) {
  const ref = useRef(null)
  useInView(ref, { once: true, margin: "-80px" })
  return (
    <motion.section ref={ref} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
      className="py-14 md:py-24 px-5 md:px-6 bg-background">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold font-sans mb-4">Sobre a {org.name}</p>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground leading-tight mb-6">
            Décadas de <span className="italic" style={{ color: "#C9A96E" }}>Excelência</span><br className="hidden md:block" />em Cada Detalhe
          </h2>
          <div className="divider-gold mb-6 w-20" />
          <p className="text-muted-foreground font-sans text-base leading-relaxed">
            {org.about_text || org.portfolio_desc || "Construímos sonhos com a precisão de quem entende que um lar vai além de quatro paredes."}
          </p>
          {org.website && (
            <a href={org.website} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-6 text-gold text-sm font-sans hover:opacity-75 transition-opacity">
              Conheça nosso site <ArrowRight size={13} />
            </a>
          )}
        </div>
        <div className="flex flex-col items-center lg:items-end gap-8">
          {org.about_image
            ? <Image src={org.about_image} alt="Sobre" width={384} height={384} className="w-full max-w-sm rounded-2xl object-cover aspect-square" />
            : org.logo
            ? <Image src={org.logo} alt={org.name} width={200} height={80} className="max-h-20 w-auto object-contain opacity-80" />
            : null
          }
          <a href={`https://wa.me/${whatsapp}?text=${waMsgDefault}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-8 py-3.5 bg-gold text-[#1C1C1C] hover:bg-gold-light transition-all duration-300 text-xs uppercase tracking-[0.2em] font-sans w-full sm:w-auto justify-center">
            <MessageCircle size={14} /> Falar Conosco
          </a>
        </div>
      </div>
    </motion.section>
  )
}

function PortfolioSection({ developments }: { developments: Development[] }) {
  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
      className="py-14 md:py-24 px-5 md:px-6 bg-[#1C1C1C]">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 md:mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-gold font-sans mb-3">Obras Entregues</p>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-white">
            Nosso <span className="italic" style={{ color: "#C9A96E" }}>Portfólio</span>
          </h2>
          <div className="divider-gold mt-5 w-16 opacity-60" />
        </div>
        {developments.length === 0 && (
          <div className="py-12 text-center text-white/30 font-sans text-sm border border-dashed border-white/10 rounded-2xl">
            Nenhum empreendimento entregue cadastrado ainda.
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {developments.map((dev) => (
            <div key={dev.id} className="bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden group hover:border-gold/30 transition-all duration-300">
              {dev.cover_image
                ? <div className="w-full aspect-video relative overflow-hidden"><Image src={dev.cover_image} alt={dev.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" /></div>
                : <div className="w-full aspect-video bg-gradient-to-br from-[#222] to-[#2a2a2a] flex items-center justify-center"><Building2 size={28} className="text-white/10" /></div>
              }
              <div className="p-4">
                <div className="flex items-center gap-1.5 mb-1">
                  <CheckCircle size={11} className="text-emerald-400" />
                  <span className="text-emerald-400 text-[10px] uppercase font-sans tracking-wider">Entregue</span>
                </div>
                <h3 className="font-serif text-base font-semibold text-white mb-1">{dev.name}</h3>
                {(dev.neighborhood || dev.city) && (
                  <p className="flex items-center gap-1 text-white/50 text-xs font-sans">
                    <MapPin size={10} />{dev.neighborhood}{dev.city ? `, ${dev.city}` : ""}
                  </p>
                )}
                {dev.description && <p className="text-white/35 text-sm font-sans mt-2 line-clamp-2">{dev.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}

function PropertyRow({ property, index, refParam }: { property: Property; index: number; refParam: string }) {
  const status = STATUS_MAP[property.status as keyof typeof STATUS_MAP] ?? STATUS_MAP.disponivel
  const isAvailable = property.status === "disponivel"
  return (
    <motion.div layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className={`border-b border-white/10 ${!isAvailable ? "opacity-55" : ""}`}>

      {/* ── Mobile card ── */}
      <div className="md:hidden px-1 py-4 hover:bg-white/[0.03] transition-colors">
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex-1 min-w-0">
            <p className="font-serif text-[#F5F0E8] font-semibold text-base leading-tight">{property.title}</p>
          </div>
          <p className="font-serif text-gold font-bold text-lg flex-shrink-0">{formatPrice(property.price)}</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap mb-3">
          <span className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full border font-sans ${status.cls}`}>
            {status.label}
          </span>
          {property.features.area_m2 && (
            <span className="flex items-center gap-1 text-[#F5F0E8]/50 text-xs font-sans">
              <Maximize2 size={11} className="text-gold/60" />{property.features.area_m2} m²
            </span>
          )}
          {(property.features.suites || (property as { features: { dormitorios?: number } }).features.dormitorios) && (
            <span className="flex items-center gap-1 text-[#F5F0E8]/50 text-xs font-sans">
              <BedDouble size={11} className="text-gold/60" />
              {property.features.suites
                ? `${property.features.suites} suítes`
                : `${(property as { features: { dormitorios?: number } }).features.dormitorios} dorms`}
            </span>
          )}
          {property.features.vagas && (
            <span className="flex items-center gap-1 text-[#F5F0E8]/50 text-xs font-sans">
              <Car size={11} className="text-gold/60" />{property.features.vagas} vg
            </span>
          )}
        </div>
        {isAvailable && (
          <Link href={`/imovel/${property.slug}${refParam}`}
            className="inline-flex items-center gap-1.5 text-gold text-xs font-sans uppercase tracking-wider hover:opacity-75 transition-opacity">
            Ver imóvel <ArrowRight size={12} />
          </Link>
        )}
      </div>

      {/* ── Desktop table row ── */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors">
        <div className="col-span-3 flex flex-col gap-1">
          <span className="font-serif text-[#F5F0E8] font-semibold text-base leading-tight">{property.title}</span>
          <span className={`inline-flex items-center self-start text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider ${status.cls}`}>
            {status.label}
          </span>
        </div>
        <div className="col-span-2 flex items-center justify-center gap-1 text-[#F5F0E8]/50">
          <Maximize2 size={12} className="text-gold/60" />
          <span className="font-sans text-sm">{property.features.area_m2 ? `${property.features.area_m2} m²` : "—"}</span>
        </div>
        <div className="col-span-2 flex items-center justify-center gap-2 text-[#F5F0E8]/50">
          {(property.features.suites || (property as { features: { dormitorios?: number } }).features.dormitorios) && (
            <span className="flex items-center gap-1 font-sans text-sm">
              <BedDouble size={12} className="text-gold/60" />
              {property.features.suites
                ? `${property.features.suites} suítes`
                : `${(property as { features: { dormitorios?: number } }).features.dormitorios} dorms`}
            </span>
          )}
          {property.features.vagas && (
            <span className="flex items-center gap-1 font-sans text-sm">
              <Car size={12} className="text-gold/60" />{property.features.vagas}
            </span>
          )}
        </div>
        <div className="col-span-2 flex items-center gap-1.5 flex-wrap">
          {property.tags.slice(0, 3).map((tag) => {
            const info = getTagInfo(tag)
            const Icon = info.icon
            return (
              <span key={tag} title={info.label} className="flex items-center justify-center w-7 h-7 rounded-full border border-gold/25 text-gold/60 hover:border-gold transition-colors">
                <Icon size={12} />
              </span>
            )
          })}
        </div>
        <div className="col-span-2 flex items-center justify-end">
          <span className="font-serif text-lg font-semibold text-[#F5F0E8]">{formatPrice(property.price)}</span>
        </div>
        <div className="col-span-1 flex items-center justify-end">
          {isAvailable && (
            <Link href={`/imovel/${property.slug}${refParam}`}
              className="flex items-center justify-center w-8 h-8 rounded-full border border-gold/40 text-gold hover:bg-gold hover:text-[#1C1C1C] transition-all duration-300">
              <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function ImoveisSection({ properties: _properties, filteredUnits, unitFilter, setUnitFilter, refParam, developments }:
  { properties: Property[]; filteredUnits: Property[]; unitFilter: string; setUnitFilter: (v: string) => void; refParam: string; developments: Development[] }) {
  const filters = [
    { id: "todos", label: "Todos" },
    { id: "disponivel", label: "Disponíveis" },
    { id: "reserva", label: "Reservados" },
    { id: "vendido", label: "Vendidos" },
  ]

  const devMap = new Map(developments.map((d) => [d.id, d]))
  const grouped: { dev: Development | null; units: Property[] }[] = []
  const seen = new Set<string>()
  for (const p of filteredUnits) {
    const devId = p.development_id ?? null
    if (devId && !seen.has(devId)) {
      seen.add(devId)
      grouped.push({ dev: devMap.get(devId) ?? null, units: [] })
    }
  }
  const standaloneUnits = filteredUnits.filter((p) => !p.development_id)
  for (const p of filteredUnits) {
    if (p.development_id) {
      const g = grouped.find((gr) => gr.dev?.id === p.development_id)
      if (g) g.units.push(p)
    }
  }

  let rowIndex = 0

  return (
    <motion.section id="unidades" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
      className="py-12 md:py-20 px-4 md:px-6 bg-[#1C1C1C]">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-5 mb-8 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-gold font-sans mb-2">Unidades Disponíveis</p>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-[#F5F0E8]">
              Escolha o Seu <span className="italic" style={{ color: "#C9A96E" }}>Estilo de Vida</span>
            </h2>
          </div>
          <div className="flex gap-2 flex-wrap">
            {filters.map((f) => (
              <button key={f.id} onClick={() => setUnitFilter(f.id)}
                className={`px-4 py-2 text-xs uppercase tracking-[0.15em] font-sans transition-all duration-300 rounded-full ${
                  unitFilter === f.id
                    ? "bg-gold text-[#1C1C1C] font-semibold"
                    : "border border-white/20 text-[#F5F0E8]/55 hover:border-gold/50 hover:text-gold"
                }`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="divider-gold opacity-30 mb-1" />

        {/* Desktop table header */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-foreground/40 font-sans">
          <span className="col-span-3">Unidade</span>
          <span className="col-span-2 text-center">Área</span>
          <span className="col-span-2 text-center">Dormitórios</span>
          <span className="col-span-2">Diferenciais</span>
          <span className="col-span-2 text-right">Preço</span>
          <span className="col-span-1" />
        </div>
        <div className="divider-gold opacity-20 mb-1" />

        <AnimatePresence mode="popLayout">
          {grouped.map(({ dev, units }) => (
            <div key={dev?.id ?? "no-dev"}>
              {dev && (
                <div className="flex items-center justify-between px-3 md:px-5 py-3 mt-3 border-l-2 border-gold/50 bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Building2 size={13} className="text-gold/60" />
                    <span className="font-serif text-foreground font-semibold text-base">{dev.name}</span>
                    {dev.neighborhood && (
                      <span className="hidden sm:flex items-center gap-1 text-muted-foreground text-xs font-sans ml-1">
                        <MapPin size={9} />{dev.neighborhood}
                      </span>
                    )}
                  </div>
                  <Link href={`/lancamento/${dev.id}`}
                    className="flex items-center gap-1.5 text-gold/60 hover:text-gold text-xs uppercase tracking-[0.15em] font-sans transition-colors">
                    Ver <ArrowRight size={11} />
                  </Link>
                </div>
              )}
              {units.map((p) => {
                const i = rowIndex++
                return <PropertyRow key={p.id} property={p} index={i} refParam={refParam} />
              })}
            </div>
          ))}

          {standaloneUnits.length > 0 && (
            <div key="standalone">
              {grouped.length > 0 && (
                <div className="flex items-center gap-2 px-3 md:px-5 py-3 mt-3 border-l-2 border-muted-foreground/20 bg-muted/10">
                  <span className="font-serif text-muted-foreground font-semibold text-sm">Outros Imóveis</span>
                </div>
              )}
              {standaloneUnits.map((p) => {
                const i = rowIndex++
                return <PropertyRow key={p.id} property={p} index={i} refParam={refParam} />
              })}
            </div>
          )}
        </AnimatePresence>

        {filteredUnits.length === 0 && (
          <div className="py-12 text-center text-muted-foreground/40 font-sans">Nenhuma unidade encontrada.</div>
        )}
        <div className="divider-gold opacity-20 mt-1" />
      </div>
    </motion.section>
  )
}

function LancamentosSection({ developments, whatsapp, waMsgLanc }:
  { developments: Development[]; whatsapp: string; waMsgLanc: string }) {
  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
      className="py-12 md:py-20 px-4 md:px-6 bg-[#0a0a0a]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-900/10 mb-5">
            <Flame size={13} className="text-orange-400" />
            <span className="text-orange-400 text-xs uppercase tracking-[0.2em] font-sans">Oportunidade Exclusiva</span>
          </div>
          <h2 className="font-serif text-4xl md:text-6xl font-bold text-white mb-4">Lançamentos</h2>
          <p className="text-white/40 font-sans text-base max-w-md mx-auto px-2">
            Seja um dos primeiros a garantir sua unidade com condições especiais de lançamento.
          </p>
        </div>

        {developments.map((dev, i) => (
          <div key={dev.id} className={`mb-6 rounded-2xl overflow-hidden border border-white/10 bg-[#111] grid grid-cols-1 lg:grid-cols-2 ${i % 2 === 1 ? "lg:grid-flow-dense" : ""}`}>
            {dev.cover_image
              ? <div className={`w-full aspect-video lg:aspect-auto relative overflow-hidden ${i % 2 === 1 ? "lg:col-start-2" : ""}`}><Image src={dev.cover_image} alt={dev.name} fill className="object-cover" /></div>
              : <div className={`w-full aspect-video lg:aspect-auto bg-gradient-to-br from-[#1a1a1a] to-[#222] flex items-center justify-center ${i % 2 === 1 ? "lg:col-start-2" : ""}`}>
                  <Building2 size={40} className="text-white/10" />
                </div>
            }
            <div className="p-7 md:p-10 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <Flame size={13} className="text-orange-400" />
                <span className="text-orange-400 text-xs uppercase tracking-[0.2em] font-sans">Lançamento</span>
              </div>
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-white mb-2">{dev.name}</h3>
              {(dev.neighborhood || dev.city) && (
                <p className="flex items-center gap-1.5 text-white/60 text-sm font-sans mb-3">
                  <MapPin size={12} />{dev.neighborhood}{dev.city ? `, ${dev.city}` : ""}
                </p>
              )}
              {dev.description && (
                <p className="text-white/55 font-sans text-base leading-relaxed mb-7">{dev.description}</p>
              )}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href={`/lancamento/${dev.id}`}
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 border border-gold text-gold hover:bg-gold hover:text-[#1C1C1C] transition-all duration-300 text-xs uppercase tracking-[0.2em] font-sans">
                  <ArrowRight size={13} /> Ver Unidades
                </Link>
                <a href={`https://wa.me/${whatsapp}?text=${waMsgLanc}`} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-gold text-[#1C1C1C] hover:bg-gold-light transition-all duration-300 text-xs uppercase tracking-[0.2em] font-sans">
                  <MessageCircle size={13} /> Quero Saber Mais
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.section>
  )
}
