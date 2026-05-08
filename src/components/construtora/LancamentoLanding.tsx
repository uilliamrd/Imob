"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { ChevronDown, MessageCircle, BedDouble, Car, Maximize2, ArrowRight, MapPin, Flame, ArrowLeft, Hash, FileDown, Lock } from "lucide-react"
import { getTagInfo } from "@/lib/tag-icons"
import { ThemeSwitch } from "@/components/ThemeSwitch"
import type { Development, DevelopmentUpdate, Organization, Property } from "@/types/database"

const FASE_MAP: Record<string, { label: string; cls: string }> = {
  pre_lancamento: { label: "Pré-lançamento", cls: "bg-amber-900/30 text-amber-300 border-amber-700/40" },
  lancamento:     { label: "Lançamento",     cls: "bg-orange-900/30 text-orange-300 border-orange-700/40" },
  fundacao:       { label: "Fundação",        cls: "bg-blue-900/30 text-blue-300 border-blue-700/40" },
  estrutura:      { label: "Estrutura",       cls: "bg-blue-900/30 text-blue-300 border-blue-700/40" },
  alvenaria:      { label: "Alvenaria",       cls: "bg-cyan-900/30 text-cyan-300 border-cyan-700/40" },
  acabamento:     { label: "Acabamento",      cls: "bg-teal-900/30 text-teal-300 border-teal-700/40" },
  entregue:       { label: "Entregue",        cls: "bg-emerald-900/30 text-emerald-300 border-emerald-700/40" },
}

function UpdatesFeed({ updates }: { updates: DevelopmentUpdate[] }) {
  const [showAll, setShowAll] = useState(false)
  const visible = showAll ? updates : updates.slice(0, 5)
  return (
    <div className="space-y-1">
      {visible.map((u, i) => (
        <div key={u.id} className="flex gap-3">
          <div className="flex flex-col items-center flex-shrink-0">
            <div className="w-1.5 h-1.5 rounded-full bg-gold/60 mt-1.5" />
            {i < visible.length - 1 && <div className="w-px flex-1 bg-white/10 mt-1" />}
          </div>
          <div className="pb-3 flex-1 min-w-0">
            <p className="text-white/80 text-sm font-sans font-medium leading-snug">{u.title}</p>
            {u.body && <p className="text-white/50 text-xs font-sans mt-0.5 leading-relaxed">{u.body}</p>}
            <p className="text-white/30 text-[10px] font-sans mt-1">
              {new Date(u.created_at).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
            </p>
          </div>
        </div>
      ))}
      {!showAll && updates.length > 5 && (
        <button
          onClick={() => setShowAll(true)}
          className="text-gold/70 text-xs font-sans hover:text-gold transition-colors uppercase tracking-wider mt-1"
        >
          Ver mais {updates.length - 5} {updates.length - 5 === 1 ? "atualização" : "atualizações"}
        </button>
      )}
    </div>
  )
}

function formatPrice(price: number) {
  if (price >= 1_000_000)
    return "R$ " + (price / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + " Mi"
  return "R$ " + price.toLocaleString("pt-BR")
}

// Status badges on dark background — fixed dark-safe values, no opacity dependency
const STATUS_MAP = {
  disponivel: { label: "Disponível", cls: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30" },
  reserva:    { label: "Reservado",  cls: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30" },
  vendido:    { label: "Vendido",    cls: "bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30" },
} as const

interface Props {
  development: Development
  org: Organization | null
  properties: Property[]
  updates?: DevelopmentUpdate[]
  refId?: string
  whatsapp: string | null
  canDownload?: boolean
}

export function LancamentoLanding({ development, org, properties, updates = [], refId, whatsapp, canDownload = false }: Props) {
  const [activeFilter, setActiveFilter] = useState("todos")
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "20%"])

  const refParam = refId ? `?ref=${refId}` : ""
  const waMsg = encodeURIComponent(`Olá! Tenho interesse no lançamento ${development.name}.`)
  const orgSlug = org?.slug
  const waNumber = whatsapp ? whatsapp.replace(/\D/g, "") : ""
  const waUrl = waNumber ? `https://wa.me/${waNumber}?text=${waMsg}` : null

  const filters = [
    { id: "todos", label: "Todas" },
    { id: "disponivel", label: "Disponíveis" },
    { id: "reserva", label: "Reservados" },
    { id: "vendido", label: "Vendidos" },
  ]

  const filtered = activeFilter === "todos"
    ? properties
    : properties.filter((p) => p.status === activeFilter)

  const disponiveisCount = properties.filter((p) => p.status === "disponivel").length

  return (
    <>
      <div className="no-print fixed top-4 right-4 z-50"><ThemeSwitch /></div>
      {/* ── HERO ──────────────────────────────────────────────── */}
      <div ref={heroRef} className="relative h-[100svh] min-h-[580px] overflow-hidden">
        <motion.div className="absolute inset-0 w-full h-[130%] -top-[15%]" style={{ y: yBg }}>
          <div className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: development.cover_image
              ? `url(${development.cover_image})`
              : "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/65 to-black/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        </motion.div>

        {/* Nav */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-3">
            {orgSlug && (
              <Link href={`/construtora/${orgSlug}`}
                className="flex items-center gap-2 text-white/60 hover:text-white/90 transition-colors text-sm font-sans bg-black/20 backdrop-blur-sm px-3 py-2 rounded-full">
                <ArrowLeft size={14} /> {org?.name ?? "Voltar"}
              </Link>
            )}
          </div>
          {org?.logo && <Image src={org.logo} alt={org.name} width={100} height={28} className="h-7 w-auto object-contain opacity-80" />}
        </div>

        <motion.div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-5"
          style={{ y: yText, opacity }}>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/40 bg-orange-900/20 mb-6">
            <Flame size={12} className="text-orange-400" />
            <span className="text-orange-400 text-xs uppercase tracking-[0.2em] font-sans">Lançamento Exclusivo</span>
          </motion.div>

          <motion.div initial={{ width: 0 }} animate={{ width: 50 }} transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            className="h-px bg-gold mb-6" />

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }}
            className="font-serif text-4xl sm:text-6xl md:text-7xl text-white font-bold leading-tight max-w-3xl">
            {development.name}
          </motion.h1>

          {(development.neighborhood || development.city) && (
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }}
              className="flex items-center gap-2 text-white/70 font-sans text-base mt-3">
              <MapPin size={14} className="text-gold/80" />
              {development.neighborhood}{development.city ? `, ${development.city}` : ""}
            </motion.p>
          )}

          <motion.div initial={{ width: 0 }} animate={{ width: 36 }} transition={{ duration: 1, ease: "easeOut", delay: 0.9 }}
            className="h-px bg-gold/50 my-6" />

          {development.description && (
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1 }}
              className="text-white/90 font-sans text-base max-w-xl leading-relaxed mb-7 px-2 [text-shadow:0_1px_8px_rgba(0,0,0,0.8)]">
              {development.description}
            </motion.p>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-3 w-full max-w-sm sm:max-w-none sm:w-auto">
            <button onClick={() => document.getElementById("unidades")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-4 border border-white/40 text-white hover:border-white hover:bg-white/10 transition-all duration-300 text-sm uppercase tracking-[0.2em] font-sans w-full sm:w-auto">
              Ver Unidades {disponiveisCount > 0 && `(${disponiveisCount})`}
            </button>
            {waUrl && (
              <a href={waUrl} target="_blank" rel="noopener noreferrer"
                className="px-8 py-4 bg-[var(--action-default)] text-white hover:bg-[var(--action-hover)] transition-all duration-300 text-sm uppercase tracking-[0.2em] font-sans flex items-center justify-center gap-2 w-full sm:w-auto">
                <MessageCircle size={15} /> Quero Saber Mais
              </a>
            )}
          </motion.div>
        </motion.div>

        <motion.div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
          animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
          <ChevronDown className="text-gold/70" size={22} />
        </motion.div>
      </div>

      {/* ── STATS BAR ─────────────────────────────────────────── */}
      <div className="bg-[#111] border-y border-white/5 py-6 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-5 text-center">
          {[
            { label: "Unidades", value: properties.length.toString() },
            { label: "Disponíveis", value: properties.filter(p => p.status === "disponivel").length.toString() },
            { label: "A partir de", value: properties.length ? formatPrice(Math.min(...properties.map(p => p.price))) : "—" },
            { label: "Maior Área", value: properties.length ? `${Math.max(...properties.map(p => p.features.area_m2 ?? 0))} m²` : "—" },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-serif text-xl sm:text-2xl font-bold text-white mb-0.5">{s.value}</p>
              <p className="text-white/60 text-xs uppercase tracking-wider font-sans">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── OBRA STATUS ─────────────────────────────────────── */}
      {(development.obra_fase || updates.length > 0) && (
        <section className="py-10 px-4 md:px-6 bg-[#0d0d0d] border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <div className={`grid grid-cols-1 ${development.obra_fase && updates.length > 0 ? "md:grid-cols-2" : ""} gap-8`}>
              {development.obra_fase && (
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gold font-sans mb-4">Status da Obra</p>
                  <div className="flex items-center gap-3 mb-5 flex-wrap">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-sans uppercase tracking-wider border ${FASE_MAP[development.obra_fase]?.cls ?? ""}`}>
                      {FASE_MAP[development.obra_fase]?.label ?? development.obra_fase}
                    </span>
                    {development.obra_prazo && (
                      <span className="text-white/50 text-xs font-sans">
                        Previsão: {new Date(development.obra_prazo + "T00:00:00").toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                      </span>
                    )}
                  </div>
                  {development.obra_percent != null && (
                    <div>
                      <div className="flex justify-between text-xs font-sans text-white/50 mb-2">
                        <span>Progresso</span>
                        <span>{development.obra_percent}%</span>
                      </div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-gold/60 to-gold rounded-full"
                          initial={{ width: 0 }}
                          whileInView={{ width: `${development.obra_percent}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
              {updates.length > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gold font-sans mb-4">Atualizações</p>
                  <UpdatesFeed updates={updates} />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── TABELA DE UNIDADES ────────────────────────────────── */}
      {/* Fundo sempre escuro (bg-graphite) — todas as cores de texto são fixas, sem variáveis de tema */}
      <section id="unidades" className="py-12 md:py-20 px-4 md:px-6 bg-background">
        <div className="max-w-6xl mx-auto">

          {/* Section header */}
          <div className="flex flex-col gap-5 mb-8 md:mb-12 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-sans mb-2">Tabela de Preços</p>
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-white">
                Escolha a Sua <span className="italic" style={{ color: "#C9A96E" }}>Unidade</span>
              </h2>
            </div>
            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              {filters.map((f) => (
                <button key={f.id} onClick={() => setActiveFilter(f.id)}
                  className={`px-4 py-2 text-xs uppercase tracking-[0.15em] font-sans transition-all duration-300 rounded-md ${
                    activeFilter === f.id
                      ? "bg-[var(--action-default)] text-foreground font-semibold"
                      : "border border-border text-foreground/60 hover:border-[var(--border-default)] hover:text-foreground"
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divider-gold opacity-30 mb-1" />

          {/* Desktop table header — hidden on mobile */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 text-xs uppercase tracking-[0.15em] text-foreground/60 font-sans">
            <span className="col-span-4">Unidade</span>
            <span className="col-span-2 text-center">Área</span>
            <span className="col-span-2 text-center">Dormitórios</span>
            <span className="col-span-1 text-center">Vagas</span>
            <span className="col-span-2 text-right">Preço</span>
            <span className="col-span-1" />
          </div>
          <div className="divider-gold opacity-20 mb-1" />

          <AnimatePresence mode="popLayout">
            {filtered.map((p, i) => {
              const status = STATUS_MAP[p.status as keyof typeof STATUS_MAP] ?? STATUS_MAP.disponivel
              const isAvailable = p.status === "disponivel"
              return (
                <motion.div key={p.id} layout
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  className={`border-b border-border ${!isAvailable ? "opacity-50" : ""}`}>

                  {/* ── Mobile card ── */}
                  <div className="md:hidden px-1 py-4 hover:bg-card/5 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-foreground font-medium text-sm leading-tight">{p.title}</p>
                        {p.code && (
                          <p className="text-foreground/70 text-xs font-sans mt-0.5 flex items-center gap-1">
                            <Hash size={9} /> Cód. {p.code}
                          </p>
                        )}
                      </div>
                      <p className="font-serif text-foreground font-semibold text-sm flex-shrink-0">{formatPrice(p.price)}</p>
                    </div>
                    <div className="flex items-center gap-2.5 flex-wrap mb-3">
                      <span className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full border font-sans ${status.cls}`}>
                        {status.label}
                      </span>
                      {p.features.area_m2 && (
                        <span className="flex items-center gap-1 text-foreground/70 text-xs font-sans">
                          <Maximize2 size={11} className="text-gold/80" />{p.features.area_m2} m²
                        </span>
                      )}
                      {(p.features.suites || p.features.dormitorios) && (
                        <span className="flex items-center gap-1 text-foreground/70 text-xs font-sans">
                          <BedDouble size={11} className="text-gold/80" />
                          {p.features.suites ? `${p.features.suites} suítes` : `${p.features.dormitorios} dorms`}
                        </span>
                      )}
                      {p.features.vagas && (
                        <span className="flex items-center gap-1 text-foreground/70 text-xs font-sans">
                          <Car size={11} className="text-gold/80" />{p.features.vagas} vg
                        </span>
                      )}
                    </div>
                    {isAvailable && (
                      <Link href={`/imovel/${p.slug}${refParam}`}
                        className="inline-flex items-center gap-1.5 text-[var(--primary-default)] text-xs font-sans uppercase tracking-wider hover:opacity-75 transition-opacity">
                        Ver imóvel <ArrowRight size={12} />
                      </Link>
                    )}
                  </div>

                  {/* ── Desktop table row ── */}
                  <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-4 hover:bg-card/5 transition-colors">
                    <div className="col-span-4 flex flex-col gap-1">
                      <span className="font-serif text-foreground font-medium text-sm leading-tight">{p.title}</span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full border uppercase tracking-wider ${status.cls}`}>
                          {status.label}
                        </span>
                        {p.code && (
                          <span className="text-foreground/70 text-xs font-sans flex items-center gap-0.5">
                            <Hash size={8} />{p.code}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="col-span-2 flex items-center justify-center gap-1 text-foreground/70">
                      <Maximize2 size={12} className="text-foreground/50" />
                      <span className="font-sans text-xs">{p.features.area_m2 ? `${p.features.area_m2} m²` : "—"}</span>
                    </div>

                    <div className="col-span-2 flex items-center justify-center gap-1 text-foreground/70">
                      {(p.features.suites || p.features.dormitorios) && (
                        <span className="flex items-center gap-1 font-sans text-xs">
                          <BedDouble size={12} className="text-foreground/50" />
                          {p.features.suites ? `${p.features.suites} suítes` : `${p.features.dormitorios} dorms`}
                        </span>
                      )}
                    </div>

                    <div className="col-span-1 flex items-center justify-center text-foreground/70">
                      {p.features.vagas && (
                        <span className="flex items-center gap-1 font-sans text-xs">
                          <Car size={12} className="text-foreground/50" />{p.features.vagas}
                        </span>
                      )}
                    </div>

                    <div className="col-span-2 flex items-center justify-end">
                      <span className="font-serif text-sm font-semibold text-foreground">{formatPrice(p.price)}</span>
                    </div>

                    <div className="col-span-1 flex items-center justify-end gap-1.5">
                      {p.tags.slice(0, 1).map((tag) => {
                        const info = getTagInfo(tag)
                        const Icon = info.icon
                        return (
                          <span key={tag} title={info.label} className="flex items-center justify-center w-6 h-6 rounded-full border border-gold/40 text-gold/80">
                            <Icon size={10} />
                          </span>
                        )
                      })}
                      {isAvailable && (
                        <Link href={`/imovel/${p.slug}${refParam}`}
                          className="flex items-center justify-center w-7 h-7 rounded-full border border-gold/40 text-gold hover:bg-gold hover:text-foreground transition-all duration-300 ml-0.5">
                          <ArrowRight size={13} />
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-muted-foreground font-sans text-sm">Nenhuma unidade encontrada.</div>
          )}
          <div className="divider-gold opacity-20 mt-1" />
        </div>
      </section>

      {/* ── DOCUMENTOS ───────────────────────────────────────── */}
      {(development.documents?.length ?? 0) > 0 && (
        <section className="py-12 px-4 md:px-6 bg-[#0d0d0d] border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-sans mb-2">Downloads</p>
              <h2 className="font-serif text-2xl font-bold text-white">Documentos do Empreendimento</h2>
            </div>
            {canDownload ? (
              <div className="flex flex-wrap gap-3">
                {development.documents.map((doc, i) => (
                  <a
                    key={i}
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-5 py-4 bg-card/[0.03] border border-white/10 hover:border-gold/40 hover:bg-gold/5 transition-all duration-300 group rounded-xl"
                  >
                    <FileDown size={16} className="text-gold/80 group-hover:text-gold transition-colors flex-shrink-0" />
                    <div>
                      <p className="text-white/80 font-sans text-sm font-medium">{doc.name}</p>
                      <p className="text-white/60 font-sans text-xs uppercase tracking-wider mt-0.5">{doc.type}</p>
                    </div>
                    <ArrowRight size={12} className="text-white/20 group-hover:text-gold/80 ml-1 transition-colors" />
                  </a>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 px-5 py-4 bg-card/[0.03] border border-white/10 rounded-xl text-white/80 text-sm font-sans">
                <Lock size={14} className="flex-shrink-0 text-white/30" />
                <span>Disponível apenas para corretores e imobiliárias cadastrados.</span>
                <a href="/login" className="text-gold hover:underline ml-1 text-xs">Entrar</a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="py-16 md:py-28 px-5 bg-[#0a0a0a] text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-900/10 mb-6">
          <Flame size={13} className="text-orange-400" />
          <span className="text-orange-400 text-xs uppercase tracking-[0.2em] font-sans">Condições Especiais de Lançamento</span>
        </div>
        <h2 className="font-serif text-3xl md:text-5xl font-bold text-white mb-3">
          Garanta Sua Unidade
        </h2>
        <p className="text-white/60 font-sans text-base max-w-md mx-auto mb-8 px-2">
          As melhores unidades são reservadas nos primeiros dias. Fale com um consultor agora.
        </p>
        {waUrl && (
          <a href={waUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-10 py-4 bg-[var(--action-default)] text-white hover:bg-[var(--action-hover)] transition-all duration-300 text-sm uppercase tracking-[0.2em] font-sans">
            <MessageCircle size={15} /> Falar com Consultor
          </a>
        )}
      </section>
    </>
  )
}
