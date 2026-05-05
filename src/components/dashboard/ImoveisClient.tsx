"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { PlusCircle, Edit, Maximize2, BedDouble, Car, Hash, Search, ListPlus, Trash2, ExternalLink, Sparkles, MapPin } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getTagInfo } from "@/lib/tag-icons"
import { PropertyPickerModal } from "@/components/dashboard/PropertyPickerModal"
import { UpsellModal } from "@/components/dashboard/UpsellModal"
import type { Property, UserRole } from "@/types/database"

const STATUS_STYLE = {
  disponivel: "bg-green-50 dark:bg-green-950/60 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800",
  reserva:    "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800",
  vendido:    "bg-[var(--surface-sunken)] text-txt-tertiary border border-[var(--border-subtle)]",
}
const STATUS_LABEL = { disponivel: "Disponível", reserva: "Reservado", vendido: "Vendido" }

const inputCls = [
  "bg-[var(--surface-sunken)] border border-[var(--border-default)]",
  "text-foreground placeholder:text-txt-tertiary",
  "px-4 py-2.5 rounded-md font-sans text-sm",
  "focus:outline-none focus:border-[var(--primary-default)] focus:ring-2 focus:ring-[var(--primary-default)]/15",
  "transition-colors duration-150",
].join(" ")

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
  const router = useRouter()
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
      {/* Filtros */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-tertiary" />
          <input
            type="text"
            placeholder="Buscar por título ou bairro..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputCls} pl-9 w-full`}
          />
        </div>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={inputCls}>
          <option value="all">Todos os status</option>
          <option value="disponivel">Disponível</option>
          <option value="reserva">Reservado</option>
          <option value="vendido">Vendido</option>
        </select>

        <select value={filterCategoria} onChange={(e) => setCategoria(e.target.value)} className={inputCls}>
          <option value="all">Todas as categorias</option>
          <option value="Apartamento">Apartamento</option>
          <option value="Casa Bairro">Casa Bairro</option>
          <option value="Casa em Condomínio">Casa em Condomínio</option>
          <option value="Duplex">Duplex</option>
          <option value="Loft">Loft</option>
          <option value="Flat / Apart-hotel">Flat / Apart-hotel</option>
          <option value="Terreno">Terreno</option>
          <option value="Lote em Condomínio Fechado">Lote em Cond. Fechado</option>
          <option value="Lote em Rua">Lote em Rua</option>
          <option value="Sala Comercial">Sala Comercial</option>
          <option value="Loja">Loja</option>
          <option value="Galpão / Depósito">Galpão / Depósito</option>
          <option value="Sítio / Fazenda">Sítio / Fazenda</option>
          <option value="Outro">Outro</option>
        </select>

        {devOptions.length > 0 && (
          <select value={filterDev} onChange={(e) => setFilterDev(e.target.value)} className={inputCls}>
            <option value="all">Todos os empreendimentos</option>
            {devOptions.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        )}

        {orgOptions.length > 0 && (
          <select value={filterOrg} onChange={(e) => setFilterOrg(e.target.value)} className={inputCls}>
            <option value="all">Todas as construtoras</option>
            {orgOptions.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        )}

        {minisiteSlug && (
          <a
            href={`/construtora/${minisiteSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 border border-[var(--border-default)] text-txt-secondary hover:text-[var(--primary-default)] hover:border-[var(--primary-default)] transition-colors text-sm font-sans rounded-md"
          >
            <ExternalLink size={14} /> Meu Minisite
          </a>
        )}

        {canPickFromSystem && (
          <button
            onClick={() => setShowPicker(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-[var(--border-default)] text-txt-secondary hover:text-[var(--primary-default)] hover:border-[var(--primary-default)] hover:bg-[var(--primary-subtle)] transition-colors text-sm font-sans rounded-md"
          >
            <ListPlus size={14} /> Adicionar do Sistema
          </button>
        )}

        {canAddNew && (
          <Link
            href="/dashboard/imoveis/novo"
            className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary-default)] text-white hover:bg-[var(--primary-hover)] transition-colors text-sm font-sans font-medium rounded-md"
          >
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
          const isOwn = p.created_by === userId || (!!orgId && p.org_id === orgId)

          return (
            <div
              key={p.id}
              onClick={() => router.push(`/imovel/${p.slug}`)}
              className="cursor-pointer bg-card border border-[var(--border-subtle)] rounded-lg overflow-hidden group hover:border-[var(--border-default)] hover-lift transition-all duration-150 flex flex-col"
            >
              {/* Imagem */}
              <div className="aspect-video bg-[var(--surface-sunken)] relative overflow-hidden">
                {p.images[0] ? (
                  <Image
                    src={p.images[0]}
                    alt={p.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Maximize2 size={24} strokeWidth={1} className="text-txt-disabled" />
                  </div>
                )}
                <span className={`absolute top-3 left-3 text-xs px-2 py-0.5 rounded font-sans font-medium ${statusStyle}`}>
                  {statusLabel}
                </span>
                {isListed && !isOwn && (
                  <span className="absolute top-3 right-3 badge-premium">
                    No catálogo
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="px-4 pt-4 pb-3">
                {p.code && (
                  <div className="flex items-center gap-1 text-txt-disabled text-xs font-sans mb-1">
                    <Hash size={10} /><span>{p.code}</span>
                  </div>
                )}
                <h3 className="font-serif text-base font-semibold text-foreground mb-1 line-clamp-2 leading-snug group-hover:text-[var(--primary-default)] transition-colors">
                  {p.title}
                </h3>
                {p.neighborhood && (
                  <p className="text-txt-secondary text-xs font-sans mb-3 flex items-center gap-1">
                    <MapPin size={10} strokeWidth={1.75} className="shrink-0" />
                    {p.neighborhood}, {p.city}
                  </p>
                )}

                <div className="flex items-center gap-3 text-txt-tertiary text-xs font-sans mb-3">
                  {p.features.area_m2 && (
                    <span className="flex items-center gap-1"><Maximize2 size={12} strokeWidth={1.75} />{p.features.area_m2}m²</span>
                  )}
                  {(p.features.suites || p.features.dormitorios) && (
                    <span className="flex items-center gap-1">
                      <BedDouble size={12} strokeWidth={1.75} />
                      {p.features.suites ? `${p.features.suites} suítes` : `${p.features.dormitorios} dorms`}
                    </span>
                  )}
                  {p.features.vagas && (
                    <span className="flex items-center gap-1"><Car size={12} strokeWidth={1.75} />{p.features.vagas} vagas</span>
                  )}
                </div>

                {p.tags.length > 0 && (
                  <div className="flex gap-1">
                    {p.tags.slice(0, 4).map((tag) => {
                      const info = getTagInfo(tag)
                      const TagIcon = info.icon
                      return (
                        <span key={tag} title={info.label} className="flex items-center justify-center w-6 h-6 rounded border border-[var(--border-default)] text-txt-tertiary">
                          <TagIcon size={11} />
                        </span>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="px-4 pb-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between mt-auto"
              >
                <p className="font-serif text-xl font-bold text-foreground">{formatPrice(p.price)}</p>
                <div className="flex gap-1.5">
                  {p.status === "disponivel" && (isAdmin || isOwn || (orgId && p.org_id === orgId)) && (
                    <button
                      onClick={() => setUpsellProp(p)}
                      title="Destacar ou impulsionar este imóvel"
                      className="p-2 rounded-md border border-[var(--border-default)] text-txt-tertiary hover:text-[var(--gold)] hover:border-[var(--gold)]/40 hover:bg-[var(--gold)]/5 transition-colors"
                    >
                      <Sparkles size={14} />
                    </button>
                  )}
                  {(isAdmin || isOwn) && (
                    <Link
                      href={`/dashboard/imoveis/${p.id}/editar`}
                      className="p-2 rounded-md border border-[var(--border-default)] text-txt-tertiary hover:text-[var(--primary-default)] hover:border-[var(--primary-default)]/40 transition-colors"
                    >
                      <Edit size={14} />
                    </Link>
                  )}
                  {(isAdmin || isOwn || isListed) && (
                    <button
                      onClick={() => handleDelete(p)}
                      disabled={deleting === p.id}
                      className="p-2 rounded-md border border-[var(--border-default)] text-txt-tertiary hover:text-red-600 dark:hover:text-red-400 hover:border-red-500/40 transition-colors disabled:opacity-40"
                    >
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
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-[var(--surface-sunken)] border border-[var(--border-subtle)]">
                <Maximize2 size={22} strokeWidth={1.25} className="text-txt-disabled" />
              </div>
              <p className="font-serif text-base font-semibold text-foreground">Nenhum imóvel encontrado</p>
              {canAddNew && (
                <Link href="/dashboard/imoveis/novo" className="mt-4 text-[var(--primary-default)] text-sm font-sans hover:underline transition-colors">
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
