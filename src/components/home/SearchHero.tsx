"use client"

import { useEffect, useState } from "react"
import { Search, MapPin, ChevronDown } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { PremiumButton } from "@/components/ui/premium"
import { scaleVariants } from "@/lib/design-system/motion"
import type { HomeFilters } from "@/components/home/HomeClient"

const TABS = [
  { value: "comprar",     label: "Comprar" },
  { value: "alugar",      label: "Alugar" },
  { value: "lancamentos", label: "Lançamentos" },
] as const

const TIPOS = [
  "Apartamento", "Casa", "Cobertura", "Kitnet / Studio",
  "Terreno", "Comercial",
]

const PRECOS = [
  { label: "Qualquer preço",          value: "" },
  { label: "Até R$ 300 mil",          value: "300000" },
  { label: "R$ 300 mil – R$ 600 mil", value: "600000" },
  { label: "R$ 600 mil – R$ 1 mi",    value: "1000000" },
  { label: "R$ 1 mi – R$ 2 mi",       value: "2000000" },
  { label: "Acima de R$ 2 mi",        value: "99999999" },
]

const SUGESTOES = [
  { label: "Praia",       filter: { tipo: "" } },
  { label: "2 quartos",   filter: { dorms: "2" } },
  { label: "Até 500 mil", filter: { priceMax: "500000" } },
  { label: "Lançamentos", filter: { tab: "lancamentos" as const } },
  { label: "Condomínio",  filter: { tipo: "Casa em Condomínio" } },
]

const SELECT_CLS =
  "w-full bg-card border border-border text-foreground/80 px-3 py-2.5 rounded-xl text-sm font-sans focus:outline-none focus:border-[var(--gold)]/50 transition-colors appearance-none"

interface Props {
  filters: HomeFilters
  onFilterChange: (patch: Partial<HomeFilters>) => void
  cityOptions: string[]
}

export function SearchHero({ filters, onFilterChange, cityOptions }: Props) {
  const [showSugestoes, setShowSugestoes] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowSugestoes(true), 400)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className="relative overflow-hidden bg-background pt-10 pb-16 px-4">
      {/* Decoração sutil */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-0 w-[600px] h-[600px] rounded-full bg-[var(--gold)]/8 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 w-96 h-96 rounded-full bg-[var(--forest)]/5 blur-3xl"
      />

      <div className="relative max-w-3xl mx-auto text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--gold)] font-sans mb-4">
          Ecossistema imobiliário
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
          Encontre seu imóvel ideal
        </h1>
        <p className="mt-4 text-lg text-muted-foreground font-sans max-w-xl mx-auto">
          Milhares de imóveis, lançamentos e oportunidades em um só lugar.
        </p>

        {/* Card de busca */}
        <motion.div
          variants={scaleVariants}
          initial="hidden"
          animate="visible"
          className="mt-10 glass-card rounded-2xl elevation-premium p-4 md:p-5 text-left"
        >
          {/* Tabs */}
          <div className="flex gap-1.5 mb-4">
            {TABS.map((t) => (
              <button
                key={t.value}
                onClick={() => onFilterChange({ tab: t.value })}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 font-sans",
                  filters.tab === t.value
                    ? "bg-[var(--forest)] text-[var(--forest-foreground)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Campos — desktop: linha única, mobile: empilhado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {/* Tipo */}
            <div className="relative">
              <select
                value={filters.tipo}
                onChange={(e) => onFilterChange({ tipo: e.target.value })}
                className={SELECT_CLS}
                aria-label="Tipo de imóvel"
              >
                <option value="">Tipo</option>
                {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
            </div>

            {/* Cidade/bairro */}
            <div className="relative lg:col-span-2">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 pointer-events-none" />
              <input
                list="cidades-list"
                type="text"
                placeholder="Cidade ou bairro"
                value={filters.cidade}
                onChange={(e) => onFilterChange({ cidade: e.target.value })}
                className={cn(SELECT_CLS, "pl-8")}
                aria-label="Cidade ou bairro"
              />
              <datalist id="cidades-list">
                {cityOptions.map((c) => <option key={c} value={c} />)}
              </datalist>
            </div>

            {/* Preço */}
            <div className="relative">
              <select
                value={filters.priceMax}
                onChange={(e) => onFilterChange({ priceMax: e.target.value })}
                className={SELECT_CLS}
                aria-label="Faixa de preço"
              >
                {PRECOS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
            </div>

            {/* Dormitórios */}
            <div className="relative">
              <select
                value={filters.dorms}
                onChange={(e) => onFilterChange({ dorms: e.target.value })}
                className={SELECT_CLS}
                aria-label="Dormitórios"
              >
                <option value="">Dorms</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
            </div>
          </div>

          <div className="mt-3">
            <PremiumButton
              variant="gold"
              size="lg"
              icon={Search}
              className="w-full sm:w-auto"
              onClick={() => {
                document.getElementById("grid-imoveis")?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              Buscar
            </PremiumButton>
          </div>
        </motion.div>

        {/* Sugestões rápidas */}
        {showSugestoes && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 flex flex-wrap items-center justify-center gap-2"
          >
            <span className="text-xs text-muted-foreground/60 font-sans">Buscas populares:</span>
            {SUGESTOES.map((s) => (
              <button
                key={s.label}
                onClick={() => onFilterChange(s.filter)}
                className="text-xs px-3 py-1.5 rounded-full border border-border bg-card text-muted-foreground hover:border-[var(--gold)]/40 hover:text-foreground transition-colors font-sans"
              >
                {s.label}
              </button>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}
