"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, X, ChevronDown, Sparkles, Building2, Users, User, Zap, Shield, Send, Globe, BarChart2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { PLAN_PRICES, PLAN_FEATURES, getPlanName } from "@/lib/plans"
import type { PlanEntityType } from "@/lib/plans"
import type { OrgPlan } from "@/types/database"

// ── Types ────────────────────────────────────────────────────────────────────

type Tab = PlanEntityType
type BillingCycle = "mensal" | "anual"

const ANNUAL_DISCOUNT = 0.20

// ── Tab / Entity config ───────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "construtora", label: "Construtora", icon: Building2 },
  { id: "corretor",    label: "Corretor",    icon: User      },
  { id: "imobiliaria", label: "Imobiliária", icon: Users     },
]

const CONSTRUTORA_FEATURES: { icon: React.ElementType; title: string }[] = [
  { icon: Building2,  title: "Controle de estoque em tempo real"       },
  { icon: Shield,     title: "Anti-pelota: rastreie cada lead"          },
  { icon: Send,       title: "Anúncios automáticos e profissionais"     },
  { icon: Globe,      title: "Landing pages e minisites inclusos"       },
  { icon: Users,      title: "Rede de corretores e imobiliárias"        },
  { icon: BarChart2,  title: "Analytics e relatórios de vendas"         },
]

// ── Plan display config ───────────────────────────────────────────────────────

type PlanMeta = {
  key: OrgPlan
  color: string
  highlight: boolean
}

const PLANS: PlanMeta[] = [
  { key: "free",       color: "border-border",                highlight: false },
  { key: "starter",    color: "border-border",                highlight: false },
  { key: "pro",        color: "border-[var(--gold)]/60",      highlight: true  },
  { key: "enterprise", color: "border-[var(--gold)]/30",      highlight: false },
]

// ── FAQ data ─────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "Posso mudar de plano a qualquer momento?",
    a: "Sim. Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. Ao fazer upgrade, o valor proporcional ao período restante é creditado. Ao fazer downgrade, o novo valor passa a valer no próximo ciclo.",
  },
  {
    q: "Existe fidelidade ou multa de cancelamento?",
    a: "Não há fidelidade. O cancelamento pode ser feito a qualquer momento pelo painel. Planos mensais encerram ao fim do período pago; planos anuais encerram ao fim do ano contratado.",
  },
  {
    q: "O que é a taxa de implantação?",
    a: "A taxa de implantação cobre a configuração inicial da sua conta, importação do portfólio, personalização do minisite e treinamento da equipe. É cobrada uma única vez na ativação.",
  },
  {
    q: "Os imóveis da minha imobiliária são contados por corretor?",
    a: "Para imobiliárias, os limites de imóveis e destaques são por corretor. Assim, uma imobiliária no plano Pro com 10 corretores pode ter até 1.500 imóveis publicados.",
  },
  {
    q: "O plano Free tem custo?",
    a: "Para corretores, o plano Free é totalmente gratuito. Para imobiliárias e construtoras, existe uma taxa de implantação e mensalidade mesmo no plano Free, que cobre infraestrutura e suporte básico.",
  },
  {
    q: "Posso testar antes de comprar?",
    a: "Sim. Novos cadastros têm acesso a um período de avaliação de 14 dias com todas as funcionalidades do plano Pro, sem necessidade de cartão de crédito.",
  },
]

// ── Helper to format feature value ───────────────────────────────────────────

function fmtVal(v: boolean | number | null): React.ReactNode {
  if (v === null) return <span className="text-[var(--gold)] font-semibold text-xs">Ilimitado</span>
  if (v === true)  return <Check size={14} className="text-emerald-500 mx-auto" />
  if (v === false) return <X    size={14} className="text-muted-foreground/30 mx-auto" />
  return <span className="text-sm font-sans font-medium text-foreground">{v}</span>
}

// ── Main component ────────────────────────────────────────────────────────────

export function PlanosClient() {
  const [tab, setTab]         = useState<Tab>("construtora")
  const [billing, setBilling] = useState<BillingCycle>("mensal")
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const prices  = PLAN_PRICES[tab]
  const features = PLAN_FEATURES[tab]

  function getPrice(plan: OrgPlan): number {
    const base = prices[plan].mensal
    return billing === "anual" ? Math.round(base * (1 - ANNUAL_DISCOUNT)) : base
  }

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-6 py-12 lg:py-20">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div className="text-center mb-12 lg:mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--gold)]/30 bg-[var(--gold)]/5 mb-5">
          <Sparkles size={11} className="text-[var(--gold)]" />
          <span className="text-xs font-sans text-[var(--gold)] uppercase tracking-[0.2em]">Planos e Preços</span>
        </div>
        <h1 className="font-serif text-3xl lg:text-5xl font-bold text-foreground mb-4">
          Planos para construtoras
        </h1>
        <p className="text-muted-foreground font-sans text-base lg:text-lg max-w-xl mx-auto">
          Gerencie empreendimentos, controle estoque e venda mais com inteligência.
        </p>
      </div>

      {/* ── Entity tab selector ───────────────────────────────────────────── */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-1 p-1 rounded-xl bg-muted border border-border">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-sans transition-all",
                tab === id
                  ? "bg-card text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Billing toggle ────────────────────────────────────────────────── */}
      <div className="flex justify-center items-center gap-3 mb-10">
        <span className={cn("text-sm font-sans", billing === "mensal" ? "text-foreground" : "text-muted-foreground")}>
          Mensal
        </span>
        <button
          type="button"
          onClick={() => setBilling((b) => b === "mensal" ? "anual" : "mensal")}
          className={cn(
            "relative w-11 h-6 rounded-full transition-colors",
            billing === "anual" ? "bg-[var(--gold)]" : "bg-muted border border-border"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-card shadow-sm transition-transform",
              billing === "anual" && "translate-x-5"
            )}
          />
        </button>
        <span className={cn("text-sm font-sans flex items-center gap-2", billing === "anual" ? "text-foreground" : "text-muted-foreground")}>
          Anual
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-sans uppercase tracking-wider">
            -{ANNUAL_DISCOUNT * 100}%
          </span>
        </span>
      </div>

      {/* ── Plan cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        {PLANS.map(({ key, color, highlight }) => {
          const price = getPrice(key)
          const impl  = prices[key].implantacao
          const isEnterprise = key === "enterprise"
          const cta = key === "free"
            ? "Começar grátis"
            : key === "enterprise"
              ? "Falar com consultor"
              : `Escolher ${getPlanName(tab, key)}`

          return (
            <div
              key={key}
              className={cn(
                "relative flex flex-col rounded-2xl border p-6",
                highlight
                  ? "bg-gradient-to-b from-[var(--gold)]/8 to-card shadow-[0_4px_32px_rgba(201,169,110,0.15)]"
                  : "bg-card",
                color
              )}
            >
              {highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--gold)] text-[#0a0a0a] text-[10px] font-sans uppercase tracking-wider font-bold shadow">
                    <Sparkles size={8} /> Mais popular
                  </span>
                </div>
              )}

              <div className="mb-5">
                <p className="text-xs font-sans uppercase tracking-[0.2em] text-muted-foreground mb-1">
                  {getPlanName(tab, key)}
                </p>
                {isEnterprise ? (
                  <>
                    <p className="font-serif text-2xl font-bold text-foreground">Sob consulta</p>
                    <p className="text-xs text-muted-foreground font-sans mt-1">Plano personalizado</p>
                  </>
                ) : price === 0 ? (
                  <>
                    <p className="font-serif text-3xl font-bold text-foreground">Grátis</p>
                    <p className="text-xs text-muted-foreground font-sans mt-1">Para sempre</p>
                  </>
                ) : (
                  <>
                    <p className="font-serif text-3xl font-bold text-foreground">
                      R$ {price.toLocaleString("pt-BR")}
                      <span className="text-sm font-sans font-normal text-muted-foreground">/mês</span>
                    </p>
                    {billing === "anual" && (
                      <p className="text-xs text-muted-foreground font-sans mt-0.5">
                        cobrado anualmente
                      </p>
                    )}
                    {impl > 0 && (
                      <p className="text-xs text-muted-foreground font-sans mt-1">
                        + R$ {impl.toLocaleString("pt-BR")} implantação
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="mt-auto">
                {isEnterprise ? (
                  <a
                    href="https://wa.me/5521999999999?text=Ol%C3%A1%2C+gostaria+de+saber+mais+sobre+o+plano+Enterprise"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center py-2.5 rounded-xl border border-border text-sm font-sans text-foreground hover:border-[var(--gold)]/40 hover:text-[var(--gold)] transition-colors"
                  >
                    {cta}
                  </a>
                ) : (
                  <Link
                    href="/dashboard/upgrade"
                    className={cn(
                      "block w-full text-center py-2.5 rounded-xl text-sm font-sans transition-all",
                      highlight
                        ? "bg-[var(--gold)] text-[#0a0a0a] font-semibold hover:bg-[var(--gold-light)] shadow"
                        : "border border-border text-foreground hover:border-[var(--gold)]/40 hover:text-[var(--gold)]"
                    )}
                  >
                    {cta}
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Feature comparison table ───────────────────────────────────────── */}
      <div className="mb-16">
        <h2 className="font-serif text-2xl lg:text-3xl font-bold text-foreground mb-2 text-center">
          Comparativo completo
        </h2>
        <p className="text-muted-foreground font-sans text-sm text-center mb-8">
          Todos os recursos detalhados por plano
        </p>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-5 bg-muted/50 border-b border-border px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-sans font-medium">
              Recurso
            </div>
            {PLANS.map(({ key, highlight }) => (
              <div key={key} className={cn("text-center text-xs uppercase tracking-wider font-sans font-medium", highlight ? "text-[var(--gold)]" : "text-muted-foreground")}>
                {getPlanName(tab, key)}
              </div>
            ))}
          </div>

          {/* Rows */}
          {features.map((row, i) => (
            <div
              key={row.label}
              className={cn(
                "grid grid-cols-5 items-center px-4 py-3 border-b border-border/50 last:border-0",
                i % 2 === 1 && "bg-muted/20"
              )}
            >
              <span className="text-sm font-sans text-foreground/80 pr-4">{row.label}</span>
              {row.values.map((v, vi) => (
                <div key={vi} className="text-center">
                  {fmtVal(v)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Por que construtoras escolhem Base Imob ────────────────────────── */}
      {tab === "construtora" && (
        <div className="mb-16">
          <h2 className="font-serif text-2xl lg:text-3xl font-bold text-foreground mb-2 text-center">
            Por que construtoras escolhem Base Imob
          </h2>
          <p className="text-muted-foreground font-sans text-sm text-center mb-10">
            Tudo que você precisa para vender mais, em um só lugar.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CONSTRUTORA_FEATURES.map(({ icon: Icon, title }) => (
              <div
                key={title}
                className="bg-card border border-border rounded-2xl p-5 flex items-start gap-4 shadow-sm hover:border-[var(--gold)]/30 transition-colors"
              >
                <div className="p-2 rounded-xl bg-[var(--gold)]/10 border border-[var(--gold)]/15 shrink-0">
                  <Icon size={16} className="text-[var(--gold)]" />
                </div>
                <p className="text-sm font-sans font-medium text-foreground leading-snug">{title}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto">
        <h2 className="font-serif text-2xl lg:text-3xl font-bold text-foreground mb-8 text-center">
          Perguntas frequentes
        </h2>

        <div className="flex flex-col gap-2">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-card overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm font-sans font-medium text-foreground pr-4">{faq.q}</span>
                <ChevronDown
                  size={15}
                  className={cn(
                    "flex-shrink-0 text-muted-foreground transition-transform duration-200",
                    openFaq === i && "rotate-180"
                  )}
                />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-sm font-sans text-muted-foreground leading-relaxed border-t border-border pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA strip */}
        <div className="mt-12 rounded-2xl border border-[var(--gold)]/30 bg-gradient-to-br from-[var(--gold)]/8 to-card p-8 text-center">
          <Zap size={24} className="text-[var(--gold)] mx-auto mb-3" />
          <h3 className="font-serif text-xl font-bold text-foreground mb-2">
            Pronto para começar?
          </h3>
          <p className="text-sm text-muted-foreground font-sans mb-5">
            Crie sua conta gratuitamente e comece a publicar seus imóveis hoje.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/dashboard/upgrade"
              className="px-6 py-2.5 rounded-xl bg-[var(--gold)] text-[#0a0a0a] font-sans font-semibold text-sm hover:bg-[var(--gold-light)] transition-colors shadow"
            >
              Criar conta grátis
            </Link>
            <a
              href="https://wa.me/5521999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 rounded-xl border border-border text-foreground font-sans text-sm hover:border-[var(--gold)]/40 hover:text-[var(--gold)] transition-colors"
            >
              Falar com consultor
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
