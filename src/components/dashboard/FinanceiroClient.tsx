"use client"

import { useState } from "react"
import { CheckCircle, Clock, XCircle, Plus, Save, Trash2, DollarSign } from "lucide-react"
import type { OrgPlan, OrgType, PaymentRecord, PaymentRecordStatus, PaymentRecordType } from "@/types/database"
import { getPlanName, PLAN_PRICES, resolveEntityType } from "@/lib/plans"

interface OrgOption { id: string; name: string; type: OrgType; plan: OrgPlan }
interface ProfileOption { id: string; name: string; role: string; plan: OrgPlan }

interface Props {
  payments: PaymentRecord[]
  mrr: number
  overdueCount: number
  receivedThisMonth: number
  orgOptions: OrgOption[]
  profileOptions: ProfileOption[]
}

const TYPE_LABELS: Record<PaymentRecordType, string> = {
  implantacao: "Implantação", mensal: "Mensalidade", landing_page: "Landing Page", outro: "Outro"
}
const STATUS_CONFIG: Record<PaymentRecordStatus, { label: string; color: string; icon: React.ElementType }> = {
  pendente:  { label: "Pendente",  color: "text-amber-400 border-amber-700/40 bg-amber-900/10",  icon: Clock },
  pago:      { label: "Pago",      color: "text-emerald-400 border-emerald-700/40 bg-emerald-900/10", icon: CheckCircle },
  cancelado: { label: "Cancelado", color: "text-red-400 border-red-700/40 bg-red-900/10",        icon: XCircle },
}

function fmt(n: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n)
}

const inputClass = "w-full bg-[#0a0a0a] border border-border text-white placeholder-muted-foreground/40 px-3 py-2 rounded-lg font-sans text-sm focus:outline-none focus:border-gold/50 transition-colors"
const labelClass = "text-xs uppercase tracking-[0.15em] text-muted-foreground font-sans block mb-1.5"

interface NewRecord {
  org_id: string; profile_id: string; amount: string
  type: PaymentRecordType; status: PaymentRecordStatus
  due_date: string; notes: string
}

const emptyNew: NewRecord = { org_id: "", profile_id: "", amount: "", type: "mensal", status: "pendente", due_date: "", notes: "" }

export function FinanceiroClient({ payments: initialPayments, mrr, overdueCount, receivedThisMonth, orgOptions, profileOptions }: Props) {
  const [payments, setPayments] = useState(initialPayments)
  const [showForm, setShowForm] = useState(false)
  const [newRec, setNewRec] = useState<NewRecord>(emptyNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<"todos" | PaymentRecordStatus>("todos")

  const filtered = payments.filter((p) => filter === "todos" || p.status === filter)

  async function createRecord() {
    if (!newRec.amount || (!newRec.org_id && !newRec.profile_id)) {
      setError("Informe o valor e o cliente.")
      return
    }
    setSaving(true)
    setError(null)
    const payload = {
      org_id: newRec.org_id || null,
      profile_id: newRec.profile_id || null,
      amount: parseFloat(newRec.amount),
      type: newRec.type,
      status: newRec.status,
      due_date: newRec.due_date ? new Date(newRec.due_date).toISOString() : null,
      paid_at: newRec.status === "pago" ? new Date().toISOString() : null,
      notes: newRec.notes || null,
    }
    const res = await fetch("/api/admin/pagamentos", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    })
    if (res.ok) {
      const data = await res.json()
      setPayments((prev) => [data, ...prev])
      setNewRec(emptyNew)
      setShowForm(false)
    } else {
      const data = await res.json()
      setError(data.error ?? "Erro ao criar.")
    }
    setSaving(false)
  }

  async function markAsPaid(id: string) {
    const res = await fetch(`/api/admin/pagamentos/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "pago", paid_at: new Date().toISOString() }),
    })
    if (res.ok) {
      setPayments((prev) => prev.map((p) => p.id === id ? { ...p, status: "pago", paid_at: new Date().toISOString() } : p))
    }
  }

  async function deleteRecord(id: string) {
    if (!window.confirm("Excluir este registro?")) return
    const res = await fetch(`/api/admin/pagamentos/${id}`, { method: "DELETE" })
    if (res.ok) setPayments((prev) => prev.filter((p) => p.id !== id))
  }

  function getPlanSuggestion(orgId: string) {
    const org = orgOptions.find((o) => o.id === orgId)
    if (!org) return null
    const entityType = resolveEntityType(org.type, org.type)
    return PLAN_PRICES[entityType][org.plan]
  }

  return (
    <div className="space-y-6">
      {/* KPI summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <DollarSign size={16} className="text-gold mb-3" />
          <p className="text-2xl font-serif font-bold text-gold">{fmt(mrr)}</p>
          <p className="text-muted-foreground text-xs uppercase tracking-wider mt-1">MRR Estimado</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <CheckCircle size={16} className="text-emerald-400 mb-3" />
          <p className="text-2xl font-serif font-bold text-emerald-400">{fmt(receivedThisMonth)}</p>
          <p className="text-muted-foreground text-xs uppercase tracking-wider mt-1">Recebido Este Mês</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-5">
          <Clock size={16} className="text-red-400 mb-3" />
          <p className="text-2xl font-serif font-bold text-red-400">{overdueCount}</p>
          <p className="text-muted-foreground text-xs uppercase tracking-wider mt-1">Pagamentos Vencidos</p>
        </div>
      </div>

      {/* Pricing reference */}
      <details className="bg-card border border-border rounded-2xl overflow-hidden">
        <summary className="px-6 py-4 cursor-pointer text-sm font-sans text-foreground/70 hover:text-foreground flex items-center gap-2 select-none">
          <span className="text-gold text-xs uppercase tracking-wider">Tabela de preços por plano</span>
        </summary>
        <div className="px-6 pb-6 space-y-4">
          {(["construtora", "imobiliaria", "corretor"] as const).map((type) => (
            <div key={type}>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{type === "corretor" ? "Corretores avulsos" : type === "construtora" ? "Construtoras" : "Imobiliárias"}</p>
              <div className="overflow-x-auto">
                <table className="text-xs font-sans w-full">
                  <thead><tr className="text-muted-foreground/50 text-left border-b border-border">
                    <th className="pb-1.5 font-normal">Plano</th>
                    <th className="pb-1.5 font-normal text-right">Implantação</th>
                    <th className="pb-1.5 font-normal text-right">Mensal</th>
                    {type === "construtora" && <th className="pb-1.5 font-normal text-right">+ Landing Page</th>}
                  </tr></thead>
                  <tbody className="divide-y divide-white/5">
                    {(["free","starter","pro","enterprise"] as OrgPlan[]).map((plan) => {
                      const prices = PLAN_PRICES[type][plan]
                      return (
                        <tr key={plan}>
                          <td className="py-1.5 text-foreground/70">{getPlanName(type, plan)}</td>
                          <td className="py-1.5 text-right text-muted-foreground">{prices.implantacao ? fmt(prices.implantacao) : "Grátis"}</td>
                          <td className="py-1.5 text-right text-gold">{prices.mensal ? fmt(prices.mensal) : "Grátis"}</td>
                          {type === "construtora" && <td className="py-1.5 text-right text-muted-foreground">{prices.landing_page_adicional ? fmt(prices.landing_page_adicional) : "—"}</td>}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </details>

      {/* Payments list */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-1">
            {(["todos", "pendente", "pago", "cancelado"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-sans transition-colors capitalize ${filter === f ? "bg-gold text-graphite" : "bg-muted/50 text-muted-foreground hover:bg-muted"}`}>
                {f === "todos" ? "Todos" : STATUS_CONFIG[f as PaymentRecordStatus]?.label ?? f}
              </button>
            ))}
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gold text-graphite hover:bg-gold-light transition-colors text-xs uppercase tracking-[0.15em] font-sans rounded-lg font-medium">
            <Plus size={12} /> Novo Registro
          </button>
        </div>

        {showForm && (
          <div className="px-6 py-5 border-b border-border bg-white/[0.02] space-y-4">
            <p className="text-xs uppercase tracking-wider text-gold/70 font-sans">Novo Pagamento</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Organização</label>
                <select value={newRec.org_id}
                  onChange={(e) => {
                    const org = orgOptions.find((o) => o.id === e.target.value)
                    const suggestion = org ? PLAN_PRICES[resolveEntityType(org.type, org.type)][org.plan].mensal : 0
                    setNewRec((r) => ({ ...r, org_id: e.target.value, profile_id: "", amount: suggestion ? String(suggestion) : r.amount }))
                  }}
                  className={inputClass}>
                  <option value="">— Selecionar —</option>
                  {orgOptions.map((o) => (
                    <option key={o.id} value={o.id}>{o.name} ({getPlanName(resolveEntityType(o.type, o.type), o.plan)})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Corretor Avulso</label>
                <select value={newRec.profile_id}
                  onChange={(e) => setNewRec((r) => ({ ...r, profile_id: e.target.value, org_id: "" }))}
                  className={inputClass}>
                  <option value="">— Selecionar —</option>
                  {profileOptions.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} ({getPlanName("corretor", p.plan)})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Tipo</label>
                <select value={newRec.type} onChange={(e) => setNewRec((r) => ({ ...r, type: e.target.value as PaymentRecordType }))} className={inputClass}>
                  {(Object.entries(TYPE_LABELS) as [PaymentRecordType, string][]).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Valor (R$)</label>
                <input type="number" step="0.01" value={newRec.amount} onChange={(e) => setNewRec((r) => ({ ...r, amount: e.target.value }))} placeholder="0,00" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select value={newRec.status} onChange={(e) => setNewRec((r) => ({ ...r, status: e.target.value as PaymentRecordStatus }))} className={inputClass}>
                  <option value="pendente">Pendente</option>
                  <option value="pago">Pago</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Vencimento</label>
                <input type="date" value={newRec.due_date} onChange={(e) => setNewRec((r) => ({ ...r, due_date: e.target.value }))} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Observações</label>
                <input type="text" value={newRec.notes} onChange={(e) => setNewRec((r) => ({ ...r, notes: e.target.value }))} placeholder="Referência, nota..." className={inputClass} />
              </div>
            </div>
            {error && <p className="text-red-400 text-xs font-sans">{error}</p>}
            <div className="flex gap-3">
              <button onClick={createRecord} disabled={saving}
                className="flex items-center gap-1.5 px-5 py-2 bg-gold text-graphite hover:bg-gold-light disabled:opacity-40 transition-colors text-xs uppercase font-sans rounded-lg font-medium">
                {saving ? <span className="w-3 h-3 border-2 border-graphite/30 border-t-graphite rounded-full animate-spin" /> : <Save size={11} />} Salvar
              </button>
              <button onClick={() => { setShowForm(false); setNewRec(emptyNew) }}
                className="px-4 py-2 text-muted-foreground hover:text-foreground text-xs font-sans transition-colors">Cancelar</button>
            </div>
          </div>
        )}

        <div className="divide-y divide-white/5">
          {filtered.map((p) => {
            const cfg = STATUS_CONFIG[p.status]
            const StatusIcon = cfg.icon
            const org = p.organization as { name: string; type: string; plan: string } | null
            const profile = p.profile as { full_name: string | null } | null
            const isOverdue = p.status === "pendente" && p.due_date && new Date(p.due_date) < new Date()
            return (
              <div key={p.id} className="px-6 py-4 flex items-center justify-between gap-3 flex-wrap hover:bg-white/[0.02]">
                <div className="min-w-0">
                  <p className="text-foreground/90 text-sm font-sans truncate">
                    {org?.name ?? profile?.full_name ?? "—"}
                    {p.notes && <span className="text-muted-foreground/50 ml-2 text-xs">— {p.notes}</span>}
                  </p>
                  <p className="text-muted-foreground/50 text-xs font-sans mt-0.5">
                    {TYPE_LABELS[p.type]}
                    {p.due_date && ` · Venc. ${new Date(p.due_date).toLocaleDateString("pt-BR")}`}
                    {isOverdue && <span className="text-red-400 ml-1">· VENCIDO</span>}
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-gold font-serif font-bold text-sm">{fmt(Number(p.amount))}</span>
                  <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-sans ${cfg.color}`}>
                    <StatusIcon size={9} /> {cfg.label}
                  </span>
                  {p.status === "pendente" && (
                    <button onClick={() => markAsPaid(p.id)}
                      className="text-[10px] px-2 py-1 border border-emerald-700/40 text-emerald-400 hover:bg-emerald-900/20 rounded-lg font-sans transition-colors">
                      Marcar pago
                    </button>
                  )}
                  <button onClick={() => deleteRecord(p.id)}
                    className="text-muted-foreground/30 hover:text-red-400 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="px-6 py-12 text-center text-muted-foreground/50 font-sans text-sm">
              Nenhum registro encontrado.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
