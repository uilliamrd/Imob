"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Copy, Check, Link2, ExternalLink } from "lucide-react"
import { BorderBeam } from "@/components/magicui/border-beam"

interface Property {
  id: string
  title: string
  slug: string
  status: string
  price: number
  neighborhood: string | null
  city: string | null
}

interface Profile {
  id: string
  full_name: string | null
  whatsapp: string | null
  creci: string | null
  avatar_url: string | null
  organization_id: string | null
}

interface RefLinksClientProps {
  userId: string
  properties: Property[]
  profile: Profile | null
}

function formatPrice(price: number) {
  if (price >= 1_000_000)
    return "R$ " + (price / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1 }) + " Mi"
  return "R$ " + price.toLocaleString("pt-BR")
}

export function RefLinksClient({ userId, properties, profile }: RefLinksClientProps) {
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""

  function getRefUrl(slug: string) {
    return `${baseUrl}/imovel/${slug}?ref=${userId}`
  }

  async function copyLink(slug: string) {
    await navigator.clipboard.writeText(getRefUrl(slug))
    setCopiedSlug(slug)
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  const filtered = properties.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.neighborhood?.toLowerCase().includes(search.toLowerCase()) ||
      p.city?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Profile card */}
      {profile && (
        <div className="relative bg-[#161616] border border-white/5 rounded-2xl p-6 mb-8 overflow-hidden">
          <BorderBeam size={250} duration={14} colorFrom="#C9A96E" colorTo="#E0C896" />
          <div className="flex items-center gap-4">
            {profile.avatar_url ? (
              <Image src={profile.avatar_url} alt="" width={56} height={56} className="w-14 h-14 rounded-full object-cover border-2 border-gold/30" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gold/10 border-2 border-gold/30 flex items-center justify-center">
                <span className="font-serif text-2xl font-bold text-gold">
                  {(profile.full_name ?? "U")[0].toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h3 className="font-serif text-xl font-semibold text-white">{profile.full_name ?? "Corretor"}</h3>
              {profile.creci && <p className="text-gold/60 text-xs font-sans uppercase tracking-wider">CRECI {profile.creci}</p>}
              {profile.whatsapp && <p className="text-white/40 text-sm font-sans mt-0.5">{profile.whatsapp}</p>}
            </div>
            <div className="ml-auto text-right">
              <p className="text-white/20 text-xs font-sans">Seu ID de Ref</p>
              <p className="font-mono text-gold/60 text-xs mt-0.5 select-all">{userId}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Filtrar imóveis..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#161616] border border-white/10 text-white placeholder-white/20 px-4 py-3 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/40 transition-colors"
        />
      </div>

      {/* Properties list */}
      <div className="space-y-2">
        <AnimatePresence>
          {filtered.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-[#161616] border border-white/5 rounded-xl px-5 py-4 flex items-center gap-4 hover:border-white/10 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-serif text-base font-semibold text-white truncate">{p.title}</h4>
                <p className="text-white/30 text-xs font-sans">
                  {p.neighborhood && `${p.neighborhood}, `}{p.city} · {formatPrice(p.price)}
                </p>
              </div>

              {/* Ref URL preview */}
              <div className="hidden md:flex items-center gap-2 flex-shrink-0 max-w-xs">
                <Link2 size={12} className="text-gold/40 flex-shrink-0" />
                <span className="text-white/20 text-xs font-mono truncate">
                  /imovel/{p.slug}?ref={userId.slice(0, 8)}...
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <a
                  href={getRefUrl(p.slug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg border border-white/10 text-white/30 hover:text-gold hover:border-gold/30 transition-colors"
                >
                  <ExternalLink size={14} />
                </a>
                <button
                  onClick={() => copyLink(p.slug)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-sans uppercase tracking-[0.1em] transition-all duration-300 ${
                    copiedSlug === p.slug
                      ? "border-emerald-700/40 bg-emerald-900/20 text-emerald-400"
                      : "border-gold/30 text-gold hover:bg-gold hover:text-graphite"
                  }`}
                >
                  {copiedSlug === p.slug ? (
                    <><Check size={12} /> Copiado</>
                  ) : (
                    <><Copy size={12} /> Copiar Link</>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-white/20 font-sans text-sm">
            Nenhum imóvel disponível.
          </div>
        )}
      </div>
    </div>
  )
}
