"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ChevronDown, ChevronUp, UserCheck, UserX, Phone, FileText, Star } from "lucide-react"
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

export function AdminUsersClient({ users, orgs }: { users: UserRow[]; orgs: OrgOption[] }) {
  const [rows, setRows] = useState(users)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")
  const [saving, setSaving] = useState<string | null>(null)

  const filtered = rows.filter((u) => {
    const matchSearch = !search ||
      (u.full_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email ?? "").toLowerCase().includes(search.toLowerCase())
    const matchRole = filterRole === "all" || u.role === filterRole
    return matchSearch && matchRole
  })

  async function updateUser(id: string, patch: Partial<UserRow>) {
    setSaving(id)
    const supabase = createClient()
    const { error } = await supabase.from("profiles").update(patch).eq("id", id)
    if (!error) {
      setRows((prev) => prev.map((r) => r.id === id ? { ...r, ...patch } : r))
    }
    setSaving(null)
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-[#111] border border-white/10 text-white placeholder-white/20 px-4 py-2.5 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/50 transition-colors"
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="bg-[#111] border border-white/10 text-white/60 px-4 py-2.5 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/50 transition-colors"
        >
          <option value="all">Todos os papéis</option>
          {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </select>
      </div>

      <div className="divide-y divide-white/5">
        {filtered.map((u) => {
          const isExpanded = expanded === u.id
          const isSaving = saving === u.id

          return (
            <div key={u.id} className={`transition-colors ${!u.is_active ? "opacity-50" : ""}`}>
              {/* Row */}
              <div
                className="px-6 py-4 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer"
                onClick={() => setExpanded(isExpanded ? null : u.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-white/40 text-xs font-serif">
                      {(u.full_name ?? "U")[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white/90 text-sm font-sans">{u.full_name ?? "—"}</p>
                    <p className="text-white/30 text-xs font-sans">
                      {u.email ?? "—"} · {u.organization?.name ?? "Sem organização"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-sans ${ROLE_COLORS[u.role]}`}>
                    {ROLE_LABELS[u.role]}
                  </span>
                  {!u.is_active && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-red-800/40 text-red-400 bg-red-900/20 uppercase font-sans">
                      Inativo
                    </span>
                  )}
                  {isExpanded ? <ChevronUp size={14} className="text-white/30" /> : <ChevronDown size={14} className="text-white/30" />}
                </div>
              </div>

              {/* Expanded panel */}
              {isExpanded && (
                <div className="px-6 pb-5 bg-white/[0.01] border-t border-white/5">
                  <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Role */}
                    <div>
                      <label className="text-xs uppercase tracking-[0.15em] text-white/30 font-sans block mb-2">
                        Papel
                      </label>
                      <select
                        value={u.role}
                        disabled={isSaving}
                        onChange={(e) => updateUser(u.id, { role: e.target.value as UserRole })}
                        className="w-full bg-[#111] border border-white/10 text-white/80 px-3 py-2 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/50"
                      >
                        {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                        ))}
                      </select>
                    </div>

                    {/* Organization */}
                    <div>
                      <label className="text-xs uppercase tracking-[0.15em] text-white/30 font-sans block mb-2">
                        Organização
                      </label>
                      <select
                        value={u.organization_id ?? ""}
                        disabled={isSaving}
                        onChange={(e) => updateUser(u.id, { organization_id: e.target.value || null })}
                        className="w-full bg-[#111] border border-white/10 text-white/80 px-3 py-2 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/50"
                      >
                        <option value="">— Sem organização —</option>
                        {orgs.map((org) => (
                          <option key={org.id} value={org.id}>
                            {org.name} ({org.type})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="text-xs uppercase tracking-[0.15em] text-white/30 font-sans block mb-2">
                        Status
                      </label>
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => updateUser(u.id, { is_active: !u.is_active })}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-sans transition-colors ${
                          u.is_active
                            ? "border-emerald-700/40 text-emerald-400 bg-emerald-900/10 hover:bg-red-900/10 hover:text-red-400 hover:border-red-700/40"
                            : "border-red-700/40 text-red-400 bg-red-900/10 hover:bg-emerald-900/10 hover:text-emerald-400 hover:border-emerald-700/40"
                        }`}
                      >
                        {u.is_active ? <><UserCheck size={14} /> Ativo — clique para desativar</> : <><UserX size={14} /> Inativo — clique para ativar</>}
                      </button>
                    </div>
                  </div>

                  {/* Extra info */}
                  <div className="mt-4 flex flex-wrap gap-3">
                    {u.whatsapp && (
                      <span className="flex items-center gap-1.5 text-xs font-sans text-white/40 bg-white/5 px-3 py-1.5 rounded-full">
                        <Phone size={11} className="text-gold/50" /> {u.whatsapp}
                      </span>
                    )}
                    {u.creci && (
                      <span className="flex items-center gap-1.5 text-xs font-sans text-white/40 bg-white/5 px-3 py-1.5 rounded-full">
                        <Star size={11} className="text-gold/50" /> CRECI: {u.creci}
                      </span>
                    )}
                  </div>
                  {u.bio && (
                    <div className="mt-3 flex items-start gap-2 text-xs font-sans text-white/40">
                      <FileText size={11} className="text-gold/50 mt-0.5 flex-shrink-0" />
                      <span>{u.bio}</span>
                    </div>
                  )}

                  {isSaving && (
                    <p className="text-gold/60 text-xs font-sans mt-3">Salvando...</p>
                  )}
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
