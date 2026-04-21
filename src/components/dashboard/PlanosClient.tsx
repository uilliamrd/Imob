"use client"

import { useState, useMemo } from "react"
import { ChevronDown, ChevronUp, Save, Loader2 } from "lucide-react"
import type { OrgPlan, OrgType, SubscriptionStatus } from "@/types/database"
import { getPlanName, type PlanEntityType } from "@/lib/plans"
import Image from "next/image"

export type ClientRow = {
  id: string
  kind: "org" | "corretor"
  entityType: OrgType | "corretor"
  name: string
  logo: string | null
  plan: OrgPlan
  subscription_status: SubscriptionStatus
  subscription_expires_at: string | null
  payment_due_date: string | null
}

type EditDraft = {
  plan?: OrgPlan
  subscription_status?: SubscriptionStatus
  subscription_expires_at?: string | null
  payment_due_date?: string | null
}

const PLANS: OrgPlan[] = ["free", "starter", "pro", "enterprise"]
const STATUSES: { value: SubscriptionStatus; label: string }[] = [
  { value: "trial", label: "Trial" },
  { value: "active", label: "Ativo" },
  { value: "suspended", label: "Suspenso" },
  { value: "expired", label: "Expirado" },
]

const TYPE_LABEL: Record<OrgType | "corretor", string> = {
  imobiliaria: "Imobiliária",
  construtora: "Construtora",
  corretor: "Corretor",
}

const STATUS_COLORS: Record<SubscriptionStatus, string> = {
  trial:     "text-amber-400 bg-amber-900/20 border-amber-800/30",
  active:    "text-emerald-400 bg-emerald-900/20 border-emerald-800/30",
  suspended: "text-red-400 bg-red-900/20 border-red-800/30",
  expired:   "text-muted-foreground bg-muted/20 border-border",
}

const inputClass = "w-full bg-background border border-border rounded-lg px-3 py-2 text-sm font-sans text-foreground focus:outline-none focus:border-gold/50"
const labelClass = "block text-[10px] uppercase tracking-[0.15em] text-muted-foreground/60 mb-1.5 font-sans"

function toLocalDate(iso: string | null): string {
  if (!iso) return ""
  return iso.slice(0, 10)
}

function toIso(date: string): string | null {
  if (!date) return null
  return new Date(date + "T00:00:00").toISOString()
}

function PlanRow({
  row,
  onSaved,
}: {
  row: ClientRow
  onSaved: (id: string, draft: EditDraft) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [draft, setDraft] = useState<EditDraft>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const effective: ClientRow = { ...row, ...draft }
  const isDirty = Object.keys(draft).length > 0

  function setField<K extends keyof EditDraft>(key: K, value: EditDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }))
  }

  async function handleSave() {
    if (!isDirty) return
    setSaving(true)
    setError(null)

    const url = row.kind === "org"
      ? `/api/organizations/${row.id}`
      : `/api/admin/profiles/${row.id}`

    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    })

    if (res.ok) {
      onSaved(row.id, draft)
      setDraft({})
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } else {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? "Erro ao salvar.")
    }
    setSaving(false)
  }

  return (
    <div className="border-b border-white/5 last:border-0">
      <div
        className="px-5 py-4 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer gap-4"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Nome + logo */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {row.logo ? (
            <Image src={row.logo} alt={row.name} width={28} height={28} className="rounded-md object-contain shrink-0" />
          ) : (
            <div className="w-7 h-7 rounded-md bg-muted/40 shrink-0" />
          )}
          <span className="text-foreground/90 text-sm font-sans truncate">{row.name}</span>
        </div>

        {/* Tipo */}
        <span className="hidden sm:block text-xs text-muted-foreground font-sans shrink-0 w-24 text-right">
          {TYPE_LABEL[row.entityType]}
        </span>

        {/* Plano */}
        <span className="text-xs font-mono text-gold shrink-0 w-28 text-right">
          {getPlanName(row.entityType as PlanEntityType, effective.plan)}
        </span>

        {/* Status */}
        <span className={`hidden md:inline-flex text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wide font-sans shrink-0 ${STATUS_COLORS[effective.subscription_status]}`}>
          {STATUSES.find((s) => s.value === effective.subscription_status)?.label}
        </span>

        {/* Vencimento */}
        <span className="hidden lg:block text-xs text-muted-foreground/60 font-sans shrink-0 w-24 text-right">
          {effective.payment_due_date ? new Date(effective.payment_due_date).toLocaleDateString("pt-BR") : "—"}
        </span>

        {expanded ? <ChevronUp size={14} className="text-muted-foreground shrink-0" /> : <ChevronDown size={14} className="text-muted-foreground shrink-0" />}
      </div>

      {expanded && (
        <div className="px-5 pb-5 pt-3 bg-white/[0.01] border-t border-border space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Plano</label>
              <select
                value={effective.plan}
                onChange={(e) => setField("plan", e.target.value as OrgPlan)}
                className={inputClass}
              >
                {PLANS.map((p) => (
                  <option key={p} value={p}>
                    {getPlanName(row.entityType as PlanEntityType, p)} ({p})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Status da assinatura</label>
              <select
                value={effective.subscription_status}
                onChange={(e) => setField("subscription_status", e.target.value as SubscriptionStatus)}
                className={inputClass}
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Expiração da assinatura</label>
              <input
                type="date"
                value={toLocalDate(effective.subscription_expires_at ?? null)}
                onChange={(e) => setField("subscription_expires_at", toIso(e.target.value))}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Próximo vencimento</label>
              <input
                type="date"
                value={toLocalDate(effective.payment_due_date ?? null)}
                onChange={(e) => setField("payment_due_date", toIso(e.target.value))}
                className={inputClass}
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-xs font-sans">{error}</p>}

          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="flex items-center gap-1.5 px-4 py-2 bg-gold text-graphite rounded-lg text-xs font-sans font-semibold disabled:opacity-40 transition-opacity"
          >
            {saving ? <Loader2 size={11} className="animate-spin" /> : <Save size={11} />}
            {saved ? "Salvo!" : "Salvar"}
          </button>
        </div>
      )}
    </div>
  )
}

type FilterStatus = SubscriptionStatus | "todos"
type FilterType = OrgType | "corretor" | "todos"
type FilterPlan = OrgPlan | "todos"

export function PlanosClient({ rows: initialRows }: { rows: ClientRow[] }) {
  const [rows, setRows] = useState(initialRows)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("todos")
  const [filterType, setFilterType] = useState<FilterType>("todos")
  const [filterPlan, setFilterPlan] = useState<FilterPlan>("todos")

  function handleSaved(id: string, draft: EditDraft) {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, ...draft } : r))
  }

  const counts = useMemo(() => ({
    total: rows.length,
    active: rows.filter((r) => r.subscription_status === "active").length,
    trial: rows.filter((r) => r.subscription_status === "trial").length,
    suspended: rows.filter((r) => r.subscription_status === "suspended" || r.subscription_status === "expired").length,
  }), [rows])

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false
      if (filterStatus !== "todos") {
        if (filterStatus === "suspended" && r.subscription_status !== "suspended" && r.subscription_status !== "expired") return false
        if (filterStatus !== "suspended" && r.subscription_status !== filterStatus) return false
      }
      if (filterType !== "todos" && r.entityType !== filterType) return false
      if (filterPlan !== "todos" && r.plan !== filterPlan) return false
      return true
    })
  }, [rows, search, filterStatus, filterType, filterPlan])

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: counts.total, key: "todos" as FilterStatus, color: "text-foreground/80" },
          { label: "Ativos", value: counts.active, key: "active" as FilterStatus, color: "text-emerald-400" },
          { label: "Trial", value: counts.trial, key: "trial" as FilterStatus, color: "text-amber-400" },
          { label: "Suspensos/Expirados", value: counts.suspended, key: "suspended" as FilterStatus, color: "text-red-400" },
        ].map((card) => (
          <button
            key={card.key}
            onClick={() => setFilterStatus(filterStatus === card.key ? "todos" : card.key)}
            className={`bg-card border rounded-xl p-5 text-left transition-colors ${filterStatus === card.key ? "border-gold/40 bg-gold/5" : "border-border hover:border-border/80"}`}
          >
            <p className={`text-2xl font-serif font-bold ${card.color}`}>{card.value}</p>
            <p className="text-muted-foreground text-xs font-sans mt-1 uppercase tracking-wider">{card.label}</p>
          </button>
        ))}
      </div>

      {/* Filtros + Busca */}
      <div className="bg-card border border-border rounded-2xl">
        <div className="px-5 py-4 border-b border-border flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm font-sans text-foreground focus:outline-none focus:border-gold/50 w-48"
          />

          <div className="flex gap-1 flex-wrap">
            {(["todos", "imobiliaria", "construtora", "corretor"] as (FilterType)[]).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-colors ${filterType === t ? "bg-gold text-graphite" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}
              >
                {t === "todos" ? "Todos" : TYPE_LABEL[t as OrgType | "corretor"]}
              </button>
            ))}
          </div>

          <div className="flex gap-1 flex-wrap">
            {(["todos", ...PLANS] as (FilterPlan)[]).map((p) => (
              <button
                key={p}
                onClick={() => setFilterPlan(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-colors ${filterPlan === p ? "bg-gold text-graphite" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}
              >
                {p === "todos" ? "Todos" : p}
              </button>
            ))}
          </div>
        </div>

        {/* Cabeçalho da tabela */}
        <div className="px-5 py-3 border-b border-border hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-4 items-center">
          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 font-sans">Cliente</span>
          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 font-sans w-24 text-right">Tipo</span>
          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 font-sans w-28 text-right">Plano</span>
          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 font-sans hidden md:block text-right">Status</span>
          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 font-sans hidden lg:block w-24 text-right">Vencimento</span>
          <span className="w-4" />
        </div>

        {/* Linhas */}
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground/50 text-sm font-sans">Nenhum cliente encontrado.</p>
        ) : (
          filtered.map((row) => (
            <PlanRow key={row.id} row={row} onSaved={handleSaved} />
          ))
        )}
      </div>

      <p className="text-muted-foreground/40 text-xs font-sans text-right">{filtered.length} de {rows.length} clientes</p>
    </div>
  )
}
