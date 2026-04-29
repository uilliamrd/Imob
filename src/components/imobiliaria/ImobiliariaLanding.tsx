"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion"
import {
  BedDouble, Car, Maximize2, MessageCircle, Search, MapPin, Hash,
  ChevronDown, ArrowRight, Phone, Users,
} from "lucide-react"
import { getTagInfo } from "@/lib/tag-icons"
import { ThemeSwitch } from "@/components/ThemeSwitch"
import type { Organization, Property } from "@/types/database"

export type CorretorPublic = {
  id: string
  full_name: string | null
  avatar_url: string | null
  creci: string | null
  whatsapp: string | null
  slug: string | null
}

function formatPrice(price: number) {
  if (price >= 1_000_000)
    return "R$ " + (price / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + " Mi"
  return "R$ " + price.toLocaleString("pt-BR")
}

const STATUS_MAP = {
  disponivel: { label: "Disponível", cls: "bg-emerald-900/30 text-emerald-300 border-emerald-700/50" },
  reserva:    { label: "Reservado",  cls: "bg-amber-900/30 text-amber-300 border-amber-700/50" },
  vendido:    { label: "Vendido",    cls: "bg-zinc-800 text-zinc-500 border-zinc-700/50" },
} as const

type Section = "sobre" | "imoveis" | "equipe"

interface Props {
  org: Organization
  properties: Property[]
  corretores: CorretorPublic[]
  refId?: string
  whatsapp: string
}

export function ImobiliariaLanding({ org, properties, corretores, refId, whatsapp }: Props) {
  const [activeSection, setActiveSection] = useState<Section>("sobre")
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const yBg   = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "20%"])

  const brandColor = org.brand_colors?.primary ?? "#C4A052"
  const refParam = refId ? `?ref=${refId}` : ""
  const forSale = properties.filter((p) => p.status !== "vendido")

  const navItems = [
    { id: "sobre"   as Section, label: "Sobre",   show: true },
    { id: "imoveis" as Section, label: "Imóveis",  show: true },
    { id: "equipe"  as Section, label: "Equipe",   show: corretores.length > 0 },
  ].filter((n) => n.show)

  const waMsg = encodeURIComponent(`Olá! Vim pelo site da ${org.name} e gostaria de mais informações.`)

  function scrollToContent() {
    document.getElementById("content")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <>
      <div className="no-print fixed top-4 right-4 z-50"><ThemeSwitch /></div>
      {/* ── HERO ────────────────────────────────────────────────── */}
      <div ref={heroRef} className="relative h-screen overflow-hidden">
        <motion.div className="absolute inset-0 w-full h-[130%] -top-[15%]" style={{ y: yBg }}>
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: org.hero_image
                ? `url(${org.hero_image})`
                : `linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
        </motion.div>

        {/* Top nav */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-6">
          <div>
            {org.logo
              ? <Image src={org.logo} alt={org.name} width={160} height={40} className="h-10 w-auto object-contain" />
              : <span className="font-serif text-white text-xl font-bold">{org.name}</span>
            }
          </div>
          <nav className="hidden md:flex items-center gap-1 bg-black/30 backdrop-blur-md rounded-full px-2 py-1 border border-white/10">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveSection(item.id); scrollToContent() }}
                className={`px-5 py-2 rounded-full text-xs uppercase tracking-[0.15em] font-sans transition-all duration-300 ${
                  activeSection === item.id ? "bg-card/90 text-black" : "text-white/70 hover:text-white"
                }`}
                style={activeSection === item.id ? { backgroundColor: brandColor, color: "#0a0a0a" } : {}}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Hero text */}
        <motion.div
          className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6"
          style={{ y: yText, opacity }}
        >
          <motion.div
            initial={{ width: 0 }} animate={{ width: 60 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            className="h-px mb-8"
            style={{ backgroundColor: brandColor }}
          />
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xs uppercase tracking-[0.4em] font-sans mb-4"
            style={{ color: brandColor }}
          >
            Imobiliária
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="font-serif text-5xl md:text-7xl text-white font-bold leading-tight max-w-4xl"
          >
            {org.name}
          </motion.h1>
          <motion.div
            initial={{ width: 0 }} animate={{ width: 40 }}
            transition={{ duration: 1, ease: "easeOut", delay: 1 }}
            className="h-px my-8 opacity-60"
            style={{ backgroundColor: brandColor }}
          />
          {org.hero_tagline && (
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1 }}
              className="text-lg md:text-xl text-white/80 font-sans font-light max-w-2xl leading-relaxed"
            >
              {org.hero_tagline}
            </motion.p>
          )}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            className="flex gap-4 mt-12"
          >
            <button
              onClick={() => { setActiveSection("imoveis"); scrollToContent() }}
              className="px-10 py-4 border text-sm uppercase tracking-[0.2em] font-sans transition-all duration-500 hover:opacity-80"
              style={{ borderColor: brandColor, color: brandColor }}
            >
              Ver Imóveis
            </button>
            {corretores.length > 0 && (
              <button
                onClick={() => { setActiveSection("equipe"); scrollToContent() }}
                className="px-10 py-4 text-sm uppercase tracking-[0.2em] font-sans transition-all duration-500 hover:brightness-110 flex items-center gap-2"
                style={{ backgroundColor: brandColor, color: "#0a0a0a" }}
              >
                <Users size={14} /> Nossos Corretores
              </button>
            )}
          </motion.div>
          <p className="text-white/40 font-sans text-sm mt-8">{forSale.length} imóveis disponíveis</p>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="text-white/40" size={24} />
        </motion.div>
      </div>

      {/* ── MOBILE NAV ──────────────────────────────────────────── */}
      <div className="md:hidden sticky top-0 z-30 bg-[#0a0a0a] border-b border-white/10 flex overflow-x-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`flex-shrink-0 px-5 py-3 text-xs uppercase tracking-[0.15em] font-sans transition-colors border-b-2 ${
              activeSection === item.id ? "border-current" : "border-transparent text-white/40"
            }`}
            style={activeSection === item.id ? { color: brandColor, borderColor: brandColor } : {}}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* ── CONTENT ─────────────────────────────────────────────── */}
      <div id="content">
        <AnimatePresence mode="wait">
          {activeSection === "sobre" && (
            <SobreSection key="sobre" org={org} whatsapp={whatsapp} waMsg={waMsg} brandColor={brandColor} />
          )}
          {activeSection === "imoveis" && (
            <ImoveisSection key="imoveis" properties={properties} refParam={refParam} brandColor={brandColor} />
          )}
          {activeSection === "equipe" && corretores.length > 0 && (
            <EquipeSection key="equipe" corretores={corretores} org={org} brandColor={brandColor} />
          )}
        </AnimatePresence>
      </div>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="py-24 px-6 text-center border-t border-white/5 bg-[#0a0a0a]">
        <p className="text-white/30 font-sans text-xs uppercase tracking-[0.3em] mb-4">Pronto para encontrar seu imóvel?</p>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-8">
          Fale com a <span className="italic" style={{ color: brandColor }}>{org.name}</span>
        </h2>
        <a
          href={`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${waMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-10 py-4 text-sm uppercase tracking-[0.2em] font-sans transition-all hover:brightness-110"
          style={{ backgroundColor: brandColor, color: "#0a0a0a" }}
        >
          <MessageCircle size={16} /> Falar pelo WhatsApp
        </a>
      </section>
    </>
  )
}

// ── Sub-sections ──────────────────────────────────────────────

function SobreSection({ org, whatsapp, waMsg, brandColor }: {
  org: Organization; whatsapp: string; waMsg: string; brandColor: string
}) {
  const ref = useRef(null)
  useInView(ref, { once: true, margin: "-80px" })
  return (
    <motion.section
      ref={ref}
      key="sobre"
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="py-32 px-6 bg-[#0a0a0a]"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] font-sans mb-6" style={{ color: brandColor }}>
            Sobre a {org.name}
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white leading-tight mb-8">
            Seu imóvel ideal,<br />
            <span className="italic" style={{ color: brandColor }}>com quem entende</span>
          </h2>
          <div className="h-px w-20 mb-8 opacity-40" style={{ backgroundColor: brandColor }} />
          <p className="text-white/60 font-sans text-lg leading-relaxed">
            {org.about_text || org.portfolio_desc || "Especialistas no mercado imobiliário, prontos para encontrar o imóvel ideal para você com atendimento personalizado e expertise de quem conhece cada detalhe do mercado."}
          </p>
          {org.website && (
            <a
              href={org.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-8 text-sm font-sans transition-colors hover:opacity-80"
              style={{ color: brandColor }}
            >
              Conheça nosso site <ArrowRight size={14} />
            </a>
          )}
        </div>
        <div className="flex flex-col items-center lg:items-end gap-10">
          {org.about_image ? (
            <Image
              src={org.about_image}
              alt="Sobre"
              width={400}
              height={400}
              className="w-full max-w-sm rounded-2xl object-cover aspect-square"
            />
          ) : org.logo ? (
            <Image
              src={org.logo}
              alt={org.name}
              width={240}
              height={96}
              className="max-h-24 w-auto object-contain opacity-70"
            />
          ) : null}
          <a
            href={`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${waMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-8 py-3 text-xs uppercase tracking-[0.2em] font-sans transition-all hover:brightness-110"
            style={{ backgroundColor: brandColor, color: "#0a0a0a" }}
          >
            <MessageCircle size={14} /> Falar Conosco
          </a>
        </div>
      </div>
    </motion.section>
  )
}

function ImoveisSection({ properties, refParam, brandColor }: {
  properties: Property[]; refParam: string; brandColor: string
}) {
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("todos")

  const filtered = properties.filter((p) => {
    const matchSearch = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.neighborhood ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.city ?? "").toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === "todos" || p.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <motion.section
      key="imoveis"
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="py-24 px-6 bg-[#111]"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-xs uppercase tracking-[0.3em] font-sans mb-3" style={{ color: brandColor }}>
            Portfólio
          </p>
          <h2 className="font-serif text-4xl font-bold text-white">Nossos Imóveis</h2>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-10 justify-center">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Buscar por título ou bairro..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-card/5 border border-white/10 text-white placeholder-white/20 pl-9 pr-4 py-2.5 rounded-lg font-sans text-sm focus:outline-none focus:border-white/30 transition-colors min-w-64"
            />
          </div>
          {(["todos", "disponivel", "reserva", "vendido"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2.5 rounded-lg text-xs font-sans uppercase tracking-wider transition-colors border ${
                filterStatus === s ? "border-transparent text-[#0a0a0a]" : "bg-transparent border-white/10 text-white/40 hover:text-white/60"
              }`}
              style={filterStatus === s ? { backgroundColor: brandColor } : {}}
            >
              {s === "todos" ? "Todos" : s === "disponivel" ? "Disponível" : s === "reserva" ? "Reservado" : "Vendido"}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((p, i) => {
            const status = STATUS_MAP[p.status] ?? STATUS_MAP.disponivel
            return (
              <motion.a
                key={p.id}
                href={`/imovel/${p.slug}${refParam}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                className="group block bg-card/[0.03] border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300"
              >
                <div className="aspect-video relative overflow-hidden bg-[#1a1a1a]">
                  {p.images[0] ? (
                    <Image src={p.images[0]} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-serif text-4xl text-white/10">R</span>
                    </div>
                  )}
                  <span className={`absolute top-3 left-3 text-[10px] px-2 py-1 rounded-full border uppercase tracking-wider font-sans ${status.cls}`}>
                    {status.label}
                  </span>
                </div>
                <div className="p-5">
                  {p.code && (
                    <div className="flex items-center gap-1 text-white/20 text-[10px] font-sans mb-1">
                      <Hash size={9} />{p.code}
                    </div>
                  )}
                  <h3 className="font-serif text-lg font-semibold text-white mb-1 truncate">{p.title}</h3>
                  {p.neighborhood && (
                    <p className="text-white/55 text-xs font-sans mb-3 flex items-center gap-1">
                      <MapPin size={10} />{p.neighborhood}{p.city ? `, ${p.city}` : ""}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-white/60 text-xs font-sans mb-4">
                    {p.features.area_m2 && (
                      <span className="flex items-center gap-1"><Maximize2 size={11} />{p.features.area_m2}m²</span>
                    )}
                    {(p.features.suites || p.features.dormitorios) && (
                      <span className="flex items-center gap-1">
                        <BedDouble size={11} />
                        {p.features.suites ? `${p.features.suites} suítes` : `${p.features.dormitorios} dorms`}
                      </span>
                    )}
                    {p.features.vagas && (
                      <span className="flex items-center gap-1"><Car size={11} />{p.features.vagas} vagas</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-serif text-xl font-bold text-white">{formatPrice(p.price)}</p>
                    <div className="flex gap-1">
                      {p.tags.slice(0, 3).map((tag) => {
                        const info = getTagInfo(tag)
                        const Icon = info.icon
                        return (
                          <span
                            key={tag}
                            title={info.label}
                            className="w-6 h-6 rounded-full border flex items-center justify-center"
                            style={{ borderColor: brandColor + "40", color: brandColor + "80" }}
                          >
                            <Icon size={11} />
                          </span>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </motion.a>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-white/20 font-sans py-20">Nenhum imóvel encontrado.</p>
        )}
      </div>
    </motion.section>
  )
}

function EquipeSection({ corretores, org, brandColor }: {
  corretores: CorretorPublic[]; org: Organization; brandColor: string
}) {
  return (
    <motion.section
      key="equipe"
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="py-32 px-6 bg-[#0a0a0a]"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.3em] font-sans mb-3" style={{ color: brandColor }}>
            Nossa Equipe
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">
            Corretores <span className="italic" style={{ color: brandColor }}>Especializados</span>
          </h2>
          <div className="h-px w-16 mx-auto mt-6 opacity-40" style={{ backgroundColor: brandColor }} />
          <p className="text-white/40 font-sans mt-4 text-base">
            {corretores.length} profissional{corretores.length !== 1 ? "is" : ""} prontos para atender você
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {corretores.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="bg-card/[0.03] border border-white/8 rounded-2xl overflow-hidden hover:border-white/15 transition-all duration-300 group"
            >
              {/* Avatar */}
              <div className="aspect-square relative overflow-hidden bg-card/5">
                {c.avatar_url ? (
                  <Image
                    src={c.avatar_url}
                    alt={c.full_name ?? "Corretor"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="font-serif text-5xl font-bold text-white/10">
                      {c.full_name?.[0]?.toUpperCase() ?? "C"}
                    </span>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="font-serif text-lg font-semibold text-white truncate">
                  {c.full_name ?? "Corretor"}
                </h3>
                <p className="text-xs font-sans mt-0.5 mb-1" style={{ color: brandColor + "99" }}>
                  {org.name}
                </p>
                {c.creci && (
                  <p className="text-white/30 text-[10px] font-sans uppercase tracking-wider mb-4">
                    CRECI {c.creci}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-3">
                  {c.whatsapp && (
                    <a
                      href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${c.full_name ?? ""}! Vi seu perfil no site da ${org.name} e gostaria de mais informações.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[10px] uppercase tracking-wider font-sans transition-all hover:opacity-80"
                      style={{ backgroundColor: brandColor + "20", color: brandColor, border: `1px solid ${brandColor}30` }}
                    >
                      <Phone size={10} /> WhatsApp
                    </a>
                  )}
                  {c.slug && (
                    <a
                      href={`/corretor/${c.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center px-3 py-2 rounded-lg border border-white/10 text-white/40 hover:text-white hover:border-white/20 transition-colors"
                    >
                      <ArrowRight size={12} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  )
}
