"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { PlusCircle, Edit, Maximize2, BedDouble, Car, Hash, Search, ListPlus, Trash2, ExternalLink, Sparkles, MapPin } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getTagInfo } from "@/lib/tag-icons"
import { PropertyPickerModal } from "@/components/dashboard/PropertyPickerModal"
import { UpsellModal } from "@/components/dashboard/UpsellModal"
import type { Property, UserRole } from "@/types/database"

const STATUS_STYLE = {
  disponivel: "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
  reserva:    "bg-amber-500/10 text-amber-600 border-amber-500/30",
  vendido:    "bg-muted text-muted-foreground border-border",
}
const STATUS_LABEL = { disponivel: "Disponível", reserva: "Reservado", vendido: "Vendido" }

function formatPrice(price: number) {
  if (price >= 1_000_000)
    return "R$ " + (price / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1 }) + " Mi"
  return "R$ " + price.toLocaleString("pt-BR")
}

interface ImoveisClientProps {
  properties: Property[]
  role: UserRole
  orgId: string | null
  userId: string
  listedIds: string[]
  minisiteSlug?: string | null
}

export function ImoveisClient({ properties: initial, role, orgId, userId, listedIds: initialListed, minisiteSlug }: ImoveisClientProps) {
  const [properties, setProperties] = useState(initial)
  const [listedIds, setListedIds] = useState(new Set(initialListed))
  const [search, setSearch]             = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterCategoria, setCategoria] = useState("all")
  const [filterDev, setFilterDev]       = useState("all")
  const [filterOrg, setFilterOrg]       = useState("all")
  const [showPicker, setShowPicker]     = useState(false)
  const [deleting, setDeleting]         = useState<string | null>(null)
  const [upsellProperty, setUpsellProp] = useState<Property | null>(null)

  const isAdmin = role === "admin"
  const canAddNew = true
  const canPickFromSystem = role === "imobiliaria" || role === "corretor"

  // Derived filter options
  const devOptions = Array.from(
    new Map(
      properties
        .filter((p) => p.development)
        .map((p) => [p.development!.id, p.development!] as [string, NonNullable<typeof p.development>])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))

  const orgOptions = Array.from(
    new Map(
      properties
        .filter((p) => p.organization)
        .map((p) => [p.organization!.id, p.organization!] as [string, NonNullable<typeof p.organization>])
    ).values()
  ).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))

  const filtered = properties.filter((p) => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.neighborhood ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.city ?? "").toLowerCase().includes(search.toLowerCase())
    const matchStatus    = filterStatus === "all" || p.status === filterStatus
    const matchCategoria = filterCategoria === "all" || (p as unknown as { categoria?: string }).categoria === filterCategoria
    const matchDev = filterDev === "all" || p.development_id === filterDev
    const matchOrg = filterOrg === "all" || p.org_id === filterOrg
    return matchSearch && matchStatus && matchCategoria && matchDev && matchOrg
  })

  async function handleDelete(p: Property) {
    const isOwn = p.created_by === userId || isAdmin
    const isListed = listedIds.has(p.id)

    const msg = isOwn
      ? `Excluir o imóvel "${p.title}" permanentemente?`
      : `Remover "${p.title}" do seu catálogo?`

    if (!confirm(msg)) return

    setDeleting(p.id)

    if (isOwn) {
      await fetch(`/api/admin/properties/${p.id}`, { method: "DELETE" }).catch(() => null)
      // fallback via supabase client se a rota não existir ainda
      if (!isAdmin) {
        const supabase = createClient()
        await supabase.from("properties").delete().eq("id", p.id)
      }
      setProperties((prev) => prev.filter((x) => x.id !== p.id))
    } else if (isListed) {
      const supabase = createClient()
      await supabase.from("property_listings")
        .delete().eq("property_id", p.id).eq("user_id", userId)
      setProperties((prev) => prev.filter((x) => x.id !== p.id))
      setListedIds((prev) => { const n = new Set(prev); n.delete(p.id); return n })
    }
    setDeleting(null)
  }

  return (
    <>
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Buscar por título ou bairro..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-card border border-border text-white placeholder-muted-foreground/40 pl-9 pr-4 py-2.5 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/50 transition-colors" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-card border border-border text-foreground/60 px-4 py-2.5 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/50 transition-colors">
          <option value="all">Todos os status</option>
          <option value="disponivel">Disponível</option>
          <option value="reserva">Reservado</option>
          <option value="vendido">Vendido</option>
        </select>
        <select value={filterCategoria} onChange={(e) => setCategoria(e.target.value)}
          className="bg-card border border-border text-foreground/60 px-4 py-2.5 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/50 transition-colors">
          <option value="all">Todas as categorias</option>
          <option value="Apartamento">Apartamento</option>
          <option value="Casa">Casa</option>
          <option value="Casa em Condomínio">Casa em Condomínio</option>
          <option value="Cobertura">Cobertura</option>
          <option value="Kitnet / Studio">Kitnet / Studio</option>
          <option value="Terreno">Terreno</option>
          <option value="Lote em Condomínio Fechado">Lote em Condomínio Fechado</option>
          <option value="Lote em Rua">Lote em Rua</option>
          <option value="Sala Comercial">Sala Comercial</option>
          <option value="Loja">Loja</option>
          <option value="Galpão / Depósito">Galpão / Depósito</option>
          <option value="Sítio / Fazenda">Sítio / Fazenda</option>
        </select>

        {devOptions.length > 0 && (
          <select value={filterDev} onChange={(e) => setFilterDev(e.target.value)}
            className="bg-card border border-border text-foreground/60 px-4 py-2.5 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/50 transition-colors">
            <option value="all">Todos os empreendimentos</option>
            {devOptions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        )}

        {orgOptions.length > 0 && (
          <select value={filterOrg} onChange={(e) => setFilterOrg(e.target.value)}
            className="bg-card border border-border text-foreground/60 px-4 py-2.5 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/50 transition-colors">
            <option value="all">Todas as construtoras</option>
            {orgOptions.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        )}

        {minisiteSlug && (
          <a href={`/construtora/${minisiteSlug}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 border border-border text-muted-foreground hover:text-gold hover:border-gold/30 transition-colors text-xs uppercase tracking-[0.15em] font-sans rounded-lg">
            <ExternalLink size={14} /> Meu Minisite
          </a>
        )}

        {canPickFromSystem && (
          <button onClick={() => setShowPicker(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-gold/30 text-gold hover:bg-gold/10 transition-colors text-xs uppercase tracking-[0.15em] font-sans rounded-lg">
            <ListPlus size={14} /> Adicionar do Sistema
          </button>
        )}

        {canAddNew && (
          <Link href="/dashboard/imoveis/novo"
            className="flex items-center gap-2 px-5 py-2.5 bg-gold text-graphite hover:bg-gold-light transition-colors text-xs uppercase tracking-[0.15em] font-sans rounded-lg">
            <PlusCircle size={14} /> Novo Imóvel
          </Link>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((p) => {
          const statusStyle = STATUS_STYLE[p.status] ?? STATUS_STYLE.disponivel
          const statusLabel = STATUS_LABEL[p.status] ?? p.status
          const isListed = listedIds.has(p.id)
          const isOwn = p.created_by === userId

          return (
            <div key={p.id} className="bg-card border border-border rounded-2xl overflow-hidden group hover:border-[color-mix(in_srgb,var(--gold)_30%,transparent)] hover-lift transition-all duration-200 flex flex-col elevation-card">
              <Link href={`/imovel/${p.slug}`} target="_blank" className="block">
                {/* Image */}
                <div className="aspect-video bg-surface relative overflow-hidden">
                  {p.images[0] ? (
                    <Image src={p.images[0]} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Maximize2 size={24} strokeWidth={1} className="text-muted-foreground/20" />
                    </div>
                  )}
                  <span className={`absolute top-3 left-3 text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-sans ${statusStyle}`}>
                    {statusLabel}
                  </span>
                  {isListed && !isOwn && (
                    <span className="absolute top-3 right-3 badge-premium text-[9px]">
                      No catálogo
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="px-5 pt-4 pb-3">
                  {p.code && (
                    <div className="flex items-center gap-1 text-muted-foreground/50 text-[10px] font-sans mb-1">
                      <Hash size={9} /><span>{p.code}</span>
                    </div>
                  )}
                  <h3 className="font-serif text-base font-semibold text-foreground mb-1 line-clamp-2 leading-snug group-hover:text-[var(--gold-dark)] transition-colors">
                    {p.title}
                  </h3>
                  {p.neighborhood && (
                    <p className="text-muted-foreground text-xs font-sans mb-3 flex items-center gap-1">
                      <MapPin size={10} strokeWidth={1.75} className="shrink-0" />
                      {p.neighborhood}, {p.city}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-muted-foreground text-xs font-sans mb-3">
                    {p.features.area_m2 && (
                      <span className="flex items-center gap-1"><Maximize2 size={11} strokeWidth={1.75} />{p.features.area_m2}m²</span>
                    )}
                    {(p.features.suites || p.features.dormitorios) && (
                      <span className="flex items-center gap-1">
                        <BedDouble size={11} strokeWidth={1.75} />
                        {p.features.suites ? `${p.features.suites} suítes` : `${p.features.dormitorios} dorms`}
                      </span>
                    )}
                    {p.features.vagas && (
                      <span className="flex items-center gap-1"><Car size={11} strokeWidth={1.75} />{p.features.vagas} vagas</span>
                    )}
                  </div>

                  {p.tags.length > 0 && (
                    <div className="flex gap-1">
                      {p.tags.slice(0, 4).map((tag) => {
                        const info = getTagInfo(tag)
                        const TagIcon = info.icon
                        return (
                          <span key={tag} title={info.label} className="flex items-center justify-center w-6 h-6 rounded-full border border-[color-mix(in_srgb,var(--gold)_25%,transparent)] text-[var(--gold-dark)]/60">
                            <TagIcon size={11} />
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
              </Link>

              {/* Footer */}
              <div className="px-5 pb-4 pt-3 border-t border-border flex items-center justify-between mt-auto">
                <p className="font-serif text-xl font-bold text-foreground">{formatPrice(p.price)}</p>
                <div className="flex gap-1.5">
                  {p.status === "disponivel" && (isAdmin || isOwn || (orgId && p.org_id === orgId)) && (
                    <button
                      onClick={() => setUpsellProp(p)}
                      title="Destacar ou impulsionar este imóvel"
                      className="p-2 rounded-lg border border-[color-mix(in_srgb,var(--gold)_30%,transparent)] text-[var(--gold-dark)]/60 hover:text-[var(--gold)] hover:border-[color-mix(in_srgb,var(--gold)_60%,transparent)] hover:bg-[color-mix(in_srgb,var(--gold)_5%,transparent)] transition-colors"
                    >
                      <Sparkles size={14} />
                    </button>
                  )}
                  {(isAdmin || isOwn) && (
                    <Link href={`/dashboard/imoveis/${p.id}/editar`}
                      className="p-2 rounded-lg border border-border text-muted-foreground hover:text-[var(--forest)] hover:border-[color-mix(in_srgb,var(--forest)_30%,transparent)] transition-colors">
                      <Edit size={14} />
                    </Link>
                  )}
                  {(isAdmin || isOwn || isListed) && (
                    <button onClick={() => handleDelete(p)} disabled={deleting === p.id}
                      className="p-2 rounded-lg border border-border text-muted-foreground hover:text-red-500 hover:border-red-500/30 transition-colors disabled:opacity-40">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="col-span-3">
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface elevation-soft">
                <Maximize2 size={22} strokeWidth={1.25} className="text-muted-foreground/50" />
              </div>
              <p className="font-serif text-base font-semibold text-foreground">Nenhum imóvel encontrado</p>
              {canAddNew && (
                <Link href="/dashboard/imoveis/novo" className="mt-4 text-[var(--forest)] text-sm font-sans hover:underline transition-colors">
                  Cadastrar primeiro imóvel →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      {showPicker && (
        <PropertyPickerModal
          onClose={() => setShowPicker(false)}
          onAdd={(id) => setListedIds((prev) => new Set([...prev, id]))}
          alreadyAdded={[...listedIds]}
          orgId={orgId}
          userId={userId}
        />
      )}

      {upsellProperty && (
        <UpsellModal property={upsellProperty} onClose={() => setUpsellProp(null)} />
      )}
    </>
  )
}
