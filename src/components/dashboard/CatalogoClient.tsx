"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Star, Trash2, BedDouble, Car, Maximize2, MapPin, Home, ExternalLink, Search, X } from "lucide-react"
import type { UserRole } from "@/types/database"
import type { CatalogListing } from "@/app/(dashboard)/dashboard/catalogo/page"

function formatPrice(price: number) {
  if (price >= 1_000_000)
    return "R$ " + (price / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + " Mi"
  return "R$ " + price.toLocaleString("pt-BR")
}

const MAX_FEATURED = 6

interface Props {
  listings: CatalogListing[]
  userId: string
  orgId: string | null
  role: UserRole
}

export function CatalogoClient({ listings: initial }: Props) {
  const [items, setItems] = useState(initial)
  const [, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [filterDev, setFilterDev] = useState("")
  const [filterOrg, setFilterOrg] = useState("")

  const featuredCount = items.filter((i) => i.is_featured).length

  // Derived filter options
  const devOptions = Array.from(
    new Map(
      items
        .filter((i) => i.property.development)
        .map((i) => [i.property.development!.id, i.property.development!] as [string, NonNullable<typeof i.property.development>])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))

  const orgOptions = Array.from(
    new Map(
      items
        .filter((i) => i.property.organization)
        .map((i) => [i.property.organization!.id, i.property.organization!] as [string, NonNullable<typeof i.property.organization>])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))

  const activeFilters = (search ? 1 : 0) + (filterDev ? 1 : 0) + (filterOrg ? 1 : 0)

  async function toggleFeatured(item: CatalogListing) {
    if (!item.is_featured && featuredCount >= MAX_FEATURED) {
      setError(`Máximo de ${MAX_FEATURED} destaques atingido. Remova um para adicionar outro.`)
      setTimeout(() => setError(null), 4000)
      return
    }
    const supabase = createClient()
    startTransition(async () => {
      const { error: err } = await supabase
        .from("property_listings")
        .update({ is_featured: !item.is_featured })
        .eq("id", item.id)
      if (!err) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, is_featured: !i.is_featured } : i))
        )
        setError(null)
      }
    })
  }

  async function removeFromCatalog(item: CatalogListing) {
    const supabase = createClient()
    startTransition(async () => {
      const { error: err } = await supabase
        .from("property_listings")
        .delete()
        .eq("id", item.id)
      if (!err) {
        setItems((prev) => prev.filter((i) => i.id !== item.id))
      }
    })
  }

  const filtered = items.filter((i) => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      i.property.title.toLowerCase().includes(q) ||
      (i.property.neighborhood ?? "").toLowerCase().includes(q) ||
      (i.property.city ?? "").toLowerCase().includes(q)
    const matchDev = !filterDev || i.property.development_id === filterDev
    const matchOrg = !filterOrg || i.property.org_id === filterOrg
    return matchSearch && matchDev && matchOrg
  })

  const sorted = [...filtered].sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground/50 font-sans text-sm">
          Seu catálogo está vazio. Adicione imóveis na{" "}
          <Link href="/dashboard/vitrine" className="text-gold hover:underline">
            Base de Imóveis
          </Link>
          .
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Search + filter bar */}
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome, bairro..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border text-foreground placeholder-muted-foreground/40 pl-9 pr-4 py-2.5 rounded-xl font-sans text-sm focus:outline-none focus:border-gold/40 transition-colors"
          />
        </div>
        {devOptions.length > 0 && (
          <select value={filterDev} onChange={(e) => setFilterDev(e.target.value)}
            className="bg-card border border-border text-foreground/60 px-3 py-2.5 rounded-xl font-sans text-sm focus:outline-none focus:border-gold/40 transition-colors">
            <option value="">Todos os empreendimentos</option>
            {devOptions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        )}
        {orgOptions.length > 0 && (
          <select value={filterOrg} onChange={(e) => { setFilterOrg(e.target.value); setFilterDev("") }}
            className="bg-card border border-border text-foreground/60 px-3 py-2.5 rounded-xl font-sans text-sm focus:outline-none focus:border-gold/40 transition-colors">
            <option value="">Todas as construtoras</option>
            {orgOptions.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        )}
        {activeFilters > 0 && (
          <button onClick={() => { setSearch(""); setFilterDev(""); setFilterOrg("") }}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground/60 text-xs font-sans transition-colors">
            <X size={12} /> Limpar
          </button>
        )}
      </div>

      {/* Header bar */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="text-xs font-sans text-muted-foreground">
            <span className="text-foreground font-medium">{filtered.length}</span>
            {filtered.length !== items.length && <span className="text-muted-foreground/50"> de {items.length}</span>}{" "}
            imóvel{items.length !== 1 ? "is" : ""}
          </span>
          <span className="text-border">·</span>
          <span
            className={`text-xs font-sans flex items-center gap-1 ${
              featuredCount >= MAX_FEATURED ? "text-amber-400" : "text-muted-foreground"
            }`}
          >
            <Star size={10} className={featuredCount >= MAX_FEATURED ? "fill-amber-400" : ""} />
            <span
              className={`font-medium ${
                featuredCount >= MAX_FEATURED ? "text-amber-400" : "text-foreground"
              }`}
            >
              {featuredCount}
            </span>
            /{MAX_FEATURED} destacados
          </span>
        </div>
        <Link
          href="/dashboard/vitrine"
          className="text-xs font-sans text-muted-foreground hover:text-gold transition-colors"
        >
          Adicionar mais →
        </Link>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-amber-900/20 border border-amber-700/40 text-amber-400 text-sm font-sans rounded-xl">
          {error}
        </div>
      )}

      {sorted.length === 0 && items.length > 0 && (
        <div className="py-16 text-center text-muted-foreground/50 font-sans text-sm">
          Nenhum imóvel encontrado com os filtros aplicados.
        </div>
      )}

      {/* Mobile: list */}
      <div className="sm:hidden space-y-3">
        {sorted.map((item) => (
          <div
            key={item.id}
            className={`flex gap-3 p-3 bg-card border rounded-xl transition-colors ${
              item.is_featured ? "border-gold/30" : "border-border"
            }`}
          >
            <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
              {item.property.images?.[0] ? (
                <Image
                  src={item.property.images[0]}
                  alt={item.property.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Home size={16} className="text-muted-foreground/30" />
                </div>
              )}
              {item.is_featured && (
                <div className="absolute top-1 left-1 w-4 h-4 bg-gold rounded-full flex items-center justify-center">
                  <Star size={8} className="fill-graphite text-graphite" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-serif text-foreground text-sm font-semibold leading-snug line-clamp-1">
                {item.property.title}
              </p>
              {(item.property.neighborhood || item.property.city) && (
                <p className="text-muted-foreground text-[11px] font-sans mt-0.5 flex items-center gap-1">
                  <MapPin size={9} />
                  {item.property.neighborhood ?? item.property.city}
                </p>
              )}
              <p className="font-serif text-gold text-sm font-semibold mt-1">
                {formatPrice(item.property.price)}
              </p>
            </div>
            <div className="flex flex-col gap-2 items-end justify-start pt-0.5">
              <button
                onClick={() => toggleFeatured(item)}
                title={item.is_featured ? "Remover destaque" : `Destacar (${featuredCount}/${MAX_FEATURED})`}
                className={`p-1.5 rounded-lg transition-colors border ${
                  item.is_featured
                    ? "text-gold bg-gold/15 border-gold/30"
                    : "text-muted-foreground/40 hover:text-gold hover:bg-gold/10 border-transparent"
                }`}
              >
                <Star size={13} className={item.is_featured ? "fill-gold" : ""} />
              </button>
              <Link
                href={`/imovel/${item.property.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-gold hover:bg-gold/10 border border-transparent transition-colors"
              >
                <ExternalLink size={13} />
              </Link>
              <button
                onClick={() => removeFromCatalog(item)}
                title="Remover do catálogo"
                className="p-1.5 rounded-lg text-muted-foreground/30 hover:text-red-400 hover:bg-red-900/10 border border-transparent transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: grid */}
      <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sorted.map((item) => (
          <div
            key={item.id}
            className={`group bg-card border rounded-xl overflow-hidden transition-all ${
              item.is_featured ? "border-gold/30" : "border-border hover:border-gold/20"
            }`}
          >
            <div className="aspect-video bg-muted relative overflow-hidden">
              {item.property.images?.[0] ? (
                <Image
                  src={item.property.images[0]}
                  alt={item.property.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Home size={20} className="text-muted-foreground/20" />
                </div>
              )}
              {item.is_featured && (
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-gold/90 rounded-full">
                  <Star size={8} className="fill-graphite text-graphite" />
                  <span className="text-[9px] font-sans text-graphite font-bold uppercase tracking-wider">
                    Destaque
                  </span>
                </div>
              )}
            </div>

            <div className="p-4">
              <p className="font-serif text-foreground text-sm font-semibold leading-tight line-clamp-1 mb-1">
                {item.property.title}
              </p>
              {(item.property.neighborhood || item.property.city) && (
                <p className="text-muted-foreground text-xs font-sans flex items-center gap-1 mb-2">
                  <MapPin size={9} />
                  {item.property.neighborhood ?? item.property.city}
                </p>
              )}
              <div className="flex items-center gap-3 text-muted-foreground text-[11px] font-sans mb-3">
                {item.property.features?.area_m2 && (
                  <span className="flex items-center gap-1">
                    <Maximize2 size={9} className="text-gold/50" />
                    {item.property.features.area_m2}m²
                  </span>
                )}
                {(item.property.features?.suites || item.property.features?.dormitorios) && (
                  <span className="flex items-center gap-1">
                    <BedDouble size={9} className="text-gold/50" />
                    {item.property.features.suites ?? item.property.features.dormitorios}
                  </span>
                )}
                {item.property.features?.vagas && (
                  <span className="flex items-center gap-1">
                    <Car size={9} className="text-gold/50" />
                    {item.property.features.vagas}v
                  </span>
                )}
              </div>
              <p className="font-serif text-gold text-sm font-semibold mb-3">
                {formatPrice(item.property.price)}
              </p>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => toggleFeatured(item)}
                  title={item.is_featured ? "Remover destaque" : "Destacar no minisite"}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-sans transition-colors border ${
                    item.is_featured
                      ? "bg-gold/15 text-gold border-gold/30"
                      : "bg-muted/50 text-muted-foreground hover:text-gold hover:bg-gold/10 border-border"
                  }`}
                >
                  <Star size={11} className={item.is_featured ? "fill-gold" : ""} />
                  {item.is_featured ? "Destacado" : "Destacar"}
                </button>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/imovel/${item.property.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-gold hover:bg-gold/10 transition-colors"
                    title="Ver imóvel"
                  >
                    <ExternalLink size={13} />
                  </Link>
                  <button
                    onClick={() => removeFromCatalog(item)}
                    className="p-1.5 rounded-lg text-muted-foreground/30 hover:text-red-400 hover:bg-red-900/10 transition-colors"
                    title="Remover do catálogo"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
