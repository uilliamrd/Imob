"use client"

import { Check, X, MessageCircle, Star } from "lucide-react"
import type { OrgPlan } from "@/types/database"
import type { PlanLimits, PlanEntityType } from "@/lib/plans"

// Número de WhatsApp para solicitações de upgrade (DDI + DDD + número, sem símbolos)
const WHATSAPP = "5551991102914"

type PlanData = {
  plan: OrgPlan
  name: string
  prices: { implantacao: number; mensal: number; landing_page_adicional?: number }
  limits: PlanLimits
  isCurrent: boolean
  isHighlighted: boolean
}

function fmt(n: number) {
  return n.toLocaleString("pt-BR")
}

function Feature({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={`flex items-start gap-2 text-xs font-sans ${ok ? "text-foreground/80" : "text-muted-foreground/40 line-through"}`}>
      {ok
        ? <Check size={12} className="text-gold flex-shrink-0 mt-0.5" />
        : <X size={12} className="flex-shrink-0 mt-0.5" />
      }
      <span>{label}</span>
    </div>
  )
}

function limit(n: number | null, unit: string) {
  return n === null ? `Ilimitado${unit ? " " + unit : ""}` : `Até ${n} ${unit}`
}

function buildFeatures(l: PlanLimits, entityType: PlanEntityType) {
  const rows: { ok: boolean; label: string }[] = []

  rows.push({ ok: true, label: limit(l.max_properties, "imóveis") })

  if (entityType === "construtora" || entityType === "imobiliaria") {
    rows.push({ ok: l.max_developments !== 0, label: l.max_developments === 0 ? "Sem lançamentos" : limit(l.max_developments, "lançamentos") })
  }
  if (entityType === "imobiliaria") {
    rows.push({ ok: true, label: limit(l.max_corretores, "corretores na equipe") })
  }

  rows.push({ ok: l.max_highlights > 0, label: l.max_highlights === 0 ? "Sem destaques" : `${l.max_highlights} destaque${l.max_highlights !== 1 ? "s" : ""} no portal` })
  rows.push({ ok: l.max_super_highlights > 0, label: l.max_super_highlights === 0 ? "Sem super destaques" : `${l.max_super_highlights} super destaque${l.max_super_highlights !== 1 ? "s" : ""} no portal` })

  if (entityType !== "corretor") {
    rows.push({ ok: (l.max_section_highlights ?? 0) > 0, label: "Destaque de seção no portal" })
  }

  rows.push({ ok: l.can_view_leads, label: "CRM de leads" })
  rows.push({ ok: l.can_view_market_data, label: "Inteligência de mercado" })

  return rows
}

function whatsappLink(planName: string) {
  const msg = encodeURIComponent(`Olá! Gostaria de solicitar upgrade para o plano *${planName}*.`)
  return `https://wa.me/${WHATSAPP}?text=${msg}`
}

interface Props {
  plans: PlanData[]
  entityType: PlanEntityType
}

export function UpgradeCards({ plans, entityType }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {plans.map(({ plan, name, prices, limits, isCurrent, isHighlighted }) => {
        const features = buildFeatures(limits, entityType)
        return (
          <div
            key={plan}
            className={`relative flex flex-col rounded-2xl border p-6 transition-all ${
              isCurrent
                ? "border-gold/50 bg-gold/5"
                : isHighlighted
                ? "border-gold/30 bg-card"
                : "border-border bg-card"
            }`}
          >
            {/* Badges */}
            <div className="flex items-center gap-2 mb-4 min-h-[20px]">
              {isCurrent && (
                <span className="text-[10px] uppercase tracking-[0.2em] font-sans px-2 py-0.5 rounded-full bg-gold/20 text-gold border border-gold/30">
                  Plano atual
                </span>
              )}
              {isHighlighted && !isCurrent && (
                <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.2em] font-sans px-2 py-0.5 rounded-full bg-amber-900/30 text-amber-400 border border-amber-700/30">
                  <Star size={9} /> Mais popular
                </span>
              )}
            </div>

            {/* Name + plan tier */}
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-sans mb-1">{plan}</p>
            <h2 className="font-serif text-xl font-bold text-foreground mb-4">{name}</h2>

            {/* Price */}
            <div className="mb-5">
              {prices.mensal === 0 ? (
                <p className="font-serif text-3xl font-bold text-gold">Grátis</p>
              ) : (
                <>
                  <div className="flex items-end gap-1">
                    <span className="text-muted-foreground/50 text-sm font-sans">R$</span>
                    <span className="font-serif text-3xl font-bold text-foreground">{fmt(prices.mensal)}</span>
                    <span className="text-muted-foreground/50 text-xs font-sans mb-1">/mês</span>
                  </div>
                  {prices.implantacao > 0 && (
                    <p className="text-muted-foreground/40 text-[11px] font-sans mt-0.5">
                      + R$ {fmt(prices.implantacao)} implantação
                    </p>
                  )}
                  {prices.landing_page_adicional && (
                    <p className="text-muted-foreground/40 text-[11px] font-sans">
                      Landing page adicional: R$ {fmt(prices.landing_page_adicional)}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-border mb-5" />

            {/* Features */}
            <div className="flex-1 space-y-2.5 mb-6">
              {features.map((f, i) => <Feature key={i} ok={f.ok} label={f.label} />)}
            </div>

            {/* CTA */}
            {isCurrent ? (
              <div className="py-2.5 text-center text-xs uppercase tracking-[0.15em] font-sans text-gold/50 border border-gold/20 rounded-lg">
                Plano ativo
              </div>
            ) : (
              <a
                href={whatsappLink(name)}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs uppercase tracking-[0.15em] font-sans transition-colors ${
                  isHighlighted
                    ? "bg-gold text-graphite hover:bg-gold-light"
                    : "border border-border text-muted-foreground hover:border-gold/40 hover:text-gold"
                }`}
              >
                <MessageCircle size={13} />
                Solicitar
              </a>
            )}
          </div>
        )
      })}
    </div>
  )
}
