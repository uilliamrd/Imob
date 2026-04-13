"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import {
  BookOpen, Plus, Link2, ExternalLink, X, Check, ChevronDown, ChevronUp,
  Trash2, Eye, Building2, Search,
} from "lucide-react"
import type { Selection, SelectionItem, Property } from "@/types/database"

interface DevOption { id: string; name: string }

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatPrice(price: number) {
  if (price >= 1_000_000)
    return "R$ " + (price / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1 }) + " Mi"
  return "R$ " + price.toLocaleString("pt-BR")
}

function publicUrl(id: string) {
  return typeof window !== "undefined"
    ? `${window.location.origin}/selecao/${id}`
    : `/selecao/${id}`
}

// ── Property picker modal ────────────────────────────────────────────────────

function PropertyPicker({
  selectionId, alreadyAdded, onClose, onAdded, allProperties, developments,
}: {
  selectionId: string
  alreadyAdded: string[]
  onClose: () => void
  onAdded: (item: SelectionItem & { property: Property }) => void
  allProperties: Property[]
  developments: DevOption[]
}) {
  const [search, setSearch] = useState("")
  const [devFilter, setDevFilter] = useState("")
  const [adding, setAdding] = useState<string | null>(null)
  const [addedNow, setAddedNow] = useState<Set<string>>(new Set())

  const filtered = allProperties.filter((p) => {
    const q = search.toLowerCase()
    const matchSearch = !q ||
      p.title.toLowerCase().includes(q) ||
      (p.neighborhood ?? "").toLowerCase().includes(q) ||
      (p.city ?? "").toLowerCase().includes(q) ||
      String(p.code ?? "").includes(q)
    const matchDev = !devFilter || p.development_id === devFilter
    return matchSearch && matchDev
  })

  async function handleAdd(property: Property) {
    setAdding(property.id)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("selection_items")
      .insert({
        selection_id: selectionId,
        property_id: property.id,
        sort_order: alreadyAdded.length + addedNow.size,
      })
      .select()
      .single()

    if (!error && data) {
      setAddedNow((prev) => new Set([...prev, property.id]))
      onAdded({ ...(data as SelectionItem), property })
    }
    setAdding(null)
  }

  const isAdded = (id: string) => alreadyAdded.includes(id) || addedNow.has(id)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#161616] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col mx-4">
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/5">
          <h2 className="font-serif text-xl font-semibold text-white">Adicionar Imóvel à Seleção</h2>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors"><X size={18} /></button>
        </div>

        <div className="px-6 py-3 border-b border-white/5 flex gap-3">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Título, bairro, código..."
              className="w-full bg-[#111] border border-white/10 text-white placeholder-white/20 pl-9 pr-4 py-2 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/50 transition-colors" />
          </div>
          {developments.length > 0 && (
            <select value={devFilter} onChange={(e) => setDevFilter(e.target.value)}
              className="bg-[#111] border border-white/10 text-white/60 px-3 py-2 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/50">
              <option value="">Todos os empreendimentos</option>
              {developments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          )}
        </div>

        <p className="px-6 py-2 text-[11px] text-white/20 font-sans">{filtered.length} imóveis</p>

        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {filtered.length === 0 && (
            <div className="py-10 text-center text-white/20 text-sm font-sans">Nenhum imóvel encontrado.</div>
          )}
          {filtered.map((p) => {
            const added = isAdded(p.id)
            const dev = developments.find((d) => d.id === p.development_id)
            return (
              <div key={p.id} className="px-6 py-3 flex items-center gap-4 hover:bg-white/[0.02]">
                {p.images?.[0]
                  ? <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-white/10" />
                  : <div className="w-10 h-10 rounded-lg bg-white/5 flex-shrink-0 border border-white/5" />
                }
                <div className="flex-1 min-w-0">
                  <p className="text-white/90 text-sm font-sans truncate font-medium">{p.title}</p>
                  <p className="text-white/30 text-xs font-sans mt-0.5 flex items-center gap-2">
                    {dev && <span className="flex items-center gap-1"><Building2 size={9} />{dev.name}</span>}
                    {p.neighborhood && <span>{p.neighborhood}{p.city ? `, ${p.city}` : ""}</span>}
                    <span className="text-gold/60">{formatPrice(p.price)}</span>
                  </p>
                </div>
                <button onClick={() => !added && handleAdd(p)} disabled={added || adding === p.id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans transition-colors flex-shrink-0 ${
                    added ? "bg-emerald-900/20 text-emerald-400 border border-emerald-700/40 cursor-default"
                          : "bg-gold text-graphite hover:bg-gold-light disabled:opacity-50"}`}>
                  {added ? <><Check size={11} /> Adicionado</> : adding === p.id ? "..." : <><Plus size={11} /> Adicionar</>}
                </button>
              </div>
            )
          })}
        </div>

        <div className="px-6 py-4 border-t border-white/5 flex justify-end">
          <button onClick={onClose} className="text-white/50 text-sm font-sans hover:text-white/80 transition-colors">Fechar</button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

interface SelectionWithItems extends Selection {
  items: Array<SelectionItem & { property: Property }>
}

interface Props {
  userId: string
  initialSelections: SelectionWithItems[]
  orgId: string | null
  allProperties: Property[]
  developments: DevOption[]
}

export function SelecoesClient({ userId, initialSelections, orgId, allProperties, developments }: Props) {
  const [selections, setSelections] = useState(initialSelections)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [saving, setSaving] = useState(false)
  const [picker, setPicker] = useState<string | null>(null) // selection id
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function createSelection() {
    if (!newTitle.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("selections")
      .insert({
        title: newTitle.trim(),
        corretor_id: userId,
        org_id: orgId,
        is_public: true,
      })
      .select()
      .single()

    if (!error && data) {
      setSelections((prev) => [{ ...(data as Selection), items: [] }, ...prev])
      setExpanded((data as Selection).id)
    }
    setNewTitle("")
    setCreating(false)
    setSaving(false)
  }

  async function deleteSelection(id: string) {
    setDeleting(id)
    const supabase = createClient()
    await supabase.from("selections").delete().eq("id", id)
    setSelections((prev) => prev.filter((s) => s.id !== id))
    setDeleting(null)
  }

  async function removeItem(selectionId: string, itemId: string) {
    const supabase = createClient()
    await supabase.from("selection_items").delete().eq("id", itemId)
    setSelections((prev) =>
      prev.map((s) =>
        s.id === selectionId
          ? { ...s, items: s.items.filter((i) => i.id !== itemId) }
          : s
      )
    )
  }

  function handleItemAdded(selectionId: string, item: SelectionItem & { property: Property }) {
    setSelections((prev) =>
      prev.map((s) =>
        s.id === selectionId ? { ...s, items: [...s.items, item] } : s
      )
    )
  }

  async function copyLink(id: string) {
    await navigator.clipboard.writeText(publicUrl(id))
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const totalViews = selections.reduce((a, s) => a + s.views, 0)

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Seleções ativas",    value: selections.length, icon: BookOpen, color: "text-gold" },
          { label: "Imóveis selecionados", value: selections.reduce((a, s) => a + s.items.length, 0), icon: Building2, color: "text-blue-400" },
          { label: "Visualizações",      value: totalViews,         icon: Eye,      color: "text-emerald-400" },
        ].map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="bg-[#161616] border border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Icon size={14} className={s.color} />
                <p className="text-white/30 text-xs uppercase tracking-wider font-sans">{s.label}</p>
              </div>
              <p className="font-serif text-3xl font-bold text-white">{s.value}</p>
            </div>
          )
        })}
      </div>

      {/* New selection */}
      <AnimatePresence mode="wait">
        {creating ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#161616] border border-gold/30 rounded-2xl p-5 mb-5 flex items-center gap-3"
          >
            <input
              autoFocus
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") createSelection(); if (e.key === "Escape") setCreating(false) }}
              placeholder="Ex: Família Silva — 3 suítes Leblon"
              className="flex-1 bg-transparent text-white placeholder-white/20 font-sans text-sm focus:outline-none"
            />
            <button
              onClick={createSelection}
              disabled={saving || !newTitle.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-gold text-graphite text-xs uppercase tracking-[0.1em] font-sans rounded-lg disabled:opacity-50 hover:bg-gold-light transition-colors"
            >
              {saving ? "Criando..." : <><Check size={12} /> Criar</>}
            </button>
            <button onClick={() => setCreating(false)} className="text-white/30 hover:text-white/60 transition-colors">
              <X size={16} />
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 px-5 py-3 border border-gold/30 text-gold hover:bg-gold/10 transition-colors text-xs uppercase tracking-[0.15em] font-sans rounded-xl mb-5"
          >
            <Plus size={14} /> Nova Seleção
          </motion.button>
        )}
      </AnimatePresence>

      {/* Selections list */}
      <div className="space-y-3">
        {selections.length === 0 && (
          <div className="py-16 text-center text-white/20 font-sans text-sm">
            Nenhuma seleção ainda. Crie sua primeira para compartilhar com um cliente.
          </div>
        )}
        {selections.map((sel) => {
          const isExpanded = expanded === sel.id
          return (
            <div key={sel.id} className="bg-[#161616] border border-white/5 rounded-2xl overflow-hidden hover:border-gold/10 transition-colors">
              {/* Header row */}
              <div className="px-6 py-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={16} className="text-gold/60" />
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : sel.id)}>
                  <p className="text-white/80 font-sans font-medium text-sm">{sel.title}</p>
                  <p className="text-white/25 text-xs font-sans mt-0.5">
                    {sel.items.length} imóvel(is) · {sel.views} visualizações
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyLink(sel.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs font-sans rounded-lg transition-all duration-300 ${
                      copiedId === sel.id
                        ? "border-emerald-700/40 bg-emerald-900/20 text-emerald-400"
                        : "border-white/10 text-white/40 hover:text-white/70 hover:border-white/20"
                    }`}
                  >
                    {copiedId === sel.id ? <><Check size={11} /> Copiado</> : <><Link2 size={11} /> Copiar link</>}
                  </button>
                  <a
                    href={`/selecao/${sel.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-gold/20 text-gold/60 hover:text-gold hover:border-gold/40 text-xs font-sans rounded-lg transition-colors"
                  >
                    <ExternalLink size={11} /> Ver
                  </a>
                  <button
                    onClick={() => deleteSelection(sel.id)}
                    disabled={deleting === sel.id}
                    className="p-1.5 text-white/20 hover:text-red-400 transition-colors disabled:opacity-50"
                    title="Excluir seleção"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    onClick={() => setExpanded(isExpanded ? null : sel.id)}
                    className="text-white/20 hover:text-white/60 transition-colors p-1"
                  >
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>

              {/* Expanded: property items */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-white/5">
                      {sel.items.length === 0 ? (
                        <div className="py-8 text-center text-white/20 text-sm font-sans">
                          Nenhum imóvel adicionado ainda.
                        </div>
                      ) : (
                        <div className="divide-y divide-white/[0.04]">
                          {sel.items.map((item) => (
                            <div key={item.id} className="px-6 py-3 flex items-center gap-4 hover:bg-white/[0.02]">
                              <div className="flex-1 min-w-0">
                                <p className="text-white/70 text-sm font-sans truncate">{item.property.title}</p>
                                <p className="text-white/25 text-xs font-sans mt-0.5">
                                  {item.property.neighborhood && `${item.property.neighborhood}, `}
                                  {item.property.city} · {formatPrice(item.property.price)}
                                </p>
                              </div>
                              <a
                                href={`/imovel/${item.property.slug}?ref=${userId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/20 hover:text-gold transition-colors p-1.5"
                              >
                                <ExternalLink size={12} />
                              </a>
                              <button
                                onClick={() => removeItem(sel.id, item.id)}
                                className="text-white/20 hover:text-red-400 transition-colors p-1.5"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add property button */}
                      <div className="px-6 py-4 border-t border-white/5">
                        <button
                          onClick={() => setPicker(sel.id)}
                          className="flex items-center gap-1.5 text-white/40 hover:text-gold text-xs font-sans uppercase tracking-[0.1em] transition-colors"
                        >
                          <Plus size={12} /> Adicionar imóvel
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Property picker modal */}
      {picker && (
        <PropertyPicker
          selectionId={picker}
          alreadyAdded={selections.find((s) => s.id === picker)?.items.map((i) => i.property_id) ?? []}
          onClose={() => setPicker(null)}
          onAdded={(item) => { handleItemAdded(picker, item); }}
          allProperties={allProperties}
          developments={developments}
        />
      )}
    </div>
  )
}
