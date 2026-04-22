"use client"

import { Check, Minus, MessageCircle } from "lucide-react"
import type { OrgPlan } from "@/types/database"
import { PLAN_FEATURES, PLAN_PRICES, getPlanName } from "@/lib/plans"
import type { PlanEntityType, FeatureVal } from "@/lib/plans"

const WHATSAPP = "5551991102914"

const PLAN_ORDER: OrgPlan[] = ["free", "starter", "pro", "enterprise"]

function fmtPrice(n: number) {
  return n.toLocaleString("pt-BR")
}

function FeatureCell({ val }: { val: FeatureVal }) {
  if (val === null) return <span className="font-serif text-gold font-bold text-base">∞</span>
  if (val === true) return <Check size={14} className="text-emerald-400 mx-auto" />
  if (val === false || val === 0) return <Minus size={14} className="text-muted-foreground/20 mx-auto" />
  return <span className="text-foreground/80 font-sans text-sm font-medium">{val}</span>
}

function whatsappLink(planName: string) {
  const msg = encodeURIComponent(`Olá! Gostaria de solicitar upgrade para o plano *${planName}*.`)
  return `https://wa.me/${WHATSAPP}?text=${msg}`
}

interface Props {
  entityType: PlanEntityType
  currentPlan: OrgPlan
}

export function UpgradeCards({ entityType, currentPlan }: Props) {
  const features = PLAN_FEATURES[entityType]

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full min-w-[640px]">

        {/* ── Cabeçalho com planos e preços ───────────────────── */}
        <thead>
          <tr className="border-b border-border">
            <th className="px-6 py-6 text-left w-[38%]">
              <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground/30 font-sans font-normal">
                Funcionalidade
              </span>
            </th>
            {PLAN_ORDER.map((plan) => {
              const name = getPlanName(entityType, plan)
              const prices = PLAN_PRICES[entityType][plan]
              const isCurrent = plan === currentPlan
              const isHighlighted = plan === "pro"
              return (
                <th
                  key={plan}
                  className={`px-4 py-6 text-center align-top ${isCurrent ? "bg-gold/5" : ""}`}
                >
                  {isCurrent && (
                    <div className="mb-2">
                      <span className="text-[9px] uppercase tracking-[0.2em] text-gold font-sans px-2 py-0.5 rounded-full bg-gold/20 border border-gold/30">
                        Plano atual
                      </span>
                    </div>
                  )}
                  {isHighlighted && !isCurrent && (
                    <div className="mb-2">
                      <span className="text-[9px] uppercase tracking-[0.2em] text-amber-400 font-sans px-2 py-0.5 rounded-full bg-amber-900/20 border border-amber-700/30">
                        Mais popular
                      </span>
                    </div>
                  )}
                  {!isCurrent && !isHighlighted && <div className="mb-2 h-5" />}

                  <div className="font-serif text-sm font-bold text-foreground">{name}</div>
                  <div className="text-[9px] text-muted-foreground/30 font-sans uppercase tracking-wider mt-0.5 mb-3">
                    {plan}
                  </div>

                  {prices.mensal === 0 ? (
                    <div className="font-serif text-2xl font-bold text-gold">Grátis</div>
                  ) : (
                    <>
                      <div className="flex items-baseline justify-center gap-0.5">
                        <span className="text-muted-foreground/40 text-xs font-sans">R$</span>
                        <span className="font-serif text-2xl font-bold text-foreground">
                          {fmtPrice(prices.mensal)}
                        </span>
                        <span className="text-muted-foreground/40 text-[10px] font-sans">/mês</span>
                      </div>
                      {prices.implantacao > 0 && (
                        <div className="text-[9px] text-muted-foreground/30 font-sans mt-0.5">
                          + R$ {fmtPrice(prices.implantacao)} implantação
                        </div>
                      )}
                      {prices.landing_page_adicional && (
                        <div className="text-[9px] text-muted-foreground/30 font-sans">
                          LP adicional: R$ {fmtPrice(prices.landing_page_adicional)}
                        </div>
                      )}
                    </>
                  )}
                </th>
              )
            })}
          </tr>
        </thead>

        {/* ── Linhas de funcionalidades ────────────────────────── */}
        <tbody>
          {features.map((row, i) => (
            <tr
              key={i}
              className={`border-b border-border/40 last:border-0 ${i % 2 === 1 ? "bg-muted/[0.025]" : ""}`}
            >
              <td className="px-6 py-3 text-xs font-sans text-muted-foreground/60">
                {row.label}
              </td>
              {PLAN_ORDER.map((plan, pi) => (
                <td
                  key={plan}
                  className={`px-4 py-3 text-center ${plan === currentPlan ? "bg-gold/5" : ""}`}
                >
                  <div className="flex justify-center items-center">
                    <FeatureCell val={row.values[pi]} />
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>

        {/* ── Botões de CTA ────────────────────────────────────── */}
        <tfoot>
          <tr className="border-t border-border">
            <td className="px-6 py-5" />
            {PLAN_ORDER.map((plan) => {
              const name = getPlanName(entityType, plan)
              const isCurrent = plan === currentPlan
              const isHighlighted = plan === "pro"
              return (
                <td
                  key={plan}
                  className={`px-4 py-5 ${isCurrent ? "bg-gold/5" : ""}`}
                >
                  {isCurrent ? (
                    <div className="py-2.5 text-center text-[10px] uppercase tracking-[0.15em] font-sans text-gold/50 border border-gold/20 rounded-lg">
                      Ativo
                    </div>
                  ) : (
                    <a
                      href={whatsappLink(name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[10px] uppercase tracking-[0.15em] font-sans transition-colors ${
                        isHighlighted
                          ? "bg-gold text-graphite hover:bg-gold-light"
                          : "border border-border text-muted-foreground hover:border-gold/40 hover:text-gold"
                      }`}
                    >
                      <MessageCircle size={11} />
                      Solicitar
                    </a>
                  )}
                </td>
              )
            })}
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
