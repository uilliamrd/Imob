"use client"

import { Crown } from "lucide-react"
import { getPlanName, resolveEntityType } from "@/lib/plans"
import type { OrgPlan, OrgType, UserRole } from "@/types/database"

interface PlanBadgeProps {
  role: UserRole
  plan: OrgPlan
  orgType?: OrgType | null
}

const PLAN_COLORS: Record<OrgPlan, string> = {
  free:       "text-muted-foreground border-border",
  starter:    "text-sky-400 border-sky-700/40",
  pro:        "text-gold border-gold/40",
  enterprise: "text-purple-400 border-purple-600/40",
}

export function PlanBadge({ role, plan, orgType }: PlanBadgeProps) {
  if (role === "admin") return null

  const entityType = resolveEntityType(role, orgType)
  const name = getPlanName(entityType, plan)

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-sans uppercase tracking-[0.12em] w-fit ${PLAN_COLORS[plan]}`}>
      <Crown size={10} />
      {name}
    </div>
  )
}
