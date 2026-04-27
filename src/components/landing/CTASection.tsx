"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Spotlight } from "@/components/magicui/spotlight"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import { Particles } from "@/components/magicui/particles"
import { MessageCircle } from "lucide-react"

interface CTASectionProps {
  whatsapp: string
  orgName: string
}

export function CTASection({ whatsapp, orgName }: CTASectionProps) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  const whatsappUrl = `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Olá! Tenho interesse nos empreendimentos ${orgName}.`
  )}`

  return (
    <section ref={ref} className="relative py-40 px-6 bg-[#1C1C1C] overflow-hidden">
      <Spotlight className="-top-40 left-0 md:left-60" fill="#C9A96E" />
      <Particles quantity={30} color="#C9A96E" className="opacity-40" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9 }}
        >
          <div className="divider-gold mb-10 mx-auto w-16" />

          <p className="text-sm uppercase tracking-[0.4em] text-gold/70 font-sans mb-6">
            Seu Próximo Passo
          </p>

          <h2 className="font-serif text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
            Pronto para{" "}
            <span className="italic text-gradient-gold">Elevar</span>
            <br />
            o Seu Padrão de Vida?
          </h2>

          <p className="text-white/50 font-sans text-lg leading-relaxed mb-12 max-w-xl mx-auto">
            Fale com um de nossos consultores especializados e agende uma visita presencial ao empreendimento.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <ShimmerButton className="px-10 py-4 flex items-center gap-2">
                <MessageCircle size={16} />
                Falar com Consultor
              </ShimmerButton>
            </a>
            <button
              onClick={() => document.getElementById("unidades")?.scrollIntoView({ behavior: "smooth" })}
              className="px-10 py-4 border border-white/20 text-white/70 hover:border-gold/50 hover:text-gold transition-all duration-400 text-xs uppercase tracking-[0.2em] font-sans"
            >
              Ver Unidades
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
