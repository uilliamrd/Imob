"use client"

import { useState } from "react"
import { AlertTriangle, CheckCircle, Clock, XCircle, Building2, User, ChevronDown, ChevronUp, Save } from "lucide-react"
import type { OrgPlan, OrgType, SubscriptionStatus } from "@/types/database"
import { getPlanName, resolveEntityType } from "@/lib/plans"

interface OrgRow {
  id: string
  name: string
  type: OrgType
  plan: OrgPlan
  subscription_status: SubscriptionStatus
  subscription_expires_at: string | null
  payment_due_date: string | null
}

interface CorretorRow {
  id: string
  full_name: string | null
  role: string
  plan: OrgPlan
  subscription_status: SubscriptionStatus
  subscription_expires_at: string | null
  payment_due_date: string | null
  organization_id: string | null
}

const inputClass = "w-full bg-[#0a0a0a] border border-border text-white placeholder-muted-foreground/40 px-3 py-2 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/50 transition-colors"
const labelClass = "text-xs uppercase tracking-[0.15em] text-muted-foreground font-sans block mb-1.5"

const STATUS_CONFIG: Record<SubscriptionStatus, { label: string; icon: React.ElementType; color: string }> = {
  trial:     { label: "Trial",     icon: Clock,         color: "text-blue-400 bg-blue-900/20 border-blue-800/40" },
  active:    { label: "Ativo",     icon: CheckCircle,   color: "text-emerald-400 bg-emerald-900/20 border-emerald-800/40" },
  suspended: { label: "Suspenso",  icon: XCircle,       color: "text-red-400 bg-red-900/20 border-red-800/40" },
  expired:   { label: "Expirado",  icon: AlertTriangle, color: "text-amber-400 bg-amber-900/20 border-amber-800/40" },
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function ExpirationBadge({ date }: { date: string | null }) {
  const days = daysUntil(date)
  if (days === null) return <span className="text-muted-foreground/40 text-xs font-sans">—</span>
  const isOverdue = days < 0
  const isUrgent = days >= 0 && days <= 7
  const color = isOverdue ? "text-red-400" : isUrgent ? "text-amber-400" : "text-muted-foreground/60"
  const label = isOverdue
    ? `${Math.abs(days)}d atrasado`
    : days === 0 ? "Vence hoje"
    : `${days}d restantes`
  return <span className={`text-xs font-sans ${color}`}>{label}</span>
}

function isEffectivelySuspended(row: OrgRow | CorretorRow): boolean {
  if (row.plan === "free") return false
  if (row.subscription_status === "suspended") return true
  if (row.subscription_status === "active") return false
  if (!row.payment_due_date) return false
  const graceCutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  return new Date(row.payment_due_date) < graceCutoff
}

type EditDraft = {
  plan?: OrgPlan
  subscription_status?: SubscriptionStatus
  subscription_expires_at?: string | null
  payment_due_date?: string | null
}

function SubscriptionRow({
  id,
  kind,
  name,
  entityType,
  plan,
  status,
  expiresAt,
  dueDate,
  onSaved,
}: {
  id: string
  kind: "org" | "profile"
  name: string
  entityType: Parameters<typeof getPlanName>[0]
  plan: OrgPlan
  status: SubscriptionStatus
  expiresAt: string | null
  dueDate: string | null
  onSaved: (id: string, kind: "org" | "profile", draft: EditDraft) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [draft, setDraft] = useState<EditDraft>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const effectivePlan = (draft.plan ?? plan) as OrgPlan
  const effectiveStatus = (draft.subscription_status ?? status) as SubscriptionStatus
  const effectiveExpires: string | null = "subscription_expires_at" in draft ? (draft.subscription_expires_at ?? null) : expiresAt
  const effectiveDue: string | null = "payment_due_date" in draft ? (draft.payment_due_date ?? null) : dueDate

  const cfg = STATUS_CONFIG[effectiveStatus]
  const StatusIcon = cfg.icon

  const isDirty = Object.keys(draft).length > 0

  async function handleSave() {
    if (!isDirty) return
    setSaving(true)
    setError(null)
    const url = kind === "org" ? `/api/organizations/${id}` : `/api/admin/profiles/${id}`
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    })
    if (res.ok) {
      onSaved(id, kind, draft)
      setDraft({})
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } else {
      const data = await res.json()
      setError(data.error ?? "Erro ao salvar.")
    }
    setSaving(false)
  }

  return (
    <div className="border-b border-white/5 last:border-0">
      <div
        className="px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            {kind === "org"
              ? <Building2 size={13} className="text-gold/60" />
              : <User size={13} className="text-gold/60" />}
          </div>
          <div className="min-w-0">
            <p className="text-foreground/90 text-sm font-sans truncate">{name}</p>
            <p className="text-muted-foreground/50 text-xs font-sans">{getPlanName(entityType, effectivePlan)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
          <ExpirationBadge date={effectiveExpires} />
          <span className={`hidden sm:flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-sans ${cfg.color}`}>
            <StatusIcon size={9} /> {cfg.label}
          </span>
          {expanded ? <ChevronUp size={13} className="text-muted-foreground" /> : <ChevronDown size={13} className="text-muted-foreground" />}
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5 pt-2 bg-white/[0.01] border-t border-border space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Plano</label>
              <select value={effectivePlan}
                onChange={(e) => setDraft((d) => ({ ...d, plan: e.target.value as OrgPlan }))}
                className={inputClass}>
                {(["free", "starter", "pro", "enterprise"] as OrgPlan[]).map((p) => (
                  <option key={p} value={p}>{getPlanName(entityType, p)} ({p})</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select value={effectiveStatus}
                onChange={(e) => setDraft((d) => ({ ...d, subscription_status: e.target.value as SubscriptionStatus }))}
                className={inputClass}>
                <option value="trial">Trial</option>
                <option value="active">Ativo</option>
                <option value="suspended">Suspenso</option>
                <option value="expired">Expirado</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Vencimento da Assinatura</label>
              <input type="date"
                value={effectiveExpires ? effectiveExpires.slice(0, 10) : ""}
                onChange={(e) => setDraft((d) => ({ ...d, subscription_expires_at: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Data de Pagamento</label>
              <input type="date"
                value={effectiveDue ? effectiveDue.slice(0, 10) : ""}
                onChange={(e) => setDraft((d) => ({ ...d, payment_due_date: e.target.value ? new Date(e.target.value).toISOString() : null }))}
                className={inputClass} />
              <p className="text-muted-foreground/40 text-[10px] font-sans mt-1">Suspenso 3 dias após esta data</p>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            {error && <p className="text-red-400 text-xs font-sans">{error}</p>}
            {saved && <p className="text-emerald-400 text-xs font-sans">✓ Salvo</p>}
            <button
              onClick={handleSave}
              disabled={saving || !isDirty}
              className="flex items-center gap-1.5 px-4 py-2 bg-gold text-graphite hover:bg-gold-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs uppercase tracking-[0.15em] font-sans rounded-lg font-medium"
            >
              {saving ? <span className="w-3 h-3 border-2 border-graphite/30 border-t-graphite rounded-full animate-spin" /> : <Save size={11} />}
              Salvar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function AssinaturasClient({ orgs, corretores }: { orgs: OrgRow[]; corretores: CorretorRow[] }) {
  const [orgRows, setOrgRows] = useState(orgs)
  const [corretorRows, setCorretorRows] = useState(corretores)
  const [filter, setFilter] = useState<"todos" | "expirando" | "suspensos" | "trial">("todos")

  function handleSaved(id: string, kind: "org" | "profile", draft: EditDraft) {
    if (kind === "org") {
      setOrgRows((prev) => prev.map((r) => r.id === id ? { ...r, ...draft } as OrgRow : r))
    } else {
      setCorretorRows((prev) => prev.map((r) => r.id === id ? { ...r, ...draft } as CorretorRow : r))
    }
  }

  const now = Date.now()
  const soon = now + 14 * 24 * 60 * 60 * 1000

  function matchesFilter(row: OrgRow | CorretorRow): boolean {
    if (filter === "todos") return true
    if (filter === "suspensos") return isEffectivelySuspended(row)
    if (filter === "trial") return row.subscription_status === "trial"
    if (filter === "expirando") {
      if (!row.subscription_expires_at) return false
      const t = new Date(row.subscription_expires_at).getTime()
      return t <= soon && t >= now - 3 * 24 * 60 * 60 * 1000
    }
    return true
  }

  const filteredOrgs = orgRows.filter(matchesFilter)
  const filteredCorretores = corretorRows.filter(matchesFilter)
  const total = filteredOrgs.length + filteredCorretores.length

  const suspendedCount = [...orgRows, ...corretorRows].filter(isEffectivelySuspended).length
  const expiringCount = [...orgRows, ...corretorRows].filter((r) => {
    if (!r.subscription_expires_at) return false
    const t = new Date(r.subscription_expires_at).getTime()
    return t <= soon && t >= now
  }).length
  const trialCount = [...orgRows, ...corretorRows].filter((r) => r.subscription_status === "trial").length

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total",       value: orgRows.length + corretorRows.length, color: "text-foreground/70", key: "todos" as const },
          { label: "Expirando",   value: expiringCount,  color: "text-amber-400", key: "expirando" as const },
          { label: "Suspensos",   value: suspendedCount, color: "text-red-400",   key: "suspensos" as const },
          { label: "Trial",       value: trialCount,     color: "text-blue-400",  key: "trial" as const },
        ].map((card) => (
          <button key={card.key} onClick={() => setFilter(card.key)}
            className={`bg-card border rounded-xl p-4 text-left transition-colors ${filter === card.key ? "border-gold/40 bg-gold/5" : "border-border hover:border-border/80"}`}>
            <p className={`text-2xl font-serif font-bold ${card.color}`}>{card.value}</p>
            <p className="text-muted-foreground text-xs font-sans mt-0.5 uppercase tracking-wider">{card.label}</p>
          </button>
        ))}
      </div>

      {/* Orgs */}
      {filteredOrgs.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 size={15} className="text-gold" />
              <h2 className="font-serif text-lg font-semibold text-white">Organizações</h2>
            </div>
            <span className="text-muted-foreground text-xs font-sans">{filteredOrgs.length}</span>
          </div>
          {filteredOrgs.map((org) => (
            <SubscriptionRow
              key={org.id}
              id={org.id}
              kind="org"
              name={org.name}
              entityType={resolveEntityType(org.type === "construtora" ? "construtora" : "imobiliaria", org.type)}
              plan={org.plan}
              status={org.subscription_status}
              expiresAt={org.subscription_expires_at}
              dueDate={org.payment_due_date}
              onSaved={handleSaved}
            />
          ))}
        </div>
      )}

      {/* Corretores avulsos */}
      {filteredCorretores.length > 0 && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User size={15} className="text-gold" />
              <h2 className="font-serif text-lg font-semibold text-white">Corretores Avulsos</h2>
            </div>
            <span className="text-muted-foreground text-xs font-sans">{filteredCorretores.length}</span>
          </div>
          {filteredCorretores.map((c) => (
            <SubscriptionRow
              key={c.id}
              id={c.id}
              kind="profile"
              name={c.full_name ?? "—"}
              entityType="corretor"
              plan={c.plan}
              status={c.subscription_status}
              expiresAt={c.subscription_expires_at}
              dueDate={c.payment_due_date}
              onSaved={handleSaved}
            />
          ))}
        </div>
      )}

      {total === 0 && (
        <div className="bg-card border border-border rounded-2xl px-6 py-16 text-center">
          <p className="text-muted-foreground/50 font-sans text-sm">Nenhum registro encontrado para este filtro.</p>
        </div>
      )}
    </div>
  )
}
