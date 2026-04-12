"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getTagInfo } from '@/lib/tag-icons'
import type { Property } from '@/types/database'
import { BedDouble, Car, Maximize2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface UnitsTableProps {
  properties: Property[]
  refId?: string
}

const STATUS_MAP = {
  disponivel: { label: 'Disponivel', className: 'bg-emerald-900/30 text-emerald-300 border-emerald-700/50' },
  reserva: { label: 'Reservado', className: 'bg-amber-900/30 text-amber-300 border-amber-700/50' },
  vendido: { label: 'Vendido', className: 'bg-zinc-800 text-zinc-500 border-zinc-700/50' },
} as const

function formatPrice(price: number) {
  if (price >= 1_000_000)
    return 'R$ ' + (price / 1_000_000).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + ' Mi'
  return 'R$ ' + price.toLocaleString('pt-BR')
}

export function UnitsTable({ properties, refId }: UnitsTableProps) {
  const [activeFilter, setActiveFilter] = useState('todos')
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const filters = [
    { id: 'todos', label: 'Todas' },
    { id: 'disponivel', label: 'Disponiveis' },
    { id: 'reserva', label: 'Reservados' },
    { id: 'vendido', label: 'Vendidos' },
  ]

  const filtered = activeFilter === 'todos' ? properties : properties.filter((p) => p.status === activeFilter)
  const refParam = refId ? '?ref=' + refId : ''

  return (
    <section id="unidades" className="py-24 px-6 bg-graphite">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-gold font-sans mb-4">Portfolio de Unidades</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-white">
              Escolha o Seu <span className="italic text-gradient-gold">Estilo de Vida</span>
            </h2>
          </div>
          <div className="flex gap-2 flex-wrap">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={'px-5 py-2 text-xs uppercase tracking-[0.15em] font-sans transition-all duration-300 ' + (activeFilter === f.id ? 'bg-gold text-graphite' : 'border border-white/20 text-white/60 hover:border-gold/50 hover:text-gold')}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="divider-gold opacity-30 mb-2" />

        <div className="grid grid-cols-12 gap-4 px-6 py-4 text-xs uppercase tracking-[0.2em] text-white/30 font-sans">
          <span className="col-span-3">Unidade</span>
          <span className="col-span-2 text-center">Area</span>
          <span className="col-span-2 text-center">Dormitorios</span>
          <span className="col-span-2">Diferenciais</span>
          <span className="col-span-2 text-right">Preco</span>
          <span className="col-span-1" />
        </div>

        <div className="divider-gold opacity-20 mb-1" />

        <AnimatePresence mode="popLayout">
          {filtered.map((property, index) => {
            const status = STATUS_MAP[property.status as keyof typeof STATUS_MAP] ?? STATUS_MAP.disponivel
            const isAvailable = property.status === 'disponivel'
            return (
              <motion.div
                key={property.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                onMouseEnter={() => setHoveredId(property.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={'grid grid-cols-12 gap-4 px-6 py-5 transition-colors duration-300 ' + (hoveredId === property.id ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]') + (isAvailable ? '' : ' opacity-50')}
              >
                <div className="col-span-3 flex flex-col gap-1">
                  <span className="font-serif text-white font-semibold text-base leading-tight">{property.title}</span>
                  <span className={'inline-flex items-center self-start text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider ' + status.className}>{status.label}</span>
                </div>
                <div className="col-span-2 flex items-center justify-center gap-1 text-white/70">
                  <Maximize2 size={13} className="text-gold/70" />
                  <span className="font-sans text-sm">{property.features.area_m2 ? property.features.area_m2 + ' m2' : '-'}</span>
                </div>
                <div className="col-span-2 flex items-center justify-center gap-3 text-white/70">
                  {(property.features.suites || property.features.quartos) && (
                    <span className="flex items-center gap-1 font-sans text-sm">
                      <BedDouble size={13} className="text-gold/70" />
                      {property.features.suites ? property.features.suites + ' suites' : property.features.quartos + ' qts'}
                    </span>
                  )}
                  {property.features.vagas && (
                    <span className="flex items-center gap-1 font-sans text-sm">
                      <Car size={13} className="text-gold/70" />
                      {property.features.vagas}
                    </span>
                  )}
                </div>
                <div className="col-span-2 flex items-center gap-1.5 flex-wrap">
                  {property.tags.slice(0, 3).map((tag) => {
                    const info = getTagInfo(tag)
                    const Icon = info.icon
                    return (
                      <span key={tag} title={info.label} className="flex items-center justify-center w-7 h-7 rounded-full border border-gold/30 text-gold/70 hover:border-gold hover:text-gold transition-colors">
                        <Icon size={13} />
                      </span>
                    )
                  })}
                </div>
                <div className="col-span-2 flex items-center justify-end">
                  <span className="font-serif text-lg font-semibold text-white">{formatPrice(property.price)}</span>
                </div>
                <div className="col-span-1 flex items-center justify-end">
                  {isAvailable && (
                    <Link href={'/imovel/' + property.slug + refParam} className="flex items-center justify-center w-8 h-8 rounded-full border border-gold/40 text-gold hover:bg-gold hover:text-graphite transition-all duration-300">
                      <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-white/30 font-sans">Nenhuma unidade encontrada para este filtro.</div>
        )}
        <div className="divider-gold opacity-20 mt-1" />
      </div>
    </section>
  )
}
