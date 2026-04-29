import Image from "next/image"
import Link from "next/link"
import { BadgeCheck, Building } from "lucide-react"
import type { PortalOrg } from "@/app/(portal)/page"

interface Props {
  org: PortalOrg
}

export function AgencyCard({ org }: Props) {
  return (
    <Link
      href={`/imobiliaria/${org.slug}`}
      className="group flex items-center gap-3 bg-card border border-border rounded-xl p-3 hover:border-[var(--gold)]/30 hover:shadow-md transition-all duration-200 min-w-[220px]"
    >
      <div className="relative h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-muted">
        {org.logo ? (
          <Image src={org.logo} alt={org.name} fill sizes="56px" className="object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Building size={20} strokeWidth={1.5} className="text-muted-foreground/40" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="font-medium text-sm text-foreground truncate">{org.name}</p>
          <BadgeCheck size={13} className="shrink-0 text-[var(--gold)]" />
        </div>
        {org.hero_tagline && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{org.hero_tagline}</p>
        )}
        {org.availableCount > 0 && (
          <p className="text-xs text-[var(--forest)] mt-1 font-medium">
            {org.availableCount} imóveis
          </p>
        )}
      </div>
    </Link>
  )
}
