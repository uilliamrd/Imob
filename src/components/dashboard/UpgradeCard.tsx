import { Sparkles } from "lucide-react"
import Link from "next/link"

interface Props {
  currentPlan: string
  nextPlan: string
  features: string[]
  upgradeHref?: string
}

export function UpgradeCard({ nextPlan, features, upgradeHref = "/dashboard/upgrade" }: Props) {
  return (
    <div className="rounded-2xl border border-[var(--gold)]/30 bg-gradient-to-br from-[var(--gold)]/10 to-[var(--gold)]/5 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={14} className="text-[var(--gold)] shrink-0" />
        <p className="text-xs font-semibold text-foreground leading-tight font-sans">
          Desbloqueie mais com o plano <span className="text-[var(--gold)]">{nextPlan}</span>
        </p>
      </div>
      <ul className="space-y-1.5 mb-4">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-sans">
            <Sparkles size={10} className="text-[var(--gold)]/60 shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <Link
        href={upgradeHref}
        className="flex items-center justify-center w-full px-3 py-2 rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-dark)] text-[#0F0F0F] text-xs font-medium font-sans hover:opacity-90 transition-opacity"
      >
        Ver planos
      </Link>
    </div>
  )
}
