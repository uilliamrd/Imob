"use client"

import { useState, useMemo, useTransition } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import {
  Sparkles, Star, Plus, X, Home, Calendar, Building2,
  CheckCircle, Clock, PauseCircle, XCircle, Trash2, Edit3, Search,
  AlertTriangle, TrendingUp, BarChart2,
} from "lucide-react"
import { HIGHLIGHT_UPSELLS, BOOST_OPTIONS } from "@/lib/plans"
import type { PropertyAd, AdTier, AdStatus } from "@/types/database"

type SimpleProperty = {
  id: string; title: string; slug: string; price: number
  images: string[]; neighborhood: string | null; city: string | null
  org_id: string | null
  organization: { id: string; name: string } | null
}

export type PendingHighlight = {
  id: string; property_id: string; highlight: string
  paid_amount: number | null; created_at: string
  property: { title: string } | null
}

export type PendingBoost = {
  id: string; property_id: string; boost: string; duracao_dias: number
  paid_amount: number | null; created_at: string
  property: { title: string } | null
}

interface Props {
  initialAds: PropertyAd[]
  allProperties: SimpleProperty[]
  orgQuotas: Record<string, { highlight_limit: number; super_limit: number }>
  pendingHighlights?: PendingHighlight[]
  pendingBoosts?: PendingBoost[]
}

const TIER_CONFIG: Record<AdTier, { label: string; color: string; icon: React.ElementType }> = {
  destaque:       { label: "Destaque",       color: "text-amber-400 bg-amber-900/20 border-amber-700/40",       icon: Star },
  super_destaque: { label: "Super Destaque", color: "text-gold bg-gold/10 border-gold/40",                      icon: Sparkles },
}

const STATUS_CONFIG: Record<AdStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending:  { label: "Pendente",  color: "text-blue-400 bg-blue-900/20 border-blue-700/40",    icon: Clock },
  active:   { label: "Ativo",     color: "text-emerald-400 bg-emerald-900/20 border-emerald-700/40", icon: CheckCircle },
  paused:   { label: "Pausado",   color: "text-amber-400 bg-amber-900/20 border-amber-700/40", icon: PauseCircle },
  expired:  { label: "Expirado",  color: "text-zinc-500 bg-zinc-800/50 border-zinc-700/40",    icon: XCircle },
}

function formatPrice(price: number) {
  if (price >= 1_000_000)
    return "R$ " + (price / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + " Mi"
  return "R$ " + price.toLocaleString("pt-BR")
}

function formatDate(d: string | null) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
}

const STATUS_TABS: Array<{ id: AdStatus | "all"; label: string }> = [
  { id: "all",     label: "Todos" },
  { id: "active",  label: "Ativos" },
  { id: "pending", label: "Pendentes" },
  { id: "paused",  label: "Pausados" },
  { id: "expired", label: "Expirados" },
]

type FormState = {
  property_id: string
  tier: AdTier
  status: AdStatus
  starts_at: string
  expires_at: string
  notes: string
}

const EMPTY_FORM: FormState = {
  property_id: "", tier: "destaque", status: "active",
  starts_at: "", expires_at: "", notes: "",
}

export function AnunciosClient({ initialAds, allProperties, orgQuotas, pendingHighlights: initialPH = [], pendingBoosts: initialPB = [] }: Props) {
  const supabase = createClient()
  const [ads, setAds] = useState<PropertyAd[]>(initialAds)
  const [pendingHL, setPendingHL] = useState<PendingHighlight[]>(initialPH)
  const [pendingBT, setPendingBT] = useState<PendingBoost[]>(initialPB)
  const [statusFilter, setStatusFilter] = useState<AdStatus | "all">("all")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [propSearch, setPropSearch] = useState("")
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const now = new Date()
  const in7  = new Date(now); in7.setDate(now.getDate() + 7)
  const in30 = new Date(now); in30.setDate(now.getDate() + 30)

  // Stats
  const stats = useMemo(() => {
    const active  = ads.filter((a) => a.status === "active")
    const expiring7  = active.filter((a) => a.expires_at && new Date(a.expires_at) <= in7)
    const expiring30 = active.filter((a) => a.expires_at && new Date(a.expires_at) <= in30)
    return {
      active:     active.length,
      super:      active.filter((a) => a.tier === "super_destaque").length,
      dest:       active.filter((a) => a.tier === "destaque").length,
      pending:    ads.filter((a) => a.status === "pending").length,
      expiring7,
      expiring30,
      noExpiry:   active.filter((a) => !a.expires_at).length,
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ads])

  const filtered = useMemo(() =>
    statusFilter === "all" ? ads : ads.filter((a) => a.status === statusFilter),
  [ads, statusFilter])

  const filteredProps = useMemo(() =>
    propSearch
      ? allProperties.filter((p) =>
          p.title.toLowerCase().includes(propSearch.toLowerCase()) ||
          (p.organization?.name ?? "").toLowerCase().includes(propSearch.toLowerCase())
        )
      : allProperties,
  [allProperties, propSearch])

  function openCreate() {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setPropSearch("")
    setError(null)
    setShowForm(true)
  }

  function openEdit(ad: PropertyAd) {
    setEditingId(ad.id)
    setForm({
      property_id: ad.property_id,
      tier: ad.tier,
      status: ad.status,
      starts_at: ad.starts_at ? ad.starts_at.slice(0, 10) : "",
      expires_at: ad.expires_at ? ad.expires_at.slice(0, 10) : "",
      notes: ad.notes ?? "",
    })
    setPropSearch("")
    setError(null)
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.property_id) { setError("Selecione um imóvel."); return }
    setError(null)

    const payload = {
      property_id: form.property_id,
      tier: form.tier,
      status: form.status,
      starts_at: form.starts_at || null,
      expires_at: form.expires_at || null,
      notes: form.notes || null,
      org_id: allProperties.find((p) => p.id === form.property_id)?.org_id ?? null,
    }

    startTransition(async () => {
      if (editingId) {
        const { data, error: err } = await supabase
          .from("property_ads")
          .update(payload)
          .eq("id", editingId)
          .select(`*, property:properties(id, title, slug, price, images, neighborhood, city, org_id, organization:organizations(id, name))`)
          .single()
        if (err) { setError(err.message); return }
        setAds((prev) => prev.map((a) => a.id === editingId ? (data as unknown as PropertyAd) : a))
      } else {
        const { data, error: err } = await supabase
          .from("property_ads")
          .insert(payload)
          .select(`*, property:properties(id, title, slug, price, images, neighborhood, city, org_id, organization:organizations(id, name))`)
          .single()
        if (err) { setError(err.message); return }
        setAds((prev) => [data as unknown as PropertyAd, ...prev])
      }
      setShowForm(false)
    })
  }

  async function setAdStatus(id: string, status: AdStatus) {
    const { data, error: err } = await supabase
      .from("property_ads")
      .update({ status })
      .eq("id", id)
      .select(`*, property:properties(id, title, slug, price, images, neighborhood, city, org_id, organization:organizations(id, name))`)
      .single()
    if (!err && data) setAds((prev) => prev.map((a) => a.id === id ? (data as unknown as PropertyAd) : a))
  }

  async function deleteAd(id: string) {
    if (!confirm("Excluir este anúncio?")) return
    const { error: err } = await supabase.from("property_ads").delete().eq("id", id)
    if (!err) setAds((prev) => prev.filter((a) => a.id !== id))
  }

  const selectedProp = allProperties.find((p) => p.id === form.property_id)

  async function approveHighlight(item: PendingHighlight) {
    const expires = new Date()
    expires.setDate(expires.getDate() + 30)
    const { error: err } = await supabase
      .from("property_highlights")
      .update({ status: "ativo", expires_at: expires.toISOString() })
      .eq("id", item.id)
    if (!err) setPendingHL((prev) => prev.filter((h) => h.id !== item.id))
  }

  async function rejectHighlight(item: PendingHighlight) {
    if (!confirm(`Recusar solicitação de destaque para "${item.property?.title}"?`)) return
    const { error: err } = await supabase
      .from("property_highlights")
      .update({ status: "cancelado" })
      .eq("id", item.id)
    if (!err) setPendingHL((prev) => prev.filter((h) => h.id !== item.id))
  }

  async function approveBoost(item: PendingBoost) {
    const starts = new Date()
    const expires = new Date()
    expires.setDate(expires.getDate() + item.duracao_dias)
    const { error: err } = await supabase
      .from("property_boosts")
      .update({ status: "ativo", starts_at: starts.toISOString(), expires_at: expires.toISOString() })
      .eq("id", item.id)
    if (!err) setPendingBT((prev) => prev.filter((b) => b.id !== item.id))
  }

  async function rejectBoost(item: PendingBoost) {
    if (!confirm(`Recusar solicitação de boost para "${item.property?.title}"?`)) return
    const { error: err } = await supabase
      .from("property_boosts")
      .update({ status: "cancelado" })
      .eq("id", item.id)
    if (!err) setPendingBT((prev) => prev.filter((b) => b.id !== item.id))
  }

  return (
    <div>
      {/* ── Solicitações Pendentes ─────────────────────────────── */}
      {(pendingHL.length > 0 || pendingBT.length > 0) && (
        <div className="mb-8 bg-card border border-gold/20 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-border bg-gold/5">
            <Clock size={13} className="text-gold" />
            <p className="text-xs uppercase tracking-[0.2em] text-gold font-sans font-semibold">
              Solicitações Pendentes ({pendingHL.length + pendingBT.length})
            </p>
          </div>
          <div className="divide-y divide-border">
            {pendingHL.map((item) => {
              const opt = HIGHLIGHT_UPSELLS[item.highlight as keyof typeof HIGHLIGHT_UPSELLS]
              return (
                <div key={item.id} className="flex items-center gap-4 px-5 py-3.5 flex-wrap">
                  <Sparkles size={13} className="text-amber-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground/80 text-sm font-sans truncate">{item.property?.title ?? item.property_id}</p>
                    <p className="text-muted-foreground text-xs font-sans">{opt?.nome ?? item.highlight} · R$ {item.paid_amount ?? opt?.preco}</p>
                  </div>
                  <p className="text-muted-foreground/40 text-xs font-sans flex-shrink-0">{formatDate(item.created_at)}</p>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => rejectHighlight(item)}
                      className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-sans text-red-400 hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-900/40">
                      Recusar
                    </button>
                    <button onClick={() => approveHighlight(item)}
                      className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-sans text-emerald-400 hover:bg-emerald-900/20 rounded-lg transition-colors border border-transparent hover:border-emerald-700/40">
                      Aprovar
                    </button>
                  </div>
                </div>
              )
            })}
            {pendingBT.map((item) => {
              const opt = BOOST_OPTIONS[item.boost as keyof typeof BOOST_OPTIONS]
              return (
                <div key={item.id} className="flex items-center gap-4 px-5 py-3.5 flex-wrap">
                  <Sparkles size={13} className="text-blue-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground/80 text-sm font-sans truncate">{item.property?.title ?? item.property_id}</p>
                    <p className="text-muted-foreground text-xs font-sans">{opt?.nome ?? item.boost} · {item.duracao_dias}d · R$ {item.paid_amount ?? opt?.preco}</p>
                  </div>
                  <p className="text-muted-foreground/40 text-xs font-sans flex-shrink-0">{formatDate(item.created_at)}</p>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => rejectBoost(item)}
                      className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-sans text-red-400 hover:bg-red-900/20 rounded-lg transition-colors border border-transparent hover:border-red-900/40">
                      Recusar
                    </button>
                    <button onClick={() => approveBoost(item)}
                      className="px-3 py-1.5 text-[10px] uppercase tracking-wider font-sans text-emerald-400 hover:bg-emerald-900/20 rounded-lg transition-colors border border-transparent hover:border-emerald-700/40">
                      Aprovar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Anúncios Ativos",   value: stats.active,  accent: "text-emerald-400" },
          { label: "Super Destaques",    value: stats.super,   accent: "text-gold" },
          { label: "Destaques",          value: stats.dest,    accent: "text-amber-400" },
          { label: "Aguardando Ativação",value: stats.pending, accent: "text-blue-400" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-sans mb-1">{s.label}</p>
            <p className={`font-serif text-3xl font-bold ${s.accent}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ── Expiring soon warning ──────────────────────────────── */}
      {stats.expiring7.length > 0 && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-amber-900/20 border border-amber-700/40 flex items-start gap-3">
          <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-400 text-xs font-sans font-semibold uppercase tracking-wider mb-1">
              {stats.expiring7.length} anúncio{stats.expiring7.length !== 1 ? "s" : ""} expira{stats.expiring7.length === 1 ? "" : "m"} em menos de 7 dias
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              {stats.expiring7.map((ad) => {
                const prop = ad.property as SimpleProperty | undefined
                const daysLeft = Math.ceil((new Date(ad.expires_at!).getTime() - now.getTime()) / 86400000)
                return (
                  <span key={ad.id} className="text-[10px] font-sans text-amber-300/80 bg-amber-900/30 px-2 py-0.5 rounded-full border border-amber-700/30">
                    {prop?.title ?? ad.property_id} — {daysLeft <= 0 ? "hoje" : `${daysLeft}d`}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Analytics summary ──────────────────────────────────── */}
      {stats.active > 0 && (
        <div className="mb-6 bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={13} className="text-gold" />
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-sans">Visão Geral dos Anúncios Ativos</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            {/* Tier distribution */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-sans mb-2">Por tipo</p>
              <div className="space-y-2">
                {([
                  { tier: "super_destaque" as const, count: stats.super,  color: "bg-gold" },
                  { tier: "destaque"       as const, count: stats.dest,   color: "bg-amber-400" },
                ] as { tier: AdTier; count: number; color: string }[]).map(({ tier, count, color }) => {
                  const pct = stats.active > 0 ? Math.round((count / stats.active) * 100) : 0
                  return (
                    <div key={tier}>
                      <div className="flex items-center justify-between text-[10px] font-sans mb-0.5">
                        <span className="text-muted-foreground">{TIER_CONFIG[tier].label}</span>
                        <span className="text-foreground font-medium">{count}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Expiry breakdown */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-sans mb-2">Por expiração</p>
              <div className="space-y-1.5">
                {[
                  { label: "Expira em 7 dias",  count: stats.expiring7.length,  color: "text-amber-400" },
                  { label: "Expira em 30 dias", count: stats.expiring30.length, color: "text-blue-400" },
                  { label: "Sem prazo definido", count: stats.noExpiry,          color: "text-muted-foreground" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-[10px] font-sans text-muted-foreground/70">{row.label}</span>
                    <span className={`text-xs font-serif font-bold ${row.color}`}>{row.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Next to expire */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60 font-sans mb-2 flex items-center gap-1">
                <TrendingUp size={9} /> Próximas expirações
              </p>
              <div className="space-y-1.5">
                {ads
                  .filter((a) => a.status === "active" && a.expires_at)
                  .sort((a, b) => new Date(a.expires_at!).getTime() - new Date(b.expires_at!).getTime())
                  .slice(0, 3)
                  .map((ad) => {
                    const prop = ad.property as SimpleProperty | undefined
                    const daysLeft = Math.ceil((new Date(ad.expires_at!).getTime() - now.getTime()) / 86400000)
                    const TierIcon = TIER_CONFIG[ad.tier].icon
                    return (
                      <div key={ad.id} className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <TierIcon size={9} className="text-gold flex-shrink-0" />
                          <span className="text-[10px] font-sans text-foreground/70 truncate">{prop?.title ?? "—"}</span>
                        </div>
                        <span className={`text-[10px] font-sans flex-shrink-0 ${daysLeft <= 7 ? "text-amber-400" : "text-muted-foreground/50"}`}>
                          {daysLeft <= 0 ? "hoje" : `${daysLeft}d`}
                        </span>
                      </div>
                    )
                  })}
                {ads.filter((a) => a.status === "active" && a.expires_at).length === 0 && (
                  <p className="text-[10px] font-sans text-muted-foreground/30">Nenhum com prazo definido.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 overflow-x-auto">
          {STATUS_TABS.map((t) => (
            <button key={t.id} onClick={() => setStatusFilter(t.id)}
              className={`px-4 py-2 rounded-lg text-xs uppercase tracking-[0.15em] font-sans transition-colors whitespace-nowrap ${
                statusFilter === t.id
                  ? "bg-gold/15 text-gold"
                  : "text-muted-foreground hover:text-foreground hover:bg-card"
              }`}>
              {t.label}
            </button>
          ))}
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-gold text-graphite rounded-xl text-xs uppercase tracking-[0.15em] font-sans hover:bg-gold-light transition-colors flex-shrink-0 ml-2">
          <Plus size={13} /> Novo Anúncio
        </button>
      </div>

      {/* Ad list */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground/40 font-sans text-sm border border-dashed border-border rounded-xl">
          Nenhum anúncio {statusFilter !== "all" ? STATUS_CONFIG[statusFilter as AdStatus]?.label.toLowerCase() : ""} encontrado.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ad) => {
            const prop = ad.property as SimpleProperty | undefined
            const TierIcon = TIER_CONFIG[ad.tier].icon
            const StatusIcon = STATUS_CONFIG[ad.status].icon
            return (
              <div key={ad.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-gold/20 transition-colors">
                <div className="flex items-start gap-4 p-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-muted relative">
                    {prop?.images?.[0] ? (
                      <Image src={prop.images[0]} alt={prop.title ?? ""} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Home size={16} className="text-muted-foreground/20" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-serif text-foreground text-sm font-semibold truncate">
                          {prop?.title ?? ad.property_id}
                        </p>
                        {(prop?.neighborhood || prop?.city) && (
                          <p className="text-muted-foreground text-xs font-sans">
                            {[prop.neighborhood, prop.city].filter(Boolean).join(", ")}
                          </p>
                        )}
                        {prop?.organization && (
                          <p className="text-muted-foreground/50 text-xs font-sans flex items-center gap-1 mt-0.5">
                            <Building2 size={9} />{prop.organization.name}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Tier badge */}
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] uppercase font-sans tracking-wider ${TIER_CONFIG[ad.tier].color}`}>
                          <TierIcon size={9} />{TIER_CONFIG[ad.tier].label}
                        </span>
                        {/* Status badge */}
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] uppercase font-sans tracking-wider ${STATUS_CONFIG[ad.status].color}`}>
                          <StatusIcon size={9} />{STATUS_CONFIG[ad.status].label}
                        </span>
                      </div>
                    </div>

                    {/* Dates + actions row */}
                    <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                      <div className="flex items-center gap-4 text-xs font-sans text-muted-foreground/50">
                        <span className="flex items-center gap-1">
                          <Calendar size={9} />
                          {formatDate(ad.starts_at)} → {formatDate(ad.expires_at)}
                        </span>
                        {ad.notes && <span className="italic truncate max-w-[200px]">{ad.notes}</span>}
                      </div>

                      <div className="flex items-center gap-1">
                        {ad.status !== "active" && (
                          <button onClick={() => setAdStatus(ad.id, "active")}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-sans text-emerald-400 hover:bg-emerald-900/20 transition-colors border border-transparent hover:border-emerald-700/40">
                            <CheckCircle size={10} /> Ativar
                          </button>
                        )}
                        {ad.status === "active" && (
                          <button onClick={() => setAdStatus(ad.id, "paused")}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-sans text-amber-400 hover:bg-amber-900/20 transition-colors border border-transparent hover:border-amber-700/40">
                            <PauseCircle size={10} /> Pausar
                          </button>
                        )}
                        {ad.status !== "expired" && (
                          <button onClick={() => setAdStatus(ad.id, "expired")}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider font-sans text-zinc-500 hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-700/40">
                            <XCircle size={10} /> Expirar
                          </button>
                        )}
                        <button onClick={() => openEdit(ad)}
                          className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-gold hover:bg-gold/5 transition-colors">
                          <Edit3 size={13} />
                        </button>
                        <button onClick={() => deleteAd(ad.id)}
                          className="p-1.5 rounded-lg text-muted-foreground/40 hover:text-red-400 hover:bg-red-900/10 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Modal Form ──────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors">
              <X size={18} />
            </button>

            <p className="text-xs uppercase tracking-[0.2em] text-gold font-sans mb-1">
              {editingId ? "Editar anúncio" : "Novo anúncio"}
            </p>
            <h2 className="font-serif text-xl font-bold text-foreground mb-5">
              {editingId ? "Atualizar configuração" : "Criar destaque no portal"}
            </h2>

            {/* Property selector */}
            <div className="mb-4">
              <label className="text-xs uppercase tracking-[0.1em] text-muted-foreground font-sans block mb-1.5">
                Imóvel *
              </label>
              {selectedProp ? (
                <div className="flex items-center gap-3 p-3 bg-background border border-gold/30 rounded-xl">
                  <div className="w-12 h-9 flex-shrink-0 rounded-lg overflow-hidden bg-muted relative">
                    {selectedProp.images[0]
                      ? <Image src={selectedProp.images[0]} alt="" fill className="object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><Home size={12} className="text-muted-foreground/20" /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-sm font-semibold text-foreground truncate">{selectedProp.title}</p>
                    <p className="text-xs font-sans text-muted-foreground">{selectedProp.organization?.name}</p>
                  </div>
                  <button onClick={() => setForm((f) => ({ ...f, property_id: "" }))}
                    className="text-muted-foreground hover:text-foreground flex-shrink-0">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div>
                  <div className="relative mb-2">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text" placeholder="Buscar imóvel..." value={propSearch}
                      onChange={(e) => setPropSearch(e.target.value)}
                      className="w-full bg-background border border-border text-foreground placeholder-muted-foreground/40 pl-9 pr-4 py-2.5 rounded-xl font-sans text-sm focus:outline-none focus:border-gold/40 transition-colors"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1 border border-border rounded-xl p-1 bg-background">
                    {filteredProps.slice(0, 20).map((p) => (
                      <button key={p.id} onClick={() => setForm((f) => ({ ...f, property_id: p.id }))}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-card transition-colors text-left">
                        <div className="w-10 h-7 flex-shrink-0 rounded overflow-hidden bg-muted relative">
                          {p.images[0]
                            ? <Image src={p.images[0]} alt="" fill className="object-cover" />
                            : <Home size={10} className="text-muted-foreground/20 m-auto" />
                          }
                        </div>
                        <div className="min-w-0">
                          <p className="font-serif text-xs font-semibold text-foreground truncate">{p.title}</p>
                          <p className="text-[10px] font-sans text-muted-foreground truncate">
                            {p.organization?.name} · {formatPrice(p.price)}
                          </p>
                        </div>
                      </button>
                    ))}
                    {filteredProps.length === 0 && (
                      <p className="text-xs text-muted-foreground/40 font-sans py-3 text-center">Nenhum imóvel encontrado.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quota info for selected org */}
            {selectedProp?.org_id && (() => {
              const quota = orgQuotas[selectedProp.org_id]
              if (!quota) return null
              const activeAds = ads.filter((a) => a.status === "active" && a.org_id === selectedProp.org_id)
              const destUsed = activeAds.filter((a) => a.tier === "destaque").length
              const superUsed = activeAds.filter((a) => a.tier === "super_destaque").length
              const destAtLimit = destUsed >= quota.highlight_limit
              const superAtLimit = superUsed >= quota.super_limit
              return (
                <div className="mb-4 text-xs font-sans text-muted-foreground/60 bg-muted/20 rounded-lg px-3 py-2 flex items-center gap-3 flex-wrap">
                  <span>Quota da org:</span>
                  <span className={destAtLimit ? "text-red-400" : "text-gold"}>
                    {destUsed}/{quota.highlight_limit} dest.
                  </span>
                  <span>·</span>
                  <span className={superAtLimit ? "text-red-400" : "text-gold"}>
                    {superUsed}/{quota.super_limit} super
                  </span>
                  {(destAtLimit || superAtLimit) && (
                    <span className="text-amber-400">⚠ Quota atingida</span>
                  )}
                </div>
              )
            })()}

            {/* Tier */}
            <div className="mb-4">
              <label className="text-xs uppercase tracking-[0.1em] text-muted-foreground font-sans block mb-1.5">
                Tipo de anúncio
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["destaque", "super_destaque"] as AdTier[]).map((tier) => {
                  const cfg = TIER_CONFIG[tier]
                  const Icon = cfg.icon
                  return (
                    <button key={tier} onClick={() => setForm((f) => ({ ...f, tier }))}
                      className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-sans transition-colors ${
                        form.tier === tier
                          ? "border-gold/60 bg-gold/10 text-foreground"
                          : "border-border text-muted-foreground hover:border-gold/30"
                      }`}>
                      <Icon size={14} className={form.tier === tier ? "text-gold" : ""} />
                      <div className="text-left">
                        <p className="font-semibold">{cfg.label}</p>
                        <p className="text-[10px] text-muted-foreground/60">
                          {tier === "destaque" ? "Badge dourado nos resultados" : "Seção de destaque no topo"}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Status */}
            <div className="mb-4">
              <label className="text-xs uppercase tracking-[0.1em] text-muted-foreground font-sans block mb-1.5">
                Status inicial
              </label>
              <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as AdStatus }))}
                className="w-full bg-background border border-border text-foreground px-3 py-2.5 rounded-xl font-sans text-sm focus:outline-none focus:border-gold/40 transition-colors">
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs uppercase tracking-[0.1em] text-muted-foreground font-sans block mb-1.5">
                  Início
                </label>
                <input type="date" value={form.starts_at}
                  onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))}
                  className="w-full bg-background border border-border text-foreground px-3 py-2.5 rounded-xl font-sans text-sm focus:outline-none focus:border-gold/40 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-[0.1em] text-muted-foreground font-sans block mb-1.5">
                  Expiração
                </label>
                <input type="date" value={form.expires_at}
                  onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
                  className="w-full bg-background border border-border text-foreground px-3 py-2.5 rounded-xl font-sans text-sm focus:outline-none focus:border-gold/40 transition-colors"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="mb-5">
              <label className="text-xs uppercase tracking-[0.1em] text-muted-foreground font-sans block mb-1.5">
                Observações (opcional)
              </label>
              <input type="text" value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                placeholder="Ex: Pacote mensal — Construtora Horizonte"
                className="w-full bg-background border border-border text-foreground placeholder-muted-foreground/40 px-3 py-2.5 rounded-xl font-sans text-sm focus:outline-none focus:border-gold/40 transition-colors"
              />
            </div>

            {error && (
              <p className="text-red-400 text-xs font-sans mb-4">{error}</p>
            )}

            <button onClick={handleSave} disabled={isPending}
              className="w-full py-3 bg-[#1C1C1C] text-[#F5F0E8] hover:bg-[#C9A96E] hover:text-[#1C1C1C] disabled:opacity-40 transition-all duration-300 text-xs uppercase tracking-[0.2em] font-sans rounded-xl">
              {isPending ? "Salvando..." : editingId ? "Atualizar Anúncio" : "Criar Anúncio"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
