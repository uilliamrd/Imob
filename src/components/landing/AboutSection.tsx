"use client"

import { motion, type Variants } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"

interface AboutSectionProps {
  orgName: string
  portfolioDesc?: string
  logo?: string
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
}

export function AboutSection({ orgName, portfolioDesc, logo }: AboutSectionProps) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-32 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center"
        >
          {/* Left column: text */}
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-gold font-sans mb-6">
              Sobre a Construtora
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground leading-tight mb-8">
              Décadas de{" "}
              <span className="italic text-gradient-gold">Excelência</span>
              <br />
              em Cada Detalhe
            </h2>
            <div className="divider-gold mb-8 w-24" />
            <p className="text-muted-foreground font-sans text-lg leading-relaxed">
              {portfolioDesc ||
                "Construímos sonhos com a precisão de quem entende que um lar vai além de quatro paredes. Cada projeto é concebido para elevar o padrão de vida dos nossos moradores."}
            </p>
          </div>

          {/* Right column: logo + stats */}
          <div className="flex flex-col items-center lg:items-end gap-12">
            {logo && (
              <img src={logo} alt={orgName} className="max-h-20 object-contain" />
            )}
            <div className="grid grid-cols-3 gap-8 w-full">
              {[
                { value: "15+", label: "Anos no Mercado" },
                { value: "200+", label: "Unidades Entregues" },
                { value: "98%", label: "Satisfação dos Clientes" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="font-serif text-4xl font-bold text-gold">{stat.value}</p>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mt-2 font-sans">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
