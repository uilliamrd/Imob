"use client"

import { useState } from "react"
import { UserPlus, Mail, ChevronDown, Lock } from "lucide-react"
import type { UserRole } from "@/types/database"

interface OrgOption { id: string; name: string; type: string }

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  imobiliaria: "Imobiliária",
  corretor: "Corretor",
  construtora: "Construtora",
}

export function InviteUserForm({ orgs }: { orgs: OrgOption[] }) {
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole]         = useState<UserRole>("corretor")
  const [orgId, setOrgId]       = useState("")
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState<{ type: "success" | "error"; message: string } | null>(null)

  const inputClass = "w-full bg-[#111] border border-white/10 text-white placeholder-white/20 px-4 py-3 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/50 transition-colors"
  const labelClass = "text-xs uppercase tracking-[0.15em] text-white/40 font-sans block mb-2"

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    const res = await fetch("/api/admin/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role, organization_id: orgId || null }),
    })

    const data = await res.json()

    if (res.ok) {
      setResult({ type: "success", message: `Usuário ${email} criado com sucesso. Já pode fazer login.` })
      setEmail(""); setPassword(""); setRole("corretor"); setOrgId("")
    } else {
      setResult({ type: "error", message: data.error ?? "Erro ao criar usuário." })
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Email */}
        <div>
          <label className={labelClass}>Email *</label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemplo.com" className={inputClass + " pl-9"} />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className={labelClass}>Senha *</label>
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres" minLength={6} className={inputClass + " pl-9"} />
          </div>
        </div>

        {/* Role */}
        <div>
          <label className={labelClass}>Papel *</label>
          <div className="relative">
            <select value={role} onChange={(e) => setRole(e.target.value as UserRole)}
              className={inputClass + " appearance-none"}>
              {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                <option key={r} value={r}>{ROLE_LABELS[r]}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          </div>
        </div>

        {/* Organization */}
        <div>
          <label className={labelClass}>Organização</label>
          <div className="relative">
            <select value={orgId} onChange={(e) => setOrgId(e.target.value)}
              className={inputClass + " appearance-none"}>
              <option value="">— Sem organização —</option>
              {orgs.map((org) => (
                <option key={org.id} value={org.id}>{org.name} ({org.type})</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          </div>
        </div>
      </div>

      {result && (
        <div className={`px-4 py-3 rounded-lg text-sm font-sans ${
          result.type === "success"
            ? "bg-emerald-900/20 text-emerald-400 border border-emerald-700/30"
            : "bg-red-900/20 text-red-400 border border-red-700/30"
        }`}>
          {result.message}
        </div>
      )}

      <div className="flex justify-end">
        <button type="submit" disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-gold text-graphite hover:bg-gold-light disabled:opacity-50 transition-all text-xs uppercase tracking-[0.2em] font-sans rounded-lg font-medium">
          {loading
            ? <span className="w-4 h-4 border-2 border-graphite/30 border-t-graphite rounded-full animate-spin" />
            : <><UserPlus size={14} /> Criar Usuário</>}
        </button>
      </div>
    </form>
  )
}
