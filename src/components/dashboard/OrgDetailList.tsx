"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import {
  Building2, ExternalLink, Edit, Trash2, Users, Home,
  AlertTriangle, CheckCircle, PlusCircle, Globe
} from "lucide-react"
import { OrgDetailPanel } from "@/components/dashboard/OrgDetailPanel"
import { OrgForm } from "@/components/dashboard/OrgForm"
import type { Organization, OrgType, OrgPlan } from "@/types/database"

export interface OrgWithStats extends Organization {
  corretores: number
  imoveis: number
}

const PLAN_CONFIG: Record<OrgPlan, { label: string; color: string }> = {
  free:       { label: "Gratuito",    color: "text-zinc-400 bg-zinc-800/60 border-zinc-700/40" },
  starter:    { label: "Starter",     color: "text-sky-400 bg-sky-900/20 border-sky-700/40" },
  pro:        { label: "Pro",         color: "text-violet-400 bg-violet-900/20 border-violet-700/40" },
  enterprise: { label: "Enterprise",  color: "text-gold bg-gold/10 border-gold/40" },
}

interface Props {
  initialOrgs: OrgWithStats[]
  orgType: OrgType
}

const TYPE_LABEL: Record<OrgType, string> = {
  imobiliaria: "imobiliária",
  construtora: "construtora",
}

const TYPE_PATH: Record<OrgType, string> = {
  imobiliaria: "imobiliaria",
  construtora: "construtora",
}

export function OrgDetailList({ initialOrgs, orgType }: Props) {
  const supabase = createClient()
  const [orgs, setOrgs] = useState<OrgWithStats[]>(initialOrgs)
  const [viewing, setViewing] = useState<OrgWithStats | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingPlan, setEditingPlan] = useState<string | null>(null)

  async function deleteOrg(org: OrgWithStats) {
    if (!window.confirm(`Excluir "${org.name}"?\n\nIsso desvinculará todos os usuários. Imóveis vinculados NÃO serão excluídos. Esta ação não pode ser desfeita.`)) return
    setDeleting(org.id)
    setError(null)
    const res = await fetch(`/api/organizations/${org.id}`, { method: "DELETE" })
    if (res.ok) {
      setOrgs((prev) => prev.filter((o) => o.id !== org.id))
    } else {
      const data = await res.json()
      setError(data.error ?? "Erro ao excluir.")
    }
    setDeleting(null)
  }

  async function savePlan(orgId: string, plan: OrgPlan) {
    await supabase.from("organizations").update({ plan }).eq("id", orgId)
    setOrgs((prev) => prev.map((o) => o.id === orgId ? { ...o, plan } : o))
    setEditingPlan(null)
  }

  return (
    <div>
      {error && (
        <div className="mb-4 px-4 py-2.5 rounded-lg bg-red-900/20 border border-red-700/40 text-red-400 text-xs font-sans">
          {error}
        </div>
      )}

      {/* Stats summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-sans mb-1">Total</p>
          <p className="font-serif text-3xl font-bold text-foreground">{orgs.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-sans mb-1">Com Minisite</p>
          <p className="font-serif text-3xl font-bold text-emerald-400">{orgs.filter(o => o.slug).length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-sans mb-1">Corretores</p>
          <p className="font-serif text-3xl font-bold text-gold">{orgs.reduce((s, o) => s + o.corretores, 0)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-sans mb-1">Imóveis</p>
          <p className="font-serif text-3xl font-bold text-foreground">{orgs.reduce((s, o) => s + o.imoveis, 0)}</p>
        </div>
      </div>

      {/* Org cards */}
      <div className="space-y-3 mb-8">
        {orgs.map((org) => {
          const path = TYPE_PATH[orgType]
          const planCfg = PLAN_CONFIG[org.plan] ?? PLAN_CONFIG.free
          const minisiteUrl = org.slug ? `/${path}/${org.slug}` : null

          return (
            <div key={org.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-gold/20 transition-colors">
              <div className="flex items-start gap-4 p-5">
                {/* Logo */}
                <div className="w-12 h-12 flex-shrink-0 rounded-xl bg-muted/50 flex items-center justify-center overflow-hidden border border-border">
                  {org.logo ? (
                    <Image src={org.logo} alt={org.name} width={44} height={44} className="object-contain p-1" />
                  ) : (
                    <Building2 size={18} className="text-muted-foreground" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-serif text-base font-semibold text-foreground">{org.name}</p>

                      {/* Minisite URL */}
                      {minisiteUrl ? (
                        <a href={minisiteUrl} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-gold/70 hover:text-gold font-mono mt-0.5 transition-colors">
                          <Globe size={9} />{minisiteUrl}
                          <ExternalLink size={9} />
                        </a>
                      ) : (
                        <p className="flex items-center gap-1 text-xs text-amber-500/70 font-sans mt-0.5">
                          <AlertTriangle size={9} />Minisite não publicado — defina um slug no perfil
                        </p>
                      )}
                    </div>

                    {/* Plan badge — click to edit */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {editingPlan === org.id ? (
                        <select
                          defaultValue={org.plan}
                          autoFocus
                          onBlur={(e) => savePlan(org.id, e.target.value as OrgPlan)}
                          onChange={(e) => savePlan(org.id, e.target.value as OrgPlan)}
                          className="text-[10px] px-2 py-1 rounded-full border border-gold/40 bg-card text-foreground font-sans focus:outline-none"
                        >
                          {(["free", "starter", "pro", "enterprise"] as OrgPlan[]).map((p) => (
                            <option key={p} value={p}>{PLAN_CONFIG[p].label}</option>
                          ))}
                        </select>
                      ) : (
                        <button
                          onClick={() => setEditingPlan(org.id)}
                          title="Clique para alterar o plano"
                          className={`text-[10px] px-2.5 py-1 rounded-full border uppercase tracking-wider font-sans transition-opacity hover:opacity-70 ${planCfg.color}`}
                        >
                          {planCfg.label}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-5 mt-3 flex-wrap">
                    <div className="flex items-center gap-1.5 text-xs font-sans text-muted-foreground">
                      <Users size={11} className="text-gold/50" />
                      <span><span className="text-foreground font-medium">{org.corretores}</span> corretor{org.corretores !== 1 ? "es" : ""}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-sans text-muted-foreground">
                      <Home size={11} className="text-gold/50" />
                      <span><span className="text-foreground font-medium">{org.imoveis}</span> imóvel{org.imoveis !== 1 ? "is" : ""} cadastrado{org.imoveis !== 1 ? "s" : ""}</span>
                    </div>
                    {org.has_lancamentos && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-amber-700/40 text-amber-400 bg-amber-900/10 uppercase tracking-wider font-sans">
                        Lançamentos
                      </span>
                    )}
                    {org.website && (
                      <a href={org.website} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-muted-foreground/50 hover:text-gold transition-colors flex items-center gap-1">
                        <ExternalLink size={9} />Site
                      </a>
                    )}
                    {minisiteUrl && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-400/70 font-sans">
                        <CheckCircle size={9} />Minisite ativo
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {minisiteUrl && (
                    <a href={minisiteUrl} target="_blank" rel="noopener noreferrer"
                      className="p-2 rounded-lg border border-border text-muted-foreground hover:text-gold hover:border-gold/30 transition-colors"
                      title="Ver minisite">
                      <ExternalLink size={13} />
                    </a>
                  )}
                  <button onClick={() => setViewing(org)}
                    className="p-2 rounded-lg border border-border text-muted-foreground hover:text-gold hover:border-gold/30 transition-colors"
                    title="Ver detalhes">
                    <Edit size={13} />
                  </button>
                  <button onClick={() => deleteOrg(org)} disabled={deleting === org.id}
                    className="p-2 rounded-lg border border-red-800/30 text-red-400/50 hover:text-red-400 hover:border-red-700/50 hover:bg-red-900/10 transition-colors disabled:opacity-40"
                    title="Excluir">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}

        {orgs.length === 0 && (
          <div className="py-16 text-center text-muted-foreground/40 font-sans text-sm border border-dashed border-border rounded-xl">
            Nenhuma {TYPE_LABEL[orgType]} cadastrada ainda.
          </div>
        )}
      </div>

      {/* Create new */}
      <div className="bg-card border border-border rounded-2xl">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="w-full flex items-center gap-2 px-6 py-4 border-b border-border hover:bg-muted/20 transition-colors"
        >
          <PlusCircle size={15} className="text-gold" />
          <span className="font-serif text-base font-semibold text-foreground">
            Nova {TYPE_LABEL[orgType].charAt(0).toUpperCase() + TYPE_LABEL[orgType].slice(1)}
          </span>
        </button>
        {showCreateForm && (
          <div className="p-6">
            <OrgForm
              userId=""
              orgId={undefined}
              isAdmin={true}
              initialData={{ name: "", type: orgType, portfolio_desc: "", website: "", logo: "" }}
            />
          </div>
        )}
      </div>

      <AnimatePresence>
        {viewing && (
          <OrgDetailPanel
            org={viewing}
            onClose={() => setViewing(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
