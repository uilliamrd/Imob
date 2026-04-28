"use client"

import { useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useScroll, useTransform } from "framer-motion"
import { ChevronDown } from "lucide-react"

interface Props {
  heroImage: string | null
  totalProperties: number
  totalPartners: number
}

export function HeroSection({ heroImage, totalProperties, totalPartners }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const yBg  = useTransform(scrollYProgress, [0, 1], ["0%", "22%"])
  const opBg = useTransform(scrollYProgress, [0, 0.8], [1, 0.4])

  const stats = [
    { label: "imóveis",     value: totalProperties > 0 ? `+${totalProperties}` : "+" },
    { label: "parceiros",   value: totalPartners > 0 ? `+${totalPartners}` : "+" },
    { label: "exclusividade", value: "100%" },
  ]

  return (
    <div ref={ref} className="relative -mt-16 min-h-[88vh] flex flex-col justify-end overflow-hidden">
      {/* Background */}
      <motion.div className="absolute inset-0 w-full h-[120%] -top-[10%]" style={{ y: yBg, opacity: opBg }}>
        {heroImage ? (
          <Image src={heroImage} alt="Hero" fill className="object-cover" priority unoptimized />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#0f0f0f]" />
        )}
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 px-5 sm:px-8 pb-10 pt-28 max-w-7xl mx-auto w-full">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="inline-block text-[10px] uppercase tracking-[0.5em] text-gold font-sans mb-5"
        >
          Litoral Gaúcho · Premium
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white font-bold leading-[1.05] mb-6 max-w-3xl"
        >
          Encontre mais do que{" "}
          <em className="not-italic" style={{ color: "#C9A96E" }}>um imóvel.</em>
          <br />
          Encontre seu próximo{" "}
          <em className="not-italic italic">capítulo.</em>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.7 }}
          className="text-white/65 font-sans text-base sm:text-lg max-w-xl mb-8 leading-relaxed"
        >
          Seleção exclusiva de imóveis, lançamentos e oportunidades no litoral gaúcho e além.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85, duration: 0.6 }}
          className="flex flex-wrap gap-3 mb-10"
        >
          <button
            onClick={() => document.getElementById("buscar")?.scrollIntoView({ behavior: "smooth" })}
            className="px-7 py-3.5 bg-gold hover:bg-gold/90 text-[#0a0a0a] text-xs uppercase tracking-[0.25em] font-sans font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02]"
          >
            Explorar imóveis
          </button>
          <Link
            href="/venda"
            className="px-7 py-3.5 border border-white/30 hover:border-white/60 text-white text-xs uppercase tracking-[0.25em] font-sans rounded-xl transition-all duration-200 hover:bg-white/5"
          >
            Quero anunciar
          </Link>
        </motion.div>

        {/* Stats pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="flex flex-wrap gap-2"
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/8 backdrop-blur-sm"
            >
              <span className="font-serif text-white font-semibold text-sm">{s.value}</span>
              <span className="text-white/50 text-[11px] font-sans">{s.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center"
        >
          <ChevronDown size={14} className="text-white/50" />
        </motion.div>
      </motion.div>
    </div>
  )
}
