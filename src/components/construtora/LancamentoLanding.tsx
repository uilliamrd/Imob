"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion"
import { useState } from "react"
import { ChevronDown, MessageCircle, BedDouble, Car, Maximize2, ArrowRight, MapPin, Flame, ArrowLeft, Hash } from "lucide-react"
import { getTagInfo } from "@/lib/tag-icons"
import type { Development, Organization, Property } from "@/types/database"

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

interface Props {
  development: Development
  org: Organization | null
  properties: Property[]
  refId?: string
  whatsapp: string
}

export function LancamentoLanding({ development, org, properties, refId, whatsapp }: Props) {
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
      <div ref={heroRef} className="relative h-screen overflow-hidden">
        <motion.div className="absolute inset-0 w-full h-[130%] -top-[15%]" style={{ y: yBg }}>
          <div className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: development.cover_image
              ? `url(${development.cover_image})`
              : "linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
        </motion.div>

        {/* Nav */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-4">
            {orgSlug && (
              <Link href={`/construtora/${orgSlug}`}
                className="flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors text-xs font-sans">
                <ArrowLeft size={14} /> {org?.name ?? "Voltar"}
              </Link>
            )}
          </div>
          {org?.logo && <Image src={org.logo} alt={org.name} width={120} height={32} className="h-8 w-auto object-contain opacity-70" />}
        </div>

        <motion.div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6"
          style={{ y: yText, opacity }}>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/40 bg-orange-900/20 mb-8">
            <Flame size={13} className="text-orange-400" />
            <span className="text-orange-400 text-xs uppercase tracking-[0.2em] font-sans">Lançamento Exclusivo</span>
          </motion.div>

          <motion.div initial={{ width: 0 }} animate={{ width: 60 }} transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
            className="h-px bg-gold mb-8" />

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl text-white font-bold leading-tight max-w-4xl">
            {development.name}
          </motion.h1>

          {(development.neighborhood || development.city) && (
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.8 }}
              className="flex items-center gap-2 text-white/50 font-sans text-lg mt-4">
              <MapPin size={16} className="text-gold/60" />
              {development.neighborhood}{development.city ? `, ${development.city}` : ""}
            </motion.p>
          )}

          <motion.div initial={{ width: 0 }} animate={{ width: 40 }} transition={{ duration: 1, ease: "easeOut", delay: 0.9 }}
            className="h-px bg-gold/50 my-8" />

          {development.description && (
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1 }}
              className="text-white/60 font-sans text-lg max-w-2xl leading-relaxed mb-8">
              {development.description}
            </motion.p>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => document.getElementById("unidades")?.scrollIntoView({ behavior: "smooth" })}
              className="px-10 py-4 border border-gold text-gold hover:bg-gold hover:text-graphite transition-all duration-500 text-sm uppercase tracking-[0.2em] font-sans">
              Ver Unidades {disponiveisCount > 0 && `(${disponiveisCount} disponíveis)`}
            </button>
            <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
              className="px-10 py-4 bg-gold text-graphite hover:bg-gold-light transition-all duration-500 text-sm uppercase tracking-[0.2em] font-sans flex items-center justify-center gap-2">
              <MessageCircle size={16} /> Quero Saber Mais
            </a>
          </motion.div>
        </motion.div>

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
          animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
          <ChevronDown className="text-gold/70" size={24} />
        </motion.div>
      </div>

      {/* ── STATS BAR ─────────────────────────────────────────── */}
      <div className="bg-[#111] border-y border-white/5 py-8 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { label: "Unidades Totais", value: properties.length.toString() },
            { label: "Disponíveis", value: properties.filter(p => p.status === "disponivel").length.toString() },
            { label: "Menor Preço", value: properties.length ? formatPrice(Math.min(...properties.map(p => p.price))) : "—" },
            { label: "Maior Área", value: properties.length ? `${Math.max(...properties.map(p => p.features.area_m2 ?? 0))} m²` : "—" },
          ].map((s) => (
            <div key={s.label}>
              <p className="font-serif text-2xl font-bold text-white mb-1">{s.value}</p>
              <p className="text-white/30 text-xs uppercase tracking-wider font-sans">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── TABELA DE UNIDADES ────────────────────────────────── */}
      <section id="unidades" className="py-24 px-6 bg-graphite">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-gold font-sans mb-4">Tabela de Preços</p>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">
                Escolha a Sua <span className="italic" style={{ color: "#C9A96E" }}>Unidade</span>
              </h2>
            </div>
            <div className="flex gap-2 flex-wrap">
              {filters.map((f) => (
                <button key={f.id} onClick={() => setActiveFilter(f.id)}
                  className={`px-5 py-2 text-xs uppercase tracking-[0.15em] font-sans transition-all duration-300 ${
                    activeFilter === f.id ? "bg-gold text-graphite" : "border border-white/20 text-white/60 hover:border-gold/50 hover:text-gold"
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="divider-gold opacity-30 mb-2" />

          {/* Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 text-xs uppercase tracking-[0.2em] text-white/30 font-sans">
            <span className="col-span-3">Unidade</span>
            <span className="col-span-1 text-center">Cód.</span>
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
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                  className={`grid grid-cols-12 gap-4 px-6 py-5 hover:bg-white/[0.03] transition-colors border-b border-white/[0.03] ${!isAvailable ? "opacity-50" : ""}`}>

                  <div className="col-span-3 flex flex-col gap-1">
                    <span className="font-serif text-white font-semibold text-base leading-tight">{p.title}</span>
                    <span className={`inline-flex items-center self-start text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider ${status.cls}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="col-span-1 flex items-center justify-center">
                    {p.code && (
                      <span className="text-white/25 text-xs font-sans flex items-center gap-0.5">
                        <Hash size={9} />{p.code}
                      </span>
                    )}
                  </div>

                  <div className="col-span-2 flex items-center justify-center gap-1 text-white/70">
                    <Maximize2 size={13} className="text-gold/70" />
                    <span className="font-sans text-sm">{p.features.area_m2 ? `${p.features.area_m2} m²` : "—"}</span>
                  </div>

                  <div className="col-span-2 flex items-center justify-center gap-2 text-white/70">
                    {(p.features.suites || p.features.dormitorios) && (
                      <span className="flex items-center gap-1 font-sans text-sm">
                        <BedDouble size={13} className="text-gold/70" />
                        {p.features.suites ? `${p.features.suites} suítes` : `${p.features.dormitorios} dorms`}
                      </span>
                    )}
                  </div>

                  <div className="col-span-1 flex items-center justify-center text-white/70">
                    {p.features.vagas && (
                      <span className="flex items-center gap-1 font-sans text-sm">
                        <Car size={13} className="text-gold/70" />
                        {p.features.vagas}
                      </span>
                    )}
                  </div>

                  <div className="col-span-2 flex items-center justify-end">
                    <span className="font-serif text-lg font-semibold text-white">{formatPrice(p.price)}</span>
                  </div>

                  <div className="col-span-1 flex items-center justify-end gap-1.5">
                    {/* Tags icons */}
                    {p.tags.slice(0, 2).map((tag) => {
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
                        className="flex items-center justify-center w-7 h-7 rounded-full border border-gold/40 text-gold hover:bg-gold hover:text-graphite transition-all duration-300 ml-1">
                        <ArrowRight size={13} />
                      </Link>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="py-16 text-center text-white/30 font-sans">Nenhuma unidade encontrada.</div>
          )}
          <div className="divider-gold opacity-20 mt-1" />
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="py-32 px-6 bg-[#0a0a0a] text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-900/10 mb-8">
          <Flame size={14} className="text-orange-400" />
          <span className="text-orange-400 text-xs uppercase tracking-[0.2em] font-sans">Condições Especiais de Lançamento</span>
        </div>
        <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-4">
          Garanta Sua Unidade
        </h2>
        <p className="text-white/40 font-sans text-lg max-w-xl mx-auto mb-10">
          As melhores unidades são reservadas nos primeiros dias. Fale com um consultor agora.
        </p>
        <a href={`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${waMsg}`} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-12 py-4 bg-gold text-graphite hover:bg-gold-light transition-all duration-500 text-sm uppercase tracking-[0.2em] font-sans">
          <MessageCircle size={16} /> Falar com Consultor
        </a>
      </section>
    </>
  )
}
