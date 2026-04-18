"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { PlusCircle, Edit, Maximize2, BedDouble, Car, Hash, Search, ListPlus, Trash2, ExternalLink } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getTagInfo } from "@/lib/tag-icons"
import { PropertyPickerModal } from "@/components/dashboard/PropertyPickerModal"
import type { Property, UserRole } from "@/types/database"

const STATUS_STYLE = {
  disponivel: "bg-emerald-900/30 text-emerald-300 border-emerald-700/40",
  reserva: "bg-amber-900/30 text-amber-300 border-amber-700/40",
  vendido: "bg-zinc-800 text-zinc-500 border-zinc-700/40",
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
  const [showPicker, setShowPicker] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

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
            <div key={p.id} className="bg-card border border-border rounded-2xl overflow-hidden group hover:border-gold/20 transition-all duration-300 flex flex-col">
              <Link href={`/imovel/${p.slug}`} target="_blank" className="block">
                <div className="aspect-video bg-gradient-to-br from-[#1a1a1a] to-[#222] relative overflow-hidden">
                  {p.images[0] ? (
                    <Image src={p.images[0]} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/10">
                      <span className="font-serif text-4xl">R</span>
                    </div>
                  )}
                  <span className={`absolute top-3 left-3 text-[10px] px-2 py-1 rounded-full border uppercase tracking-wider font-sans ${statusStyle}`}>
                    {statusLabel}
                  </span>
                  {isListed && !isOwn && (
                    <span className="absolute top-3 right-3 text-[9px] px-2 py-1 rounded-full bg-gold/20 border border-gold/40 text-gold uppercase font-sans tracking-wider">
                      No catálogo
                    </span>
                  )}
                </div>

                <div className="px-5 pt-5 pb-3">
                  {p.code && (
                    <div className="flex items-center gap-1 text-muted-foreground/50 text-[10px] font-sans mb-1">
                      <Hash size={9} /><span>{p.code}</span>
                    </div>
                  )}
                  <h3 className="font-serif text-lg font-semibold text-white mb-1 truncate group-hover:text-gold transition-colors">{p.title}</h3>
                  {p.neighborhood && (
                    <p className="text-muted-foreground text-xs font-sans mb-3">{p.neighborhood}, {p.city}</p>
                  )}

                  <div className="flex items-center gap-3 text-muted-foreground text-xs font-sans mb-3">
                    {p.features.area_m2 && (
                      <span className="flex items-center gap-1"><Maximize2 size={11} />{p.features.area_m2}m²</span>
                    )}
                    {(p.features.suites || p.features.dormitorios) && (
                      <span className="flex items-center gap-1">
                        <BedDouble size={11} />
                        {p.features.suites ? `${p.features.suites} suítes` : `${p.features.dormitorios} dorms`}
                      </span>
                    )}
                    {p.features.vagas && (
                      <span className="flex items-center gap-1"><Car size={11} />{p.features.vagas} vagas</span>
                    )}
                  </div>

                  <div className="flex gap-1">
                    {p.tags.slice(0, 4).map((tag) => {
                      const info = getTagInfo(tag)
                      const Icon = info.icon
                      return (
                        <span key={tag} title={info.label} className="flex items-center justify-center w-6 h-6 rounded-full border border-gold/20 text-gold/50">
                          <Icon size={11} />
                        </span>
                      )
                    })}
                  </div>
                </div>
              </Link>

              <div className="px-5 pb-5 pt-3 border-t border-border/50 flex items-center justify-between mt-auto">
                <p className="font-serif text-xl font-bold text-white">{formatPrice(p.price)}</p>
                <div className="flex gap-2">
                  {(isAdmin || isOwn) && (
                    <Link href={`/dashboard/imoveis/${p.id}/editar`}
                      className="p-2 rounded-lg border border-border text-muted-foreground hover:text-gold hover:border-gold/30 transition-colors">
                      <Edit size={14} />
                    </Link>
                  )}
                  {(isAdmin || isOwn || isListed) && (
                    <button onClick={() => handleDelete(p)} disabled={deleting === p.id}
                      className="p-2 rounded-lg border border-border text-muted-foreground hover:text-red-400 hover:border-red-900/50 transition-colors disabled:opacity-40">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="col-span-3 py-20 text-center">
            <p className="text-muted-foreground/50 font-sans mb-4">Nenhum imóvel encontrado.</p>
            {canAddNew && (
              <Link href="/dashboard/imoveis/novo" className="text-gold text-sm font-sans hover:text-gold-light transition-colors">
                Cadastrar primeiro imóvel →
              </Link>
            )}
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
    </>
  )
}
