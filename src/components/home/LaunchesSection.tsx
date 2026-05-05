import Link from "next/link"
import { PropertyCard } from "@/components/ui/premium/PropertyCard"
import type { PortalProperty } from "@/types/portal"

interface Props {
  properties: PortalProperty[]
}

function isLaunch(p: PortalProperty) {
  const tags: string[] = Array.isArray(p.tags) ? (p.tags as string[]) : []
  const tipoNeg = (p.tipo_negocio ?? "").toLowerCase()
  return (
    tags.some((t) => t.toLowerCase().includes("lançamento") || t.toLowerCase().includes("lancamento")) ||
    tipoNeg.includes("lançamento") ||
    tipoNeg.includes("lancamento")
  )
}

export function LaunchesSection({ properties }: Props) {
  const launches = properties.filter(isLaunch).slice(0, 6)
  if (!launches.length) return null

  const [hero, ...rest] = launches

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--gold)] font-sans mb-1">Novidades</p>
          <h2 className="font-serif text-2xl font-semibold text-foreground">Lançamentos</h2>
        </div>
        <Link href="/?tab=lancamentos" className="text-sm font-medium text-muted-foreground hover:text-[var(--gold)] transition-colors">
          Ver todos →
        </Link>
      </div>

      {/* Desktop: first card is wider */}
      <div className="hidden sm:grid sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <PropertyCard
            id={hero.id}
            slug={hero.slug}
            title={hero.title}
            price={hero.price}
            neighborhood={hero.neighborhood}
            city={hero.city}
            images={hero.images ?? []}
            quartos={(hero.features as Record<string, unknown> | null)?.quartos as number | undefined}
            vagas={(hero.features as Record<string, unknown> | null)?.vagas as number | undefined}
            area_m2={(hero.features as Record<string, unknown> | null)?.area_m2 as number | undefined}
            categoria={hero.categoria}
            badge={{ label: "Lançamento", variant: "gold" }}
          />
        </div>
        {rest.slice(0, 1).map((p) => (
          <PropertyCard
            key={p.id}
            id={p.id}
            slug={p.slug}
            title={p.title}
            price={p.price}
            neighborhood={p.neighborhood}
            city={p.city}
            images={p.images ?? []}
            quartos={(p.features as Record<string, unknown> | null)?.quartos as number | undefined}
            vagas={(p.features as Record<string, unknown> | null)?.vagas as number | undefined}
            area_m2={(p.features as Record<string, unknown> | null)?.area_m2 as number | undefined}
            categoria={p.categoria}
            badge={{ label: "Lançamento", variant: "gold" }}
          />
        ))}
      </div>

      {/* Mobile: horizontal scroll */}
      <div className="sm:hidden flex gap-3 overflow-x-auto scrollbar-none pb-1 snap-x snap-mandatory">
        {launches.map((p) => (
          <div key={p.id} className="shrink-0 w-72 snap-start">
            <PropertyCard
              id={p.id}
              slug={p.slug}
              title={p.title}
              price={p.price}
              neighborhood={p.neighborhood}
              city={p.city}
              images={p.images ?? []}
              quartos={(p.features as Record<string, unknown> | null)?.quartos as number | undefined}
              categoria={p.categoria}
              badge={{ label: "Lançamento", variant: "gold" }}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
