import Image from "next/image"
import Link from "next/link"
import { Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PortalOrg } from "@/app/(portal)/page"

interface Props {
  org: PortalOrg
  featured?: boolean
}

export function BuilderCard({ org }: Props) {
  return (
    <Link
      href={`/construtora/${org.slug}`}
      className={cn(
        "block relative overflow-hidden rounded-xl bg-card border border-border transition-all duration-300",
        "hover:border-[var(--gold)]/30 hover:shadow-lg hover:-translate-y-0.5",
        "aspect-[4/3] w-full"
      )}
    >
      {org.logo ? (
        <Image
          src={org.logo}
          alt={org.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--gold)]/5">
          <Building2 size={40} strokeWidth={1} className="text-[var(--gold)]/30" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <p className="font-serif font-semibold text-white leading-snug line-clamp-1">{org.name}</p>
        {org.hero_tagline && (
          <p className="text-xs text-white/70 mt-0.5 line-clamp-1">{org.hero_tagline}</p>
        )}
        {org.availableCount > 0 && (
          <p className="text-xs text-[var(--gold)] mt-1">
            {org.availableCount} unidade{org.availableCount !== 1 ? "s" : ""} disponível
          </p>
        )}
      </div>
    </Link>
  )
}
