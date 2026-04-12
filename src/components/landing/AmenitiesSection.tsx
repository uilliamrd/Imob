"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Dumbbell, Waves, Utensils, Shield, Wifi, TreePine, Car, Sun } from "lucide-react"

const AMENITIES = [
  { icon: Waves, title: "Piscina Infinity", desc: "Vista panorâmica com borda infinita e deck molhado" },
  { icon: Dumbbell, title: "Fitness Exclusivo", desc: "Equipamentos de última geração com personal trainer" },
  { icon: Utensils, title: "Espaço Gourmet", desc: "Cozinha equipada e salão de festas privativo" },
  { icon: Shield, title: "Segurança 24h", desc: "Vigilância perimetral e portaria monitorada" },
  { icon: Wifi, title: "Smart Home", desc: "Automação residencial integrada em todos os ambientes" },
  { icon: TreePine, title: "Jardins Paisagísticos", desc: "Áreas verdes projetadas por renomado paisagista" },
  { icon: Car, title: "Vagas Duplas", desc: "Garagem coberta com carregador para veículos elétricos" },
  { icon: Sun, title: "Rooftop Privativo", desc: "Espaço exclusivo no cobertura com vista 360°" },
]

export function AmenitiesSection() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section ref={ref} className="py-32 px-6 bg-[#111111] relative overflow-hidden">
      {/* Gold radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(ellipse,rgba(201,169,110,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <p className="text-sm uppercase tracking-[0.3em] text-gold font-sans mb-4">
            Infraestrutura
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">
            Amenidades que{" "}
            <span className="italic text-gradient-gold">Transformam</span>
            <br />o Seu Dia a Dia
          </h2>
          <div className="divider-gold mt-8 mx-auto w-20" />
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5">
          {AMENITIES.map((amenity, i) => {
            const Icon = amenity.icon
            return (
              <motion.div
                key={amenity.title}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="bg-[#111111] p-8 group hover:bg-white/[0.03] transition-colors cursor-default"
              >
                <div className="w-10 h-10 rounded-xl border border-gold/20 flex items-center justify-center mb-5 group-hover:border-gold/50 group-hover:bg-gold/5 transition-all duration-300">
                  <Icon size={18} className="text-gold/60 group-hover:text-gold transition-colors" />
                </div>
                <h3 className="font-serif text-base font-semibold text-white mb-2">{amenity.title}</h3>
                <p className="text-white/40 text-sm font-sans leading-relaxed">{amenity.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
