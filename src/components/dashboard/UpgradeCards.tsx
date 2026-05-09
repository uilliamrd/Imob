"use client"

import { useState } from "react"
import { Check, Minus, Loader2, Sparkles, ArrowRight } from "lucide-react"
import type { OrgPlan } from "@/types/database"
import { PLAN_FEATURES, PLAN_PRICES, getPlanName } from "@/lib/plans"
import type { PlanEntityType, FeatureVal } from "@/lib/plans"
import { cn } from "@/lib/utils"

const PLAN_ORDER: OrgPlan[] = ["free", "starter", "pro", "enterprise"]

function fmtPrice(n: number) {
  return n.toLocaleString("pt-BR")
}

function FeatureCell({ val }: { val: FeatureVal }) {
  if (val === null) return <span className="font-serif text-[var(--gold)] font-bold text-base">∞</span>
  if (val === true) return <Check size={14} className="text-emerald-400 mx-auto" />
  if (val === false || val === 0) return <Minus size={14} className="text-muted-foreground/20 mx-auto" />
  return <span className="text-foreground/80 font-sans text-sm font-medium">{val}</span>
}

function CheckoutButton({
  plan,
  entityType,
  isHighlighted,
}: {
  plan: OrgPlan
  entityType: PlanEntityType
  isHighlighted: boolean
}) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, entityType }),
      })
      const json = await res.json()
      if (!res.ok) { alert(json.error ?? "Erro ao iniciar pagamento"); return }
      window.location.href = json.url
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-sans font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed",
        isHighlighted
          ? "bg-[var(--gold)] text-[#0a0a0a] hover:bg-[var(--gold-light)] shadow"
          : "border border-border text-foreground hover:border-[var(--gold)]/40 hover:text-[var(--gold)]"
      )}
    >
      {loading ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <>Assinar agora <ArrowRight size={14} /></>
      )}
    </button>
  )
}

interface Props {
  entityType: PlanEntityType
  currentPlan: OrgPlan
}

export function UpgradeCards({ entityType, currentPlan }: Props) {
  const features = PLAN_FEATURES[entityType]
  const currentIdx = PLAN_ORDER.indexOf(currentPlan)

  // Default selection: first upgradable plan above current
  const defaultSelected = PLAN_ORDER.find((p, i) => i > currentIdx) ?? "pro"
  const [selected, setSelected] = useState<OrgPlan>(defaultSelected as OrgPlan)

  const selectedPrices = PLAN_PRICES[entityType][selected]
  const currentPrices  = PLAN_PRICES[entityType][currentPlan]
  const selectedIdx    = PLAN_ORDER.indexOf(selected)
  const isUpgrade      = selectedIdx > currentIdx
  const implDiff       = isUpgrade ? Math.max(0, selectedPrices.implantacao - currentPrices.implantacao) : 0
  const selectedName   = getPlanName(entityType, selected)
  const selectedFeatures = features.slice(0, 5)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10 items-start">

      {/* ── Left: plan selector + feature table ──────────────────────────── */}
      <div className="lg:col-span-2 flex flex-col gap-6">

        {/* Plan cards row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {PLAN_ORDER.map((plan) => {
            const prices     = PLAN_PRICES[entityType][plan]
            const name       = getPlanName(entityType, plan)
            const isCurrent  = plan === currentPlan
            const isSelected = plan === selected
            const isPro      = plan === "pro"
            const planIdx    = PLAN_ORDER.indexOf(plan)
            const isUpgradable = planIdx > currentIdx

            return (
              <button
                key={plan}
                type="button"
                disabled={isCurrent || !isUpgradable}
                onClick={() => setSelected(plan)}
                className={cn(
                  "relative flex flex-col rounded-xl border p-3 text-left transition-all",
                  isSelected && !isCurrent
                    ? "border-[var(--gold)] bg-[var(--gold)]/5 shadow-[0_0_16px_rgba(201,169,110,0.15)]"
                    : isCurrent
                    ? "border-[var(--gold)]/30 bg-[var(--gold)]/5 cursor-default"
                    : isUpgradable
                    ? "border-border bg-card hover:border-[var(--gold)]/30 cursor-pointer"
                    : "border-border/40 bg-muted/20 cursor-not-allowed opacity-40"
                )}
              >
                {isPro && !isCurrent && (
                  <span className="absolute -top-2 left-2 flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[var(--gold)] text-[#0a0a0a] text-[9px] font-sans uppercase tracking-wider font-bold shadow">
                    <Sparkles size={7} /> Popular
                  </span>
                )}
                {isCurrent && (
                  <span className="absolute -top-2 right-2 px-2 py-0.5 rounded-full bg-card border border-[var(--gold)]/30 text-[var(--gold)] text-[9px] font-sans uppercase tracking-wider">
                    Atual
                  </span>
                )}
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-sans mb-1">
                  {name}
                </p>
                {prices.mensal === 0 ? (
                  <p className="font-serif text-lg font-bold text-[var(--gold)]">Grátis</p>
                ) : (
                  <p className="font-serif text-lg font-bold text-foreground">
                    R$ {fmtPrice(prices.mensal)}
                    <span className="text-[10px] font-sans font-normal text-muted-foreground">/mês</span>
                  </p>
                )}
              </button>
            )
          })}
        </div>

        {/* Feature comparison table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="grid bg-muted/50 border-b border-border px-4 py-3"
            style={{ gridTemplateColumns: `1fr repeat(${PLAN_ORDER.length}, 64px)` }}
          >
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-sans">Recurso</span>
            {PLAN_ORDER.map((plan) => (
              <span
                key={plan}
                className={cn(
                  "text-center text-[10px] uppercase tracking-wider font-sans font-medium",
                  plan === selected ? "text-[var(--gold)]" : "text-muted-foreground/50"
                )}
              >
                {getPlanName(entityType, plan)}
              </span>
            ))}
          </div>
          {features.map((row, i) => (
            <div
              key={row.label}
              className={cn(
                "border-b border-border/40 last:border-0 grid items-center px-4 py-3",
                i % 2 === 1 && "bg-muted/20"
              )}
              style={{ gridTemplateColumns: `1fr repeat(${PLAN_ORDER.length}, 64px)` }}
            >
              <span className="text-xs font-sans text-muted-foreground/70 pr-4">{row.label}</span>
              {PLAN_ORDER.map((plan, pi) => (
                <div
                  key={plan}
                  className={cn(
                    "flex justify-center items-center",
                    plan === selected && "bg-[var(--gold)]/5 -mx-0 rounded"
                  )}
                >
                  <FeatureCell val={row.values[pi]} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: sticky order summary ───────────────────────────────────── */}
      <div className="lg:col-span-1">
        <div className="sticky top-24 bg-card border border-[var(--gold)]/25 rounded-2xl p-6 flex flex-col gap-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-sans mb-1">
              Resumo do pedido
            </p>
            <h3 className="font-serif text-2xl font-bold text-foreground">
              {selectedName}
            </h3>
          </div>

          <div className="divider-gold" />

          {/* Price breakdown */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-sans text-muted-foreground">Mensalidade</span>
              {selectedPrices.mensal === 0 ? (
                <span className="text-sm font-sans font-semibold text-[var(--gold)]">Grátis</span>
              ) : (
                <span className="text-sm font-sans font-semibold text-foreground">
                  R$ {fmtPrice(selectedPrices.mensal)}/mês
                </span>
              )}
            </div>
            {implDiff > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-sans text-muted-foreground">Implantação (diferença)</span>
                <span className="text-sm font-sans text-foreground">R$ {fmtPrice(implDiff)}</span>
              </div>
            )}
            {selectedPrices.landing_page_adicional && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-sans text-muted-foreground/60">LP adicional (opcional)</span>
                <span className="text-xs font-sans text-muted-foreground/60">+R$ {fmtPrice(selectedPrices.landing_page_adicional)}</span>
              </div>
            )}
          </div>

          {/* Top features preview */}
          <div className="flex flex-col gap-1.5 bg-muted/30 rounded-xl p-3">
            {selectedFeatures.map((row, i) => {
              const val = row.values[selectedIdx]
              if (val === false) return null
              return (
                <div key={i} className="flex items-center gap-2">
                  <Check size={11} className="text-emerald-400 flex-shrink-0" />
                  <span className="text-xs font-sans text-muted-foreground">
                    {row.label}
                    {val !== true && val !== null && (
                      <span className="text-foreground/70 ml-1">
                        ({val === null ? "Ilimitado" : val})
                      </span>
                    )}
                  </span>
                </div>
              )
            })}
          </div>

          {/* CTA */}
          {selected === currentPlan ? (
            <div className="flex flex-col gap-2">
              <div className="py-3 text-center text-sm font-sans text-[var(--gold)]/50 border border-[var(--gold)]/20 rounded-xl">
                Plano atual ativo
              </div>
              <a
                href="/api/billing/portal"
                className="block py-2 text-center text-xs font-sans text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              >
                Gerenciar assinatura →
              </a>
            </div>
          ) : !isUpgrade ? (
            <div className="py-3 text-center text-sm font-sans text-muted-foreground/40 border border-border/30 rounded-xl">
              Plano inferior ao atual
            </div>
          ) : (
            <CheckoutButton plan={selected} entityType={entityType} isHighlighted={selected === "pro"} />
          )}

          <p className="text-[10px] font-sans text-muted-foreground/40 text-center leading-relaxed">
            Ao assinar você concorda com os Termos de Uso. Cobrança via Asaas, cancelável a qualquer momento.
          </p>
        </div>
      </div>
    </div>
  )
}
