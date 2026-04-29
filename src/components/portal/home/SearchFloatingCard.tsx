"use client"

import { Search, X, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react"
import type { PortalOrg } from "@/app/(portal)/page"

const CATEGORIAS = [
  "Apartamento", "Casa", "Casa em Condomínio", "Cobertura",
  "Kitnet / Studio", "Terreno", "Lote em Condomínio Fechado", "Lote em Rua",
  "Sala Comercial", "Loja", "Galpão / Depósito", "Sítio / Fazenda",
]

interface Props {
  search: string;        setSearch:    (v: string) => void
  filterNegocio: string; setNegocio:   (v: string) => void
  filterCategoria: string; setCategoria: (v: string) => void
  filterCity: string;    setCity:      (v: string) => void
  filterBairro: string;  setBairro:    (v: string) => void
  filterBeds: string;    setBeds:      (v: string) => void
  filterVagas: string;   setVagas:     (v: string) => void
  priceMin: string;      setPriceMin:  (v: string) => void
  priceMax: string;      setPriceMax:  (v: string) => void
  filterOrg: string;     setOrg:       (v: string) => void
  showFilters: boolean;  setShowFilters: (v: boolean) => void
  activeFilters: number
  clearAll: () => void
  cityOptions: string[]
  bairroOptions: string[]
  orgs: PortalOrg[]
  maskBRNumber: (v: string) => string
}

const SEL = "w-full bg-transparent border-0 text-foreground/80 font-sans text-sm py-0 focus:outline-none focus:ring-0 cursor-pointer"

function Divider() {
  return <div className="hidden md:block w-px h-8 bg-border flex-shrink-0" />
}

export function SearchFloatingCard(p: Props) {
  return (
    <div id="buscar" className="relative z-20 mx-3 sm:mx-6 lg:mx-auto lg:max-w-5xl -mt-8 sm:-mt-10">
      <div className="bg-background/98 backdrop-blur-xl border border-border rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">

        {/* Main row */}
        <div className="flex flex-col md:flex-row md:items-center gap-0">

          {/* Text search */}
          <div className="flex items-center gap-3 px-5 py-4 flex-1 min-w-0">
            <Search size={16} className="text-muted-foreground/50 flex-shrink-0" />
            <input
              type="text"
              placeholder="Título, bairro, cidade..."
              value={p.search}
              onChange={(e) => p.setSearch(e.target.value)}
              className="flex-1 bg-transparent border-0 text-foreground placeholder-muted-foreground/40 font-sans text-sm focus:outline-none min-w-0"
            />
            {p.search && (
              <button onClick={() => p.setSearch("")} className="text-muted-foreground/50 hover:text-foreground flex-shrink-0">
                <X size={12} />
              </button>
            )}
          </div>

          <Divider />

          {/* Negócio */}
          <div className="px-5 py-4 md:w-36 flex-shrink-0">
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 font-sans mb-1">Negócio</p>
            <select value={p.filterNegocio} onChange={(e) => p.setNegocio(e.target.value)} className={SEL}>
              <option value="">Comprar/Alugar</option>
              <option value="Venda">Comprar</option>
              <option value="Locação">Alugar</option>
            </select>
          </div>

          <Divider />

          {/* Tipo */}
          <div className="px-5 py-4 md:w-44 flex-shrink-0">
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 font-sans mb-1">Tipo</p>
            <select value={p.filterCategoria} onChange={(e) => p.setCategoria(e.target.value)} className={SEL}>
              <option value="">Tipo de imóvel</option>
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <Divider />

          {/* Cidade */}
          <div className="px-5 py-4 md:w-40 flex-shrink-0">
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 font-sans mb-1">Cidade</p>
            <select value={p.filterCity} onChange={(e) => { p.setCity(e.target.value); p.setBairro("") }} className={SEL}>
              <option value="">Qualquer cidade</option>
              {p.cityOptions.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <Divider />

          {/* Preço */}
          <div className="px-5 py-4 md:w-36 flex-shrink-0">
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 font-sans mb-1">Preço máx.</p>
            <input
              type="text"
              placeholder="Sem limite"
              value={p.priceMax}
              onChange={(e) => p.setPriceMax(p.maskBRNumber(e.target.value))}
              className="w-full bg-transparent border-0 text-foreground/80 placeholder-muted-foreground/40 font-sans text-sm py-0 focus:outline-none"
            />
          </div>

          {/* Buscar button */}
          <div className="p-3 md:pr-3 md:pl-2">
            <button
              onClick={() => document.getElementById("grid-imoveis")?.scrollIntoView({ behavior: "smooth" })}
              className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-gold hover:bg-gold/90 text-[#0a0a0a] text-xs uppercase tracking-[0.2em] font-sans font-semibold rounded-xl transition-all duration-200 hover:scale-[1.01]"
            >
              <Search size={13} /> Buscar
            </button>
          </div>
        </div>

        {/* More filters toggle */}
        <div className="px-5 py-2.5 border-t border-border/50 flex items-center justify-between">
          <button
            onClick={() => p.setShowFilters(!p.showFilters)}
            className={`flex items-center gap-2 text-xs font-sans transition-colors ${
              p.activeFilters > 0 ? "text-gold" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <SlidersHorizontal size={12} />
            Mais filtros
            {p.activeFilters > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-gold text-[#0a0a0a] text-[9px] font-bold min-w-[18px] text-center">
                {p.activeFilters}
              </span>
            )}
            {p.showFilters ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
          {p.activeFilters > 0 && (
            <button onClick={p.clearAll} className="flex items-center gap-1 text-xs font-sans text-muted-foreground hover:text-foreground transition-colors">
              <X size={10} /> Limpar
            </button>
          )}
        </div>

        {/* Expanded filters */}
        {p.showFilters && (
          <div className="px-5 pb-5 border-t border-border/50 pt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {p.bairroOptions.length > 0 && (
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 font-sans mb-1.5">Bairro</p>
                <select value={p.filterBairro} onChange={(e) => p.setBairro(e.target.value)}
                  className="w-full bg-card border border-border text-foreground/80 px-3 py-2 rounded-xl font-sans text-sm focus:outline-none focus:border-gold/40">
                  <option value="">Todos</option>
                  {p.bairroOptions.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            )}
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 font-sans mb-1.5">Dormitórios</p>
              <select value={p.filterBeds} onChange={(e) => p.setBeds(e.target.value)}
                className="w-full bg-card border border-border text-foreground/80 px-3 py-2 rounded-xl font-sans text-sm focus:outline-none focus:border-gold/40">
                <option value="">Qualquer</option>
                <option value="1">1+</option><option value="2">2+</option>
                <option value="3">3+</option><option value="4">4+</option>
              </select>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 font-sans mb-1.5">Vagas</p>
              <select value={p.filterVagas} onChange={(e) => p.setVagas(e.target.value)}
                className="w-full bg-card border border-border text-foreground/80 px-3 py-2 rounded-xl font-sans text-sm focus:outline-none focus:border-gold/40">
                <option value="">Qualquer</option>
                <option value="1">1+</option><option value="2">2+</option><option value="3">3+</option>
              </select>
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 font-sans mb-1.5">Preço mín.</p>
              <input type="text" placeholder="Sem mínimo" value={p.priceMin}
                onChange={(e) => p.setPriceMin(p.maskBRNumber(e.target.value))}
                className="w-full bg-card border border-border text-foreground/80 placeholder-muted-foreground/40 px-3 py-2 rounded-xl font-sans text-sm focus:outline-none focus:border-gold/40" />
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/50 font-sans mb-1.5">Parceiro</p>
              <select value={p.filterOrg} onChange={(e) => p.setOrg(e.target.value)}
                className="w-full bg-card border border-border text-foreground/80 px-3 py-2 rounded-xl font-sans text-sm focus:outline-none focus:border-gold/40">
                <option value="">Todos</option>
                {p.orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
