"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import {
  MessageCircle, Phone, Star, User, Building2,
  ArrowRight, BedDouble, Car, Maximize2, MapPin, Flame,
} from "lucide-react"
import { getTagInfo } from "@/lib/tag-icons"
import type { Profile, Property } from "@/types/database"

function formatPrice(price: number) {
  if (price >= 1_000_000)
    return "R$ " + (price / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + " Mi"
  return "R$ " + price.toLocaleString("pt-BR")
}

interface Props {
  profile: Profile
  orgName: string | null
  properties: Property[]
  featuredIds?: Set<string>
  refId?: string
}

export function CorretorLanding({ profile, orgName, properties, featuredIds = new Set(), refId }: Props) {
  const [search, setSearch] = useState("")
  const refParam = refId ? `?ref=${refId}` : `?ref=${profile.id}`

  // Featured properties sorted first in the grid
  const sortedProperties = [...properties].sort(
    (a, b) => (featuredIds.has(b.id) ? 1 : 0) - (featuredIds.has(a.id) ? 1 : 0)
  )

  const whatsapp = profile.whatsapp?.replace(/\D/g, "") ?? ""
  const waMsg = encodeURIComponent(`Olá ${profile.full_name ?? ""}! Gostaria de saber mais sobre os imóveis disponíveis.`)
  const waUrl = whatsapp ? `https://wa.me/${whatsapp}?text=${waMsg}` : null

  const filtered = sortedProperties.filter((p) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      p.title.toLowerCase().includes(q) ||
      (p.neighborhood ?? "").toLowerCase().includes(q) ||
      (p.city ?? "").toLowerCase().includes(q)
    )
  })

  return (
    <>
      {/* ── HERO ── */}
      <section className="min-h-[60vh] bg-[#0a0a0a] flex items-center px-6 py-20 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#111] via-[#0a0a0a] to-black" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gold/5 blur-3xl" />

        <div className="relative max-w-5xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col md:flex-row items-center md:items-start gap-10"
          >
            {/* Photo */}
            <div className="flex-shrink-0">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name ?? "Corretor"}
                  className="w-40 h-40 rounded-full object-cover border-2 border-gold/40 shadow-2xl"
                />
              ) : (
                <div className="w-40 h-40 rounded-full bg-white/5 border-2 border-gold/20 flex items-center justify-center shadow-2xl">
                  <User size={56} className="text-gold/30" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: 48 }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-px bg-gold mb-6 hidden md:block"
              />
              <p className="text-xs uppercase tracking-[0.35em] text-gold/60 font-sans mb-3">
                Corretor de Imóveis
              </p>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-white leading-tight mb-4">
                {profile.full_name ?? "Corretor"}
              </h1>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
                {profile.creci && (
                  <span className="flex items-center gap-1.5 text-white/40 text-sm font-sans">
                    <Star size={13} className="text-gold/60" />
                    CRECI {profile.creci}
                  </span>
                )}
                {orgName && (
                  <span className="flex items-center gap-1.5 text-white/40 text-sm font-sans">
                    <Building2 size={13} className="text-gold/60" />
                    {orgName}
                  </span>
                )}
              </div>

              {profile.bio && (
                <p className="text-white/50 font-sans text-base leading-relaxed max-w-xl mb-8">
                  {profile.bio}
                </p>
              )}

              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                {waUrl && (
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs uppercase tracking-[0.2em] font-sans transition-colors rounded-lg"
                  >
                    <MessageCircle size={15} /> Falar no WhatsApp
                  </a>
                )}
                {whatsapp && (
                  <a
                    href={`tel:${whatsapp}`}
                    className="flex items-center gap-2 px-8 py-3 border border-white/10 text-white/60 hover:text-white hover:border-white/25 text-xs uppercase tracking-[0.2em] font-sans transition-colors rounded-lg"
                  >
                    <Phone size={15} /> Ligar
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── IMÓVEIS ── */}
      {properties.length > 0 && (
        <section className="py-20 px-6 bg-[#111]">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans mb-3">Portfólio</p>
                <h2 className="font-serif text-3xl md:text-4xl font-bold text-white">
                  Imóveis <span className="italic" style={{ color: "#C9A96E" }}>Disponíveis</span>
                </h2>
              </div>
              <input
                type="text"
                placeholder="Buscar por título, bairro..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-[#0a0a0a] border border-white/10 text-white placeholder-white/20 px-4 py-2.5 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/40 transition-colors w-full md:w-64"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((property, i) => {
                const isAvailable = property.status === "disponivel"
                return (
                  <motion.div
                    key={property.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    className={`bg-[#161616] border border-white/5 rounded-2xl overflow-hidden group hover:border-gold/20 transition-all ${!isAvailable ? "opacity-60" : ""}`}
                  >
                    {/* Image */}
                    <div className="aspect-video relative overflow-hidden">
                      {property.images[0] ? (
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#222] flex items-center justify-center">
                          <Building2 size={28} className="text-white/10" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className={`text-[10px] px-2 py-1 rounded-full border uppercase tracking-wider font-sans ${
                          property.status === "disponivel" ? "bg-emerald-900/60 text-emerald-300 border-emerald-700/50" :
                          property.status === "reserva"    ? "bg-amber-900/60 text-amber-300 border-amber-700/50" :
                                                             "bg-zinc-800 text-zinc-500 border-zinc-700/50"
                        }`}>
                          {property.status === "disponivel" ? "Disponível" : property.status === "reserva" ? "Reservado" : "Vendido"}
                        </span>
                      </div>
                      {featuredIds.has(property.id) && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 bg-[#C9A96E]/90 rounded-full">
                          <Flame size={9} className="text-[#0a0a0a]" />
                          <span className="text-[9px] font-sans text-[#0a0a0a] font-bold uppercase tracking-wider">Destaque</span>
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div className="p-5">
                      <h3 className="font-serif text-white font-semibold text-base leading-snug mb-2 line-clamp-2">
                        {property.title}
                      </h3>

                      {(property.neighborhood || property.city) && (
                        <p className="flex items-center gap-1 text-white/30 text-xs font-sans mb-3">
                          <MapPin size={10} />
                          {property.neighborhood}{property.city ? `, ${property.city}` : ""}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-white/40 text-xs font-sans mb-4">
                        {property.features.area_m2 && (
                          <span className="flex items-center gap-1">
                            <Maximize2 size={11} className="text-gold/50" />
                            {property.features.area_m2} m²
                          </span>
                        )}
                        {(property.features.suites || property.features.dormitorios) && (
                          <span className="flex items-center gap-1">
                            <BedDouble size={11} className="text-gold/50" />
                            {property.features.suites
                              ? `${property.features.suites} suítes`
                              : `${property.features.dormitorios} dorms`}
                          </span>
                        )}
                        {property.features.vagas && (
                          <span className="flex items-center gap-1">
                            <Car size={11} className="text-gold/50" />
                            {property.features.vagas}
                          </span>
                        )}
                      </div>

                      {/* Tags */}
                      {property.tags.length > 0 && (
                        <div className="flex gap-1.5 mb-4 flex-wrap">
                          {property.tags.slice(0, 4).map((tag) => {
                            const info = getTagInfo(tag)
                            const Icon = info.icon
                            return (
                              <span key={tag} title={info.label}
                                className="flex items-center justify-center w-6 h-6 rounded-full border border-gold/20 text-gold/50">
                                <Icon size={11} />
                              </span>
                            )
                          })}
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span className="font-serif text-white font-semibold text-lg">
                          {formatPrice(property.price)}
                        </span>
                        {isAvailable && (
                          <Link
                            href={`/imovel/${property.slug}${refParam}`}
                            className="flex items-center gap-1.5 text-gold text-xs font-sans uppercase tracking-wider hover:text-gold-light transition-colors"
                          >
                            Ver <ArrowRight size={12} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {filtered.length === 0 && (
              <div className="py-16 text-center text-white/20 font-sans text-sm">
                Nenhum imóvel encontrado.
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── CONTATO ── */}
      {waUrl && (
        <section className="py-24 px-6 bg-[#0a0a0a] text-center border-t border-white/5">
          <p className="text-xs uppercase tracking-[0.4em] text-gold/60 font-sans mb-4">Contato</p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-3">
            Pronto para <span className="italic" style={{ color: "#C9A96E" }}>encontrar seu imóvel?</span>
          </h2>
          {profile.bio && (
            <p className="text-white/30 font-sans max-w-md mx-auto mb-8 text-sm">{profile.bio}</p>
          )}
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm uppercase tracking-[0.2em] font-sans transition-colors rounded-lg"
          >
            <MessageCircle size={16} /> Falar com {profile.full_name?.split(" ")[0] ?? "o Corretor"}
          </a>
        </section>
      )}
    </>
  )
}
