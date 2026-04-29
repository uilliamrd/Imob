"use client"

import { useState } from "react"
import { Plus, X, Save, ChevronDown, ChevronUp, Navigation } from "lucide-react"

interface Bairro {
  id: string
  name: string
  city: string
  state: string
  created_at: string
}

export function BairrosManager({ bairros: initial }: { bairros: Bairro[] }) {
  const [rows, setRows]         = useState(initial)
  const [showNew, setShowNew]   = useState(false)
  const [newName, setNewName]   = useState("")
  const [newCity, setNewCity]   = useState("")
  const [newState, setNewState] = useState("")
  const [expanded, setExpanded] = useState<string | null>(null)
  const [editForms, setEditForms] = useState<Record<string, Partial<Bairro>>>({})
  const [saving, setSaving]     = useState(false)
  const [search, setSearch]     = useState("")
  const [error, setError]       = useState<string | null>(null)

  const inputClass = "w-full bg-muted/50 border border-border text-white placeholder-muted-foreground/40 px-3 py-2.5 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/50 transition-colors"
  const labelClass = "text-xs uppercase tracking-[0.12em] text-muted-foreground font-sans block mb-1.5"

  const filtered = rows.filter((b) =>
    !search || b.name.toLowerCase().includes(search.toLowerCase()) || b.city.toLowerCase().includes(search.toLowerCase())
  )

  async function create() {
    if (!newName.trim()) return
    setSaving(true); setError(null)
    const res = await fetch("/api/admin/bairros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim(), city: newCity.trim(), state: newState.trim() }),
    })
    const data = await res.json()
    if (res.ok) {
      setRows((p) => [data as Bairro, ...p])
      setNewName(""); setNewCity(""); setNewState("")
      setShowNew(false)
    } else {
      setError(data.error ?? "Erro ao criar bairro.")
    }
    setSaving(false)
  }

  async function update(id: string) {
    setSaving(true); setError(null)
    const patch = editForms[id] ?? {}
    const res = await fetch(`/api/admin/bairros/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
    if (res.ok) {
      setRows((p) => p.map((b) => b.id === id ? { ...b, ...patch } : b))
      setExpanded(null)
    } else {
      const data = await res.json()
      setError(data.error ?? "Erro ao salvar.")
    }
    setSaving(false)
  }

  async function remove(id: string) {
    if (!confirm("Excluir este bairro?")) return
    const res = await fetch(`/api/admin/bairros/${id}`, { method: "DELETE" })
    if (res.ok) {
      setRows((p) => p.filter((b) => b.id !== id))
    } else {
      const data = await res.json()
      setError(data.error ?? "Erro ao excluir.")
    }
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="px-4 py-3 rounded-lg text-sm font-sans bg-red-900/20 text-red-400 border border-red-700/30">
          {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex gap-3">
        <input type="text" placeholder="Buscar bairro ou cidade..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-muted/50 border border-border text-white placeholder-muted-foreground/40 px-3 py-2 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/50 transition-colors" />
        <button onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-2 px-4 py-2 border border-gold/30 text-gold hover:bg-gold/10 transition-colors text-xs uppercase tracking-[0.15em] font-sans rounded-lg flex-shrink-0">
          <Plus size={13} /> Novo Bairro
        </button>
      </div>

      {/* New form */}
      {showNew && (
        <div className="bg-muted/50 border border-gold/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-gold text-sm font-sans font-medium">Novo Bairro</p>
            <button type="button" onClick={() => setShowNew(false)}><X size={13} className="text-muted-foreground" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1">
              <label className={labelClass}>Nome *</label>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Copacabana" className={inputClass}
                onKeyDown={(e) => e.key === "Enter" && create()} />
            </div>
            <div>
              <label className={labelClass}>Cidade</label>
              <input type="text" value={newCity} onChange={(e) => setNewCity(e.target.value)}
                placeholder="Rio de Janeiro" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Estado</label>
              <input type="text" value={newState} onChange={(e) => setNewState(e.target.value)}
                placeholder="RJ" maxLength={2} className={inputClass} />
            </div>
          </div>
          <button type="button" onClick={create} disabled={saving || !newName.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-gold text-graphite hover:bg-gold-light disabled:opacity-50 transition-colors text-xs uppercase tracking-[0.15em] font-sans rounded-lg">
            <Save size={12} /> {saving ? "Salvando..." : "Criar"}
          </button>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 && (
        <p className="text-muted-foreground/50 text-sm font-sans py-6 text-center">
          {rows.length === 0 ? "Nenhum bairro cadastrado ainda." : "Nenhum resultado para a busca."}
        </p>
      )}

      <div className="divide-y divide-white/[0.04] border border-border rounded-xl overflow-hidden">
        {filtered.map((b) => {
          const isExp = expanded === b.id
          const form = editForms[b.id] ?? b
          return (
            <div key={b.id}>
              <div className="px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => {
                    if (!isExp) setEditForms((p) => ({ ...p, [b.id]: { ...b } }))
                    setExpanded(isExp ? null : b.id)
                  }}>
                  <Navigation size={13} className="text-gold/40 flex-shrink-0" />
                  <div>
                    <p className="text-foreground/80 text-sm font-sans">{b.name}</p>
                    {(b.city || b.state) && (
                      <p className="text-muted-foreground text-xs font-sans">{b.city}{b.state ? `, ${b.state}` : ""}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => remove(b.id)} className="text-muted-foreground/40 hover:text-red-400 transition-colors p-1">
                    <X size={13} />
                  </button>
                  {isExp
                    ? <ChevronUp size={13} className="text-muted-foreground/50 cursor-pointer" onClick={() => setExpanded(null)} />
                    : <ChevronDown size={13} className="text-muted-foreground/50 cursor-pointer" onClick={() => { setEditForms((p) => ({ ...p, [b.id]: { ...b } })); setExpanded(b.id) }} />}
                </div>
              </div>

              {isExp && (
                <div className="px-4 pb-4 pt-2 bg-white/[0.01] border-t border-border">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className={labelClass}>Nome</label>
                      <input type="text" value={form.name ?? ""}
                        onChange={(e) => setEditForms((p) => ({ ...p, [b.id]: { ...p[b.id], name: e.target.value } }))}
                        className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Cidade</label>
                      <input type="text" value={form.city ?? ""}
                        onChange={(e) => setEditForms((p) => ({ ...p, [b.id]: { ...p[b.id], city: e.target.value } }))}
                        className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Estado</label>
                      <input type="text" value={form.state ?? ""} maxLength={2}
                        onChange={(e) => setEditForms((p) => ({ ...p, [b.id]: { ...p[b.id], state: e.target.value } }))}
                        className={inputClass} />
                    </div>
                  </div>
                  <button type="button" onClick={() => update(b.id)} disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-gold text-graphite hover:bg-gold-light disabled:opacity-50 transition-colors text-xs uppercase tracking-[0.12em] font-sans rounded-lg">
                    <Save size={11} /> {saving ? "Salvando..." : "Salvar"}
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
