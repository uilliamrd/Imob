import { getPlanLimits, getPlanName, resolveEntityType } from "@/lib/plans"
import type { OrgPlan, OrgType, UserRole } from "@/types/database"
import { Sparkles, Zap } from "lucide-react"
import Link from "next/link"

interface PlanUsageProps {
  role: UserRole
  plan: OrgPlan
  orgType?: OrgType | null
  counts: {
    properties: number
    developments: number
    corretores: number
  }
}

function UsageBar({ label, used, max }: { label: string; used: number; max: number | null }) {
  if (max === null) return null
  const pct        = Math.min((used / max) * 100, 100)
  const isWarning  = pct >= 80
  const isFull     = pct >= 100

  const barColor =
    isFull     ? "bg-amber-500"            :
    isWarning  ? "bg-amber-400"            :
                 "bg-gold"

  const textColor =
    isFull     ? "text-amber-500"          :
    isWarning  ? "text-amber-400"          :
                 "text-foreground/60"

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[11px] font-sans text-muted-foreground">{label}</span>
        <span className={`text-[11px] font-sans font-medium tabular-nums ${textColor}`}>
          {used}<span className="text-muted-foreground/40">/{max}</span>
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export function PlanUsage({ role, plan, orgType, counts }: PlanUsageProps) {
  if (role === "admin") return null

  const entityType    = resolveEntityType(role, orgType)
  const limits        = getPlanLimits(entityType, plan)
  const planName      = getPlanName(entityType, plan)

  const hasAnyLimit =
    limits.max_properties  !== null ||
    limits.max_developments !== null ||
    limits.max_corretores   !== null

  if (!hasAnyLimit) return null

  const isAtLimit =
    (limits.max_properties  !== null && counts.properties  >= limits.max_properties) ||
    (limits.max_developments !== null && counts.developments >= limits.max_developments) ||
    (limits.max_corretores  !== null && counts.corretores  >= limits.max_corretores)

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={13} className="text-gold" />
          <p className="text-[11px] uppercase tracking-[0.15em] font-sans text-muted-foreground">Uso do plano</p>
        </div>
        <span className="text-[10px] font-sans text-gold/70 uppercase tracking-[0.12em] bg-gold/10 px-2 py-0.5 rounded-lg">
          {planName}
        </span>
      </div>

      <div className="space-y-3.5">
        <UsageBar label="Imóveis" used={counts.properties} max={limits.max_properties} />
        {(entityType === "construtora" || entityType === "imobiliaria") && (
          <UsageBar label="Lançamentos" used={counts.developments} max={limits.max_developments} />
        )}
        {entityType === "imobiliaria" && (
          <UsageBar label="Equipe" used={counts.corretores} max={limits.max_corretores} />
        )}
      </div>

      {isAtLimit && (
        <Link
          href="/dashboard/upgrade"
          className="mt-5 flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r from-gold/20 to-gold/10 border border-gold/30 text-gold hover:from-gold hover:to-gold-light hover:text-[#0F0F0F] transition-all duration-300 text-[11px] uppercase tracking-[0.15em] font-sans rounded-xl"
        >
          <Zap size={11} /> Fazer upgrade
        </Link>
      )}
    </div>
  )
}
