import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { FinanceiroClient } from "@/components/dashboard/FinanceiroClient"
import { DollarSign } from "lucide-react"
import type { OrgPlan, OrgType, PaymentRecord } from "@/types/database"
import { PLAN_PRICES, getPlanName, resolveEntityType } from "@/lib/plans"

export default async function FinanceiroPage() {
  await requireAuth(["admin"])
  const admin = createAdminClient()

  const [{ data: rawPayments }, { data: orgs }, { data: profiles }] = await Promise.all([
    admin
      .from("payment_records")
      .select("*, organization:organizations(id, name, type, plan), profile:profiles(id, full_name, role)")
      .order("due_date", { ascending: true, nullsFirst: false }),
    admin
      .from("organizations")
      .select("id, name, type, plan, subscription_status, payment_due_date")
      .order("name"),
    admin
      .from("profiles")
      .select("id, full_name, role, plan, organization_id")
      .eq("role", "corretor")
      .is("organization_id", null),
  ])

  const payments = (rawPayments ?? []) as PaymentRecord[]

  // Calculate MRR from active orgs + corretores
  let mrr = 0
  for (const org of orgs ?? []) {
    if (org.subscription_status === "active" || org.subscription_status === "trial") {
      const entityType = resolveEntityType(org.type === "construtora" ? "construtora" : "imobiliaria", org.type as OrgType)
      const prices = PLAN_PRICES[entityType][(org.plan as OrgPlan) ?? "free"]
      mrr += prices.mensal
    }
  }
  for (const p of profiles ?? []) {
    if (p.plan && p.plan !== "free") {
      const prices = PLAN_PRICES.corretor[(p.plan as OrgPlan)]
      mrr += prices.mensal
    }
  }

  const pending = payments.filter((p) => p.status === "pendente")
  const overdue = pending.filter((p) => p.due_date && new Date(p.due_date) < new Date())
  const paidThisMonth = payments.filter((p) => {
    if (p.status !== "pago" || !p.paid_at) return false
    const d = new Date(p.paid_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const receivedThisMonth = paidThisMonth.reduce((s, p) => s + Number(p.amount), 0)

  const orgOptions = (orgs ?? []).map((o) => ({ id: o.id, name: o.name, type: o.type as OrgType, plan: o.plan as OrgPlan }))
  const profileOptions = (profiles ?? []).map((p) => ({ id: p.id, name: p.full_name ?? "—", role: p.role, plan: p.plan as OrgPlan }))

  return (
    <div className="px-4 py-6 lg:p-8 max-w-6xl">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <DollarSign size={18} className="text-gold" />
          <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans">Administração</p>
        </div>
        <h1 className="font-serif text-4xl font-bold text-white">
          <AnimatedGradientText className="font-serif text-4xl font-bold">Financeiro</AnimatedGradientText>
        </h1>
        <p className="text-muted-foreground font-sans text-sm mt-2 max-w-xl">
          Gestão de cobranças, pagamentos e receita recorrente.
        </p>
        <div className="divider-gold mt-4 w-20" />
      </div>

      <FinanceiroClient
        payments={payments}
        mrr={mrr}
        overdueCount={overdue.length}
        receivedThisMonth={receivedThisMonth}
        orgOptions={orgOptions}
        profileOptions={profileOptions}
      />
    </div>
  )
}
