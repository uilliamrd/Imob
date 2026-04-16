"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { BedDouble, Car, Maximize2, MessageCircle, Search, MapPin, Hash } from "lucide-react"
import { getTagInfo } from "@/lib/tag-icons"
import type { Organization, Property } from "@/types/database"

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
  org: Organization
  properties: Property[]
  refId?: string
  whatsapp: string
}

export function ImobiliariaLanding({ org, properties, refId, whatsapp }: Props) {
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("todos")

  const brandColor = org.brand_colors?.primary ?? "#C4A052"
  const refParam = refId ? `?ref=${refId}` : ""

  const filtered = properties.filter((p) => {
    const matchSearch = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.neighborhood ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.city ?? "").toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === "todos" || p.status === filterStatus
    return matchSearch && matchStatus
  })

  const forSale = properties.filter((p) => p.status !== "vendido")

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-[60vh] flex flex-col items-center justify-center overflow-hidden">
        {org.hero_image && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${org.hero_image})` }}
          >
            <div className="absolute inset-0 bg-black/70" />
          </div>
        )}
        {!org.hero_image && (
          <div className="absolute inset-0 bg-gradient-to-b from-[#111] to-[#0a0a0a]" />
        )}

        <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
          {org.logo && (
            <Image src={org.logo} alt={org.name} width={240} height={64} className="h-16 w-auto mx-auto mb-8 object-contain" />
          )}
          <p className="text-xs uppercase tracking-[0.4em] mb-4 font-sans" style={{ color: brandColor }}>
            Imobiliária
          </p>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-white mb-4">
            {org.name}
          </h1>
          {org.hero_tagline && (
            <p className="text-white/80 font-sans text-lg mt-4 max-w-xl mx-auto">{org.hero_tagline}</p>
          )}
          <div className="mt-6 h-px w-16 mx-auto" style={{ backgroundColor: brandColor + "60" }} />
          <p className="text-white/60 font-sans text-sm mt-4">
            {forSale.length} imóveis disponíveis
          </p>
        </div>
      </section>

      {/* ── Sobre ─────────────────────────────────────────────── */}
      {(org.about_text || org.portfolio_desc) && (
        <section className="py-20 px-6 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] mb-4 font-sans" style={{ color: brandColor }}>
                Sobre nós
              </p>
              <p className="text-white/60 font-sans leading-relaxed">
                {org.about_text ?? org.portfolio_desc}
              </p>
              {org.website && (
                <a href={org.website} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-6 text-sm font-sans transition-colors"
                  style={{ color: brandColor }}>
                  Visitar site →
                </a>
              )}
            </div>
            {org.about_image && (
              <div className="relative w-full aspect-square rounded-2xl overflow-hidden">
                <Image src={org.about_image} alt="Sobre" fill className="object-cover" />
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Imóveis ─────────────────────────────────────────────── */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] mb-3 font-sans" style={{ color: brandColor }}>
            Portfólio
          </p>
          <h2 className="font-serif text-4xl font-bold text-white">Nossos Imóveis</h2>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Buscar por título ou bairro..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border border-white/10 text-white placeholder-white/20 pl-9 pr-4 py-2.5 rounded-lg font-sans text-sm focus:outline-none focus:border-white/30 transition-colors min-w-60"
            />
          </div>
          {(["todos", "disponivel", "reserva", "vendido"] as const).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-4 py-2.5 rounded-lg text-xs font-sans uppercase tracking-wider transition-colors border ${
                filterStatus === s
                  ? "text-[#0a0a0a] border-transparent"
                  : "bg-transparent border-white/10 text-white/40 hover:text-white/60"
              }`}
              style={filterStatus === s ? { backgroundColor: brandColor, borderColor: brandColor } : {}}>
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
                className="group block bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300"
              >
                <div className="aspect-video relative overflow-hidden bg-[#111]">
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
                      <MapPin size={10} />{p.neighborhood}, {p.city}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-white/60 text-xs font-sans mb-4">
                    {p.features.area_m2 && <span className="flex items-center gap-1"><Maximize2 size={11} />{p.features.area_m2}m²</span>}
                    {(p.features.suites || p.features.dormitorios) && (
                      <span className="flex items-center gap-1">
                        <BedDouble size={11} />
                        {p.features.suites ? `${p.features.suites} suítes` : `${p.features.dormitorios} dorms`}
                      </span>
                    )}
                    {p.features.vagas && <span className="flex items-center gap-1"><Car size={11} />{p.features.vagas} vagas</span>}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-serif text-xl font-bold text-white">{formatPrice(p.price)}</p>
                    <div className="flex gap-1">
                      {p.tags.slice(0, 3).map((tag) => {
                        const info = getTagInfo(tag)
                        const Icon = info.icon
                        return (
                          <span key={tag} title={info.label}
                            className="w-6 h-6 rounded-full border flex items-center justify-center"
                            style={{ borderColor: brandColor + "40", color: brandColor + "80" }}>
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
      </section>

      {/* ── CTA WhatsApp ─────────────────────────────────────────────── */}
      <section className="py-16 px-6 text-center border-t border-white/5">
        <p className="text-white/40 font-sans mb-4">Encontrou o imóvel ideal?</p>
        <a
          href={`https://wa.me/${whatsapp.replace(/\D/g, "")}?text=Olá, vim pelo site da ${encodeURIComponent(org.name)} e gostaria de mais informações.`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-[#0a0a0a] font-sans text-sm uppercase tracking-[0.2em] transition-all hover:brightness-110"
          style={{ backgroundColor: brandColor }}
        >
          <MessageCircle size={16} />
          Falar pelo WhatsApp
        </a>
      </section>
    </div>
  )
}
