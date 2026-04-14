"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, UserCheck, UserX, Phone, Star, Save, Mail, User } from "lucide-react"
import type { UserRole } from "@/types/database"

interface UserRow {
  id: string
  full_name: string | null
  email?: string
  role: UserRole
  whatsapp: string | null
  creci: string | null
  bio: string | null
  is_active: boolean
  organization_id: string | null
  organization?: { name: string } | null
}

interface OrgOption {
  id: string
  name: string
  type: string
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  imobiliaria: "Imobiliária",
  corretor: "Corretor",
  construtora: "Construtora",
}

const ROLE_COLORS: Record<UserRole, string> = {
  admin: "text-red-400 bg-red-900/20 border-red-800/40",
  imobiliaria: "text-blue-400 bg-blue-900/20 border-blue-800/40",
  corretor: "text-green-400 bg-green-900/20 border-green-800/40",
  construtora: "text-amber-400 bg-amber-900/20 border-amber-800/40",
}

const inputClass = "w-full bg-[#0a0a0a] border border-white/10 text-white placeholder-white/20 px-3 py-2 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/50 transition-colors"
const labelClass = "text-xs uppercase tracking-[0.15em] text-white/30 font-sans block mb-2"

export function AdminUsersClient({ users, orgs }: { users: UserRow[]; orgs: OrgOption[] }) {
  const [rows, setRows] = useState(users)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")

  // Per-user edit state
  const [drafts, setDrafts] = useState<Record<string, Partial<UserRow>>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saved, setSaved] = useState<Record<string, boolean>>({})

  const filtered = rows.filter((u) => {
    const matchSearch = !search ||
      (u.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (u.creci ?? "").toLowerCase().includes(search.toLowerCase())
    const matchRole = filterRole === "all" || u.role === filterRole
    return matchSearch && matchRole
  })

  function getDraft(u: UserRow): UserRow {
    return { ...u, ...drafts[u.id] }
  }

  function setField(id: string, field: string, value: unknown) {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
  }

  async function saveUser(u: UserRow) {
    const draft = drafts[u.id] ?? {}
    if (Object.keys(draft).length === 0) return
    setSaving(u.id)
    setErrors((e) => ({ ...e, [u.id]: "" }))

    const res = await fetch(`/api/admin/profiles/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    })

    if (res.ok) {
      const merged = { ...u, ...draft }
      // Update organization name display
      if (draft.organization_id !== undefined) {
        const org = orgs.find((o) => o.id === draft.organization_id)
        merged.organization = org ? { name: org.name } : null
      }
      setRows((prev) => prev.map((r) => r.id === u.id ? merged : r))
      setDrafts((prev) => { const next = { ...prev }; delete next[u.id]; return next })
      setSaved((s) => ({ ...s, [u.id]: true }))
      setTimeout(() => setSaved((s) => ({ ...s, [u.id]: false })), 2000)
    } else {
      const data = await res.json()
      setErrors((e) => ({ ...e, [u.id]: data.error ?? "Erro ao salvar." }))
    }
    setSaving(null)
  }

  async function toggleActive(u: UserRow) {
    const next = !u.is_active
    setSaving(u.id)
    const res = await fetch(`/api/admin/profiles/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_active: next }),
    })
    if (res.ok) {
      setRows((prev) => prev.map((r) => r.id === u.id ? { ...r, is_active: next } : r))
    }
    setSaving(null)
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input type="text" placeholder="Buscar por nome, email ou CRECI..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-[#111] border border-white/10 text-white placeholder-white/20 px-4 py-2.5 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/50 transition-colors" />
        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}
          className="bg-[#111] border border-white/10 text-white/60 px-4 py-2.5 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/50 transition-colors">
          <option value="all">Todos os papéis</option>
          {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </select>
      </div>

      <div className="divide-y divide-white/5">
        {filtered.map((u) => {
          const isExpanded = expanded === u.id
          const draft = getDraft(u)
          const isDirty = Object.keys(drafts[u.id] ?? {}).length > 0
          const isSaving = saving === u.id

          return (
            <div key={u.id} className={`transition-colors ${!u.is_active ? "opacity-50" : ""}`}>
              {/* Row header */}
              <div className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer"
                onClick={() => setExpanded(isExpanded ? null : u.id)}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-white/40 text-xs font-serif">
                      {(u.full_name ?? u.email ?? "U")[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white/90 text-sm font-sans">{u.full_name ?? "—"}</p>
                    <p className="text-white/30 text-xs font-sans flex items-center gap-2">
                      <span><Mail size={9} className="inline mr-0.5" />{u.email ?? "—"}</span>
                      {u.creci && <span><Star size={9} className="inline mr-0.5" />{u.creci}</span>}
                      {u.whatsapp && <span><Phone size={9} className="inline mr-0.5" />{u.whatsapp}</span>}
                    </p>
                    <p className="text-white/20 text-xs font-sans mt-0.5">
                      {u.organization?.name ?? "Sem organização"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-sans ${ROLE_COLORS[u.role]}`}>
                    {ROLE_LABELS[u.role]}
                  </span>
                  {!u.is_active && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-red-800/40 text-red-400 bg-red-900/20 uppercase font-sans">Inativo</span>
                  )}
                  {isExpanded ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
                </div>
              </div>

              {/* Expanded edit panel */}
              {isExpanded && (
                <div className="px-6 pb-6 bg-white/[0.01] border-t border-white/5 pt-5 space-y-5">
                  {/* Identification */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}><User size={10} className="inline mr-1" />Nome Completo</label>
                      <input type="text" value={draft.full_name ?? ""} placeholder="Nome do usuário"
                        onChange={(e) => setField(u.id, "full_name", e.target.value || null)}
                        className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}><Phone size={10} className="inline mr-1" />WhatsApp</label>
                      <input type="text" value={draft.whatsapp ?? ""} placeholder="5511999999999"
                        onChange={(e) => setField(u.id, "whatsapp", e.target.value || null)}
                        className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}><Star size={10} className="inline mr-1" />CRECI</label>
                      <input type="text" value={draft.creci ?? ""} placeholder="Ex: 12345-F"
                        onChange={(e) => setField(u.id, "creci", e.target.value || null)}
                        className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>Bio / Apresentação</label>
                      <input type="text" value={draft.bio ?? ""} placeholder="Frase de apresentação..."
                        onChange={(e) => setField(u.id, "bio", e.target.value || null)}
                        className={inputClass} />
                    </div>
                  </div>

                  {/* Role + Org */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>Papel</label>
                      <select value={draft.role}
                        onChange={(e) => setField(u.id, "role", e.target.value as UserRole)}
                        className={inputClass}>
                        {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Organização</label>
                      <select value={draft.organization_id ?? ""}
                        onChange={(e) => setField(u.id, "organization_id", e.target.value || null)}
                        className={inputClass}>
                        <option value="">— Sem organização —</option>
                        {orgs.map((org) => (
                          <option key={org.id} value={org.id}>{org.name} ({org.type})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Status + Save */}
                  <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
                    <button type="button" disabled={isSaving}
                      onClick={() => toggleActive(u)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-sans transition-colors ${
                        u.is_active
                          ? "border-emerald-700/40 text-emerald-400 bg-emerald-900/10 hover:bg-red-900/10 hover:text-red-400 hover:border-red-700/40"
                          : "border-red-700/40 text-red-400 bg-red-900/10 hover:bg-emerald-900/10 hover:text-emerald-400 hover:border-emerald-700/40"
                      }`}>
                      {u.is_active
                        ? <><UserCheck size={14} /> Ativo — clique para desativar</>
                        : <><UserX size={14} /> Inativo — clique para ativar</>}
                    </button>

                    <div className="flex items-center gap-3">
                      {errors[u.id] && (
                        <p className="text-red-400 text-xs font-sans">{errors[u.id]}</p>
                      )}
                      {saved[u.id] && (
                        <p className="text-emerald-400 text-xs font-sans">✓ Salvo</p>
                      )}
                      <button type="button"
                        onClick={() => saveUser(u)}
                        disabled={isSaving || !isDirty}
                        className="flex items-center gap-2 px-5 py-2 bg-gold text-graphite hover:bg-gold-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs uppercase tracking-[0.15em] font-sans rounded-lg font-medium">
                        {isSaving
                          ? <span className="w-3.5 h-3.5 border-2 border-graphite/30 border-t-graphite rounded-full animate-spin" />
                          : <Save size={12} />}
                        Salvar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="px-6 py-10 text-center text-white/20 font-sans text-sm">
            Nenhum usuário encontrado.
          </div>
        )}
      </div>
    </div>
  )
}
