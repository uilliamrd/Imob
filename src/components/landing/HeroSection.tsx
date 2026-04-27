"use client"

import { useEffect, useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ChevronDown } from "lucide-react"

interface HeroSectionProps {
  orgName: string
  tagline?: string
  videoUrl?: string
  backgroundImage?: string
}

export function HeroSection({
  orgName,
  tagline = "Onde a Excelência se Encontra com o Lar",
  videoUrl,
  backgroundImage,
}: HeroSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const yBg = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])
  const yText = useTransform(scrollYProgress, [0, 1], ["0%", "20%"])

  return (
    <div ref={ref} className="relative h-screen overflow-hidden">
      {/* Video / Image background with parallax */}
      <motion.div
        className="absolute inset-0 w-full h-[130%] -top-[15%]"
        style={{ y: yBg }}
      >
        {videoUrl ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            poster={backgroundImage}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : (
          <div
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: backgroundImage
                ? `url(${backgroundImage})`
                : "linear-gradient(135deg, #1C1C1C 0%, #3A3A3A 50%, #1C1C1C 100%)",
            }}
          />
        )}
        {/* Multi-layer overlay for cinematic look */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
      </motion.div>

      {/* Hero content */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6"
        style={{ y: yText, opacity }}
      >
        {/* Eyebrow gold line */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 80 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          className="h-px bg-gold mb-8"
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-sm uppercase tracking-[0.3em] text-gold font-sans mb-4"
        >
          Empreendimentos de Alto Padrão
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.7 }}
          className="font-serif text-5xl md:text-7xl lg:text-8xl text-white font-bold leading-tight max-w-5xl"
        >
          {orgName}
        </motion.h1>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 60 }}
          transition={{ duration: 1, ease: "easeOut", delay: 1 }}
          className="h-px bg-gold/60 my-8"
        />

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="text-lg md:text-xl text-white/80 font-sans font-light max-w-2xl leading-relaxed"
        >
          {tagline}
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          onClick={() => document.getElementById("unidades")?.scrollIntoView({ behavior: "smooth" })}
          className="mt-12 px-10 py-4 border border-gold text-gold hover:bg-gold hover:text-[#1C1C1C] transition-all duration-500 text-sm uppercase tracking-[0.2em] font-sans"
        >
          Explorar Unidades
        </motion.button>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChevronDown className="text-gold/70" size={24} />
      </motion.div>
    </div>
  )
}
