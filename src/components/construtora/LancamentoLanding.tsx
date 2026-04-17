"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { ChevronDown, MessageCircle, BedDouble, Car, Maximize2, ArrowRight, MapPin, Flame, ArrowLeft, Hash, FileDown, Lock } from "lucide-react"
import { getTagInfo } from "@/lib/tag-icons"
import type { Development, Organization, Property } from "@/types/database"

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

interface Props {
  development: Development
  org: Organization | null
  properties: Property[]
  refId?: string
  whatsapp: string
  canDownload?: boolean
}

export function LancamentoLanding({ development, org, properties, refId, whatsapp, canDownload = false }: Props) {
  const [activeFilter, setActiveFilter] = useState("todos")
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] })
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "20%"])

  const refParam = refId ? `?ref=${refId}` : ""
  const waMsg = encodeURIComponent(`Olá! Tenho interesse no lançamento ${development.name}.`)
  const orgSlug = org?.slug

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
      {/* ── HERO ──────────────────────────────────────────────── */}
      <div ref={heroRef} className="relative h-[100svh] min-h-[580px] overflow-hidden">
        <motion.div className="absolute inset-0 w-full h-[130%] -top-[15%]" style={{ y: yBg }}>
          <div className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: development.cover_image
              ? `url(${development.cover_image})`
              : "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
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
              <MapPin size={14} className="text-gold/60" />
              {development.neighborhood}{development.city ? `, ${development.city}` : ""}
            </motion.p>
          )}

          <motion.div initial={{ width: 0 }} animate={{ width: 36 }} transition={{ duration: 1, ease: "easeOut", delay: 0.9 }}
            className="h-px bg-gold/50 my-6" />

          {development.description && (
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1 }}
              className="text-white/60 font-sans text-base max-w-xl leading-relaxed mb-7 px-2">
              {development.description}
            </motion.p>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-3 w-full max-w-sm sm:max-w-none sm:w-auto">
            <button onClick={() => document.getElementById("unidades")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-4 border border-gold text-gold hover:bg-gold hover:text-graphite transition-all duration-500 text-sm uppercase tracking-[0.2em] font-sans w-full sm:w-auto">
              Ver Unidades {disponiveisCount > 0 && `(${disponiveisCount})`}
            </button>
            <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
              className="px-8 py-4 bg-gold text-graphite hover:bg-gold-light transition-all duration-500 text-sm uppercase tracking-[0.2em] font-sans flex items-center justify-center gap-2 w-full sm:w-auto">
              <MessageCircle size={15} /> Quero Saber Mais
            </a>
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
              <p className="text-white/30 text-[10px] uppercase tracking-wider font-sans">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── TABELA DE UNIDADES ────────────────────────────────── */}
      <section id="unidades" className="py-12 md:py-20 px-4 md:px-6 bg-graphite">
        <div className="max-w-6xl mx-auto">

          {/* Section header */}
          <div className="flex flex-col gap-5 mb-8 md:mb-12 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gold font-sans mb-2">Tabela de Preços</p>
              <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground">
                Escolha a Sua <span className="italic" style={{ color: "#C9A96E" }}>Unidade</span>
              </h2>
            </div>
            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
              {filters.map((f) => (
                <button key={f.id} onClick={() => setActiveFilter(f.id)}
                  className={`px-4 py-2 text-xs uppercase tracking-[0.15em] font-sans transition-all duration-300 rounded-full ${
                    activeFilter === f.id
                      ? "bg-gold text-[#1C1C1C] font-semibold"
                      : "border border-border text-foreground/55 hover:border-gold/50 hover:text-gold"
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divider-gold opacity-30 mb-1" />

          {/* Desktop table header — hidden on mobile */}
          <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-foreground/40 font-sans">
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
                  className={`border-b border-border/40 ${!isAvailable ? "opacity-55" : ""}`}>

                  {/* ── Mobile card ── */}
                  <div className="md:hidden px-1 py-4 hover:bg-muted/20 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex-1 min-w-0">
                        <p className="font-serif text-foreground font-semibold text-base leading-tight">{p.title}</p>
                        {p.code && (
                          <p className="text-muted-foreground text-[11px] font-sans mt-0.5 flex items-center gap-1">
                            <Hash size={9} /> Cód. {p.code}
                          </p>
                        )}
                      </div>
                      <p className="font-serif text-gold font-bold text-lg flex-shrink-0">{formatPrice(p.price)}</p>
                    </div>
                    <div className="flex items-center gap-2.5 flex-wrap mb-3">
                      <span className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full border font-sans ${status.cls}`}>
                        {status.label}
                      </span>
                      {p.features.area_m2 && (
                        <span className="flex items-center gap-1 text-muted-foreground text-xs font-sans">
                          <Maximize2 size={11} className="text-gold/60" />{p.features.area_m2} m²
                        </span>
                      )}
                      {(p.features.suites || p.features.dormitorios) && (
                        <span className="flex items-center gap-1 text-muted-foreground text-xs font-sans">
                          <BedDouble size={11} className="text-gold/60" />
                          {p.features.suites ? `${p.features.suites} suítes` : `${p.features.dormitorios} dorms`}
                        </span>
                      )}
                      {p.features.vagas && (
                        <span className="flex items-center gap-1 text-muted-foreground text-xs font-sans">
                          <Car size={11} className="text-gold/60" />{p.features.vagas} vg
                        </span>
                      )}
                    </div>
                    {isAvailable && (
                      <Link href={`/imovel/${p.slug}${refParam}`}
                        className="inline-flex items-center gap-1.5 text-gold text-xs font-sans uppercase tracking-wider hover:opacity-75 transition-opacity">
                        Ver imóvel <ArrowRight size={12} />
                      </Link>
                    )}
                  </div>

                  {/* ── Desktop table row ── */}
                  <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
                    <div className="col-span-4 flex flex-col gap-1">
                      <span className="font-serif text-foreground font-semibold text-base leading-tight">{p.title}</span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider ${status.cls}`}>
                          {status.label}
                        </span>
                        {p.code && (
                          <span className="text-muted-foreground text-[10px] font-sans flex items-center gap-0.5">
                            <Hash size={8} />{p.code}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="col-span-2 flex items-center justify-center gap-1 text-foreground/60">
                      <Maximize2 size={12} className="text-gold/60" />
                      <span className="font-sans text-sm">{p.features.area_m2 ? `${p.features.area_m2} m²` : "—"}</span>
                    </div>

                    <div className="col-span-2 flex items-center justify-center gap-1 text-foreground/60">
                      {(p.features.suites || p.features.dormitorios) && (
                        <span className="flex items-center gap-1 font-sans text-sm">
                          <BedDouble size={12} className="text-gold/60" />
                          {p.features.suites ? `${p.features.suites} suítes` : `${p.features.dormitorios} dorms`}
                        </span>
                      )}
                    </div>

                    <div className="col-span-1 flex items-center justify-center text-foreground/60">
                      {p.features.vagas && (
                        <span className="flex items-center gap-1 font-sans text-sm">
                          <Car size={12} className="text-gold/60" />{p.features.vagas}
                        </span>
                      )}
                    </div>

                    <div className="col-span-2 flex items-center justify-end">
                      <span className="font-serif text-lg font-semibold text-foreground">{formatPrice(p.price)}</span>
                    </div>

                    <div className="col-span-1 flex items-center justify-end gap-1.5">
                      {p.tags.slice(0, 1).map((tag) => {
                        const info = getTagInfo(tag)
                        const Icon = info.icon
                        return (
                          <span key={tag} title={info.label} className="flex items-center justify-center w-6 h-6 rounded-full border border-gold/20 text-gold/50">
                            <Icon size={10} />
                          </span>
                        )
                      })}
                      {isAvailable && (
                        <Link href={`/imovel/${p.slug}${refParam}`}
                          className="flex items-center justify-center w-7 h-7 rounded-full border border-gold/40 text-gold hover:bg-gold hover:text-[#1C1C1C] transition-all duration-300 ml-0.5">
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
            <div className="py-12 text-center text-muted-foreground/40 font-sans">Nenhuma unidade encontrada.</div>
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
                    className="flex items-center gap-3 px-5 py-4 bg-white/[0.03] border border-white/10 hover:border-gold/40 hover:bg-gold/5 transition-all duration-300 group rounded-xl"
                  >
                    <FileDown size={16} className="text-gold/60 group-hover:text-gold transition-colors flex-shrink-0" />
                    <div>
                      <p className="text-white/80 font-sans text-sm font-medium">{doc.name}</p>
                      <p className="text-white/40 font-sans text-[10px] uppercase tracking-wider mt-0.5">{doc.type}</p>
                    </div>
                    <ArrowRight size={12} className="text-white/20 group-hover:text-gold/60 ml-1 transition-colors" />
                  </a>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3 px-5 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-white/50 text-sm font-sans">
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
        <p className="text-white/40 font-sans text-base max-w-md mx-auto mb-8 px-2">
          As melhores unidades são reservadas nos primeiros dias. Fale com um consultor agora.
        </p>
        <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-10 py-4 bg-gold text-[#1C1C1C] hover:bg-gold-light transition-all duration-500 text-sm uppercase tracking-[0.2em] font-sans">
          <MessageCircle size={15} /> Falar com Consultor
        </a>
      </section>
    </>
  )
}
