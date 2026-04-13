"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Plus, X, Save, ChevronDown, ChevronUp, Building } from "lucide-react"

interface Bairro { id: string; name: string; city: string }

interface Logradouro {
  id: string
  type: string
  name: string
  bairro_id: string | null
  city: string
  cep: string | null
  created_at: string
}

const TIPOS = ["Rua", "Avenida", "Alameda", "Travessa", "Estrada", "Rodovia", "Praça", "Largo", "Via", "Outro"]

export function LogradourosManager({
  logradouros: initial,
  bairros,
}: {
  logradouros: Logradouro[]
  bairros: Bairro[]
}) {
  const [rows, setRows] = useState(initial)
  const [showNew, setShowNew] = useState(false)
  const [newForm, setNewForm] = useState({ type: "Rua", name: "", bairro_id: "", city: "", cep: "" })
  const [expanded, setExpanded] = useState<string | null>(null)
  const [editForms, setEditForms] = useState<Record<string, Partial<Logradouro>>>({})
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")

  const inputClass = "w-full bg-[#111] border border-white/10 text-white placeholder-white/20 px-3 py-2.5 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/50 transition-colors"
  const labelClass = "text-xs uppercase tracking-[0.12em] text-white/30 font-sans block mb-1.5"

  const bairroMap = Object.fromEntries(bairros.map((b) => [b.id, b.name]))

  const filtered = rows.filter((l) =>
    !search ||
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.city.toLowerCase().includes(search.toLowerCase()) ||
    (l.bairro_id && bairroMap[l.bairro_id]?.toLowerCase().includes(search.toLowerCase()))
  )

  async function create() {
    if (!newForm.name.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from("logradouros")
      .insert({
        type: newForm.type,
        name: newForm.name.trim(),
        bairro_id: newForm.bairro_id || null,
        city: newForm.city.trim(),
        cep: newForm.cep.trim() || null,
      })
      .select("*").single()
    if (!error && data) {
      setRows((p) => [data as Logradouro, ...p])
      setNewForm({ type: "Rua", name: "", bairro_id: "", city: "", cep: "" })
      setShowNew(false)
    }
    setSaving(false)
  }

  async function update(id: string) {
    setSaving(true)
    const supabase = createClient()
    const patch = editForms[id] ?? {}
    const { error } = await supabase.from("logradouros").update(patch).eq("id", id)
    if (!error) {
      setRows((p) => p.map((l) => l.id === id ? { ...l, ...patch } : l))
      setExpanded(null)
    }
    setSaving(false)
  }

  async function remove(id: string) {
    if (!confirm("Excluir este logradouro?")) return
    const supabase = createClient()
    await supabase.from("logradouros").delete().eq("id", id)
    setRows((p) => p.filter((l) => l.id !== id))
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex gap-3">
        <input type="text" placeholder="Buscar logradouro, bairro ou cidade..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-[#111] border border-white/10 text-white placeholder-white/20 px-3 py-2 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/50 transition-colors" />
        <button onClick={() => setShowNew(!showNew)}
          className="flex items-center gap-2 px-4 py-2 border border-gold/30 text-gold hover:bg-gold/10 transition-colors text-xs uppercase tracking-[0.15em] font-sans rounded-lg flex-shrink-0">
          <Plus size={13} /> Novo Logradouro
        </button>
      </div>

      {/* New form */}
      {showNew && (
        <div className="bg-[#111] border border-gold/20 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-gold text-sm font-sans font-medium">Novo Logradouro</p>
            <button type="button" onClick={() => setShowNew(false)}><X size={13} className="text-white/30" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className={labelClass}>Tipo</label>
              <select value={newForm.type} onChange={(e) => setNewForm({ ...newForm, type: e.target.value })} className={inputClass}>
                {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Nome *</label>
              <input type="text" value={newForm.name} onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                placeholder="Ex: Delfim Moreira" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Bairro</label>
              <select value={newForm.bairro_id} onChange={(e) => setNewForm({ ...newForm, bairro_id: e.target.value })} className={inputClass}>
                <option value="">— Sem bairro —</option>
                {bairros.map((b) => <option key={b.id} value={b.id}>{b.name}{b.city ? ` — ${b.city}` : ""}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Cidade</label>
              <input type="text" value={newForm.city} onChange={(e) => setNewForm({ ...newForm, city: e.target.value })}
                placeholder="Rio de Janeiro" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>CEP</label>
              <input type="text" value={newForm.cep} onChange={(e) => setNewForm({ ...newForm, cep: e.target.value })}
                placeholder="22071-060" maxLength={9} className={inputClass} />
            </div>
          </div>
          <button type="button" onClick={create} disabled={saving || !newForm.name.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-gold text-graphite hover:bg-gold-light disabled:opacity-50 transition-colors text-xs uppercase tracking-[0.15em] font-sans rounded-lg">
            <Save size={12} /> {saving ? "Salvando..." : "Criar"}
          </button>
        </div>
      )}

      {/* List */}
      {filtered.length === 0 && (
        <p className="text-white/20 text-sm font-sans py-6 text-center">
          {rows.length === 0 ? "Nenhum logradouro cadastrado ainda." : "Nenhum resultado para a busca."}
        </p>
      )}

      <div className="divide-y divide-white/[0.04] border border-white/5 rounded-xl overflow-hidden">
        {filtered.map((l) => {
          const isExp = expanded === l.id
          const form = editForms[l.id] ?? l
          return (
            <div key={l.id}>
              <div className="px-4 py-3 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => {
                    if (!isExp) setEditForms((p) => ({ ...p, [l.id]: { ...l } }))
                    setExpanded(isExp ? null : l.id)
                  }}>
                  <Building size={13} className="text-gold/40 flex-shrink-0" />
                  <div>
                    <p className="text-white/80 text-sm font-sans">
                      <span className="text-white/30">{l.type} </span>{l.name}
                    </p>
                    <p className="text-white/25 text-xs font-sans">
                      {l.bairro_id && bairroMap[l.bairro_id] ? `${bairroMap[l.bairro_id]}` : ""}
                      {l.city ? (l.bairro_id && bairroMap[l.bairro_id] ? `, ${l.city}` : l.city) : ""}
                      {l.cep ? ` · ${l.cep}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => remove(l.id)} className="text-white/15 hover:text-red-400 transition-colors p-1">
                    <X size={13} />
                  </button>
                  {isExp
                    ? <ChevronUp size={13} className="text-white/20 cursor-pointer" onClick={() => setExpanded(null)} />
                    : <ChevronDown size={13} className="text-white/20 cursor-pointer" onClick={() => { setEditForms((p) => ({ ...p, [l.id]: { ...l } })); setExpanded(l.id) }} />}
                </div>
              </div>

              {isExp && (
                <div className="px-4 pb-4 pt-2 bg-white/[0.01] border-t border-white/5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className={labelClass}>Tipo</label>
                      <select value={form.type ?? "Rua"}
                        onChange={(e) => setEditForms((p) => ({ ...p, [l.id]: { ...p[l.id], type: e.target.value } }))}
                        className={inputClass}>
                        {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className={labelClass}>Nome</label>
                      <input type="text" value={form.name ?? ""}
                        onChange={(e) => setEditForms((p) => ({ ...p, [l.id]: { ...p[l.id], name: e.target.value } }))}
                        className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Bairro</label>
                      <select value={form.bairro_id ?? ""}
                        onChange={(e) => setEditForms((p) => ({ ...p, [l.id]: { ...p[l.id], bairro_id: e.target.value || null } }))}
                        className={inputClass}>
                        <option value="">— Sem bairro —</option>
                        {bairros.map((b) => <option key={b.id} value={b.id}>{b.name}{b.city ? ` — ${b.city}` : ""}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Cidade</label>
                      <input type="text" value={form.city ?? ""}
                        onChange={(e) => setEditForms((p) => ({ ...p, [l.id]: { ...p[l.id], city: e.target.value } }))}
                        className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>CEP</label>
                      <input type="text" value={form.cep ?? ""} maxLength={9}
                        onChange={(e) => setEditForms((p) => ({ ...p, [l.id]: { ...p[l.id], cep: e.target.value } }))}
                        className={inputClass} />
                    </div>
                  </div>
                  <button type="button" onClick={() => update(l.id)} disabled={saving}
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
