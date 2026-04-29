import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { createAdminClient } from "@/lib/supabase/admin"
import { getTagInfo } from "@/lib/tag-icons"
import {
  ArrowLeft,
  BedDouble,
  Car,
  Maximize2,
  Building2,
  MapPin,
  Check,
  X,
} from "lucide-react"
import type { Property, PropertyFeatures } from "@/types/database"

export const metadata: Metadata = {
  title: "Comparar Imóveis",
  description: "Compare imóveis lado a lado para tomar a melhor decisão.",
}

export const dynamic = "force-dynamic"

function formatPrice(price: number) {
  if (price >= 1_000_000)
    return "R$ " + (price / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + " Mi"
  return "R$ " + price.toLocaleString("pt-BR")
}

const STATUS_LABEL: Record<string, string> = {
  disponivel: "Disponível",
  reserva: "Em Negociação",
  vendido: "Vendido",
}
const STATUS_COLOR: Record<string, string> = {
  disponivel: "text-emerald-700 bg-emerald-50 border-emerald-300",
  reserva: "text-amber-700 bg-amber-50 border-amber-300",
  vendido: "text-zinc-500 bg-zinc-100 border-zinc-300",
}

interface PageProps {
  searchParams: Promise<{ ids?: string }>
}

type CompareRow = {
  label: string
  getValue: (p: Property) => string | number | null
  isTag?: boolean
}

const ROWS: CompareRow[] = [
  { label: "Preço",        getValue: (p) => formatPrice(p.price) },
  { label: "Status",       getValue: (p) => STATUS_LABEL[p.status] ?? p.status },
  { label: "Bairro",       getValue: (p) => p.neighborhood },
  { label: "Cidade",       getValue: (p) => p.city },
  { label: "Endereço",     getValue: (p) => p.address },
  { label: "Área (m²)",    getValue: (p) => (p.features as PropertyFeatures).area_m2 ?? null },
  { label: "Suítes",       getValue: (p) => (p.features as PropertyFeatures).suites ?? null },
  { label: "Quartos",      getValue: (p) => (p.features as PropertyFeatures).quartos ?? null },
  { label: "Banheiros",    getValue: (p) => (p.features as PropertyFeatures).banheiros ?? null },
  { label: "Vagas",        getValue: (p) => (p.features as PropertyFeatures).vagas ?? null },
  { label: "Andar",        getValue: (p) => (p.features as PropertyFeatures).andar ?? null },
  { label: "Tipo",         getValue: (p) => p.tipo_negocio === "venda" ? "Venda" : p.tipo_negocio === "aluguel" ? "Aluguel" : (p.tipo_negocio ?? null) },
]

export default async function CompararPage({ searchParams }: PageProps) {
  const { ids } = await searchParams
  const idList = (ids ?? "").split(",").filter(Boolean).slice(0, 3)

  let properties: Property[] = []
  if (idList.length > 0) {
    const admin = createAdminClient()
    const { data } = await admin
      .from("properties")
      .select("*")
      .in("id", idList)
      .eq("visibility", "publico")
    properties = (data ?? []) as Property[]
    // preserve original order from URL
    properties.sort((a, b) => idList.indexOf(a.id) - idList.indexOf(b.id))
  }

  // Collect all unique tags across selected properties
  const allTags = Array.from(new Set(properties.flatMap((p) => p.tags ?? [])))

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-6 py-8 lg:py-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-sans text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={15} /> Voltar
        </Link>
        <div>
          <h1 className="font-serif text-2xl lg:text-3xl font-bold text-foreground">
            Comparar Imóveis
          </h1>
          {properties.length > 0 && (
            <p className="text-sm text-muted-foreground font-sans mt-0.5">
              {properties.length} imóvel{properties.length !== 1 ? "is" : ""} selecionado{properties.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      {/* Empty state */}
      {properties.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <Maximize2 size={24} className="text-muted-foreground/40" />
          </div>
          <p className="font-serif text-xl text-foreground">Nenhum imóvel selecionado</p>
          <p className="text-sm text-muted-foreground font-sans text-center max-w-sm">
            Use o botão de comparação nos cards de imóveis para selecionar até 3 propriedades e compará-las aqui.
          </p>
          <Link
            href="/"
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--gold)]/40 text-[var(--gold)] text-sm font-sans hover:bg-[var(--gold)]/5 transition-colors"
          >
            Explorar imóveis
          </Link>
        </div>
      )}

      {/* Comparison table */}
      {properties.length > 0 && (
        <div className="overflow-x-auto">
          <div
            className="grid gap-4 mb-8"
            style={{ gridTemplateColumns: `180px repeat(${properties.length}, 1fr)` }}
          >
            {/* Empty header cell */}
            <div />

            {/* Property cards header */}
            {properties.map((p) => {
              const thumb = p.images?.[0] ?? null
              return (
                <div key={p.id} className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col">
                  <div className="relative aspect-[4/3] w-full bg-muted">
                    {thumb ? (
                      <Image src={thumb} alt={p.title} fill className="object-cover" sizes="300px" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Maximize2 size={24} className="text-muted-foreground/30" />
                      </div>
                    )}
                    <span className={`absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-sans ${STATUS_COLOR[p.status] ?? ""}`}>
                      {STATUS_LABEL[p.status] ?? p.status}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col gap-1">
                    <p className="font-serif text-base font-semibold text-foreground line-clamp-2 leading-snug">
                      {p.title}
                    </p>
                    {(p.neighborhood || p.city) && (
                      <p className="flex items-center gap-1 text-xs text-muted-foreground font-sans">
                        <MapPin size={11} className="shrink-0" />
                        {[p.neighborhood, p.city].filter(Boolean).join(", ")}
                      </p>
                    )}
                    <p className="font-serif text-lg font-bold text-foreground mt-auto pt-2">
                      {formatPrice(p.price)}
                    </p>
                    <Link
                      href={`/imovel/${p.slug}`}
                      className="mt-2 text-center text-xs font-sans py-1.5 rounded-lg border border-[var(--gold)]/40 text-[var(--gold)] hover:bg-[var(--gold)]/5 transition-colors"
                    >
                      Ver imóvel
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Rows */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {ROWS.map((row, ri) => {
              const values = properties.map((p) => row.getValue(p))
              const hasAny = values.some((v) => v !== null && v !== undefined && v !== "")
              if (!hasAny) return null

              // Highlight best price (lowest) or best area (highest)
              const highlights: boolean[] = values.map(() => false)
              if (row.label === "Preço") {
                const nums = properties.map((p) => p.price)
                const minVal = Math.min(...nums)
                nums.forEach((n, i) => { if (n === minVal) highlights[i] = true })
              }
              if (row.label === "Área (m²)") {
                const nums = properties.map((p) => (p.features as PropertyFeatures).area_m2 ?? 0)
                const maxVal = Math.max(...nums)
                nums.forEach((n, i) => { if (n > 0 && n === maxVal) highlights[i] = true })
              }

              return (
                <div
                  key={row.label}
                  className={`grid gap-4 items-center px-4 py-3 ${ri % 2 === 0 ? "" : "bg-muted/30"}`}
                  style={{ gridTemplateColumns: `180px repeat(${properties.length}, 1fr)` }}
                >
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-sans font-medium">
                    {row.label}
                  </span>
                  {values.map((v, i) => (
                    <span
                      key={i}
                      className={`text-sm font-sans ${highlights[i] ? "text-[var(--gold)] font-semibold" : "text-foreground"} ${!v ? "text-muted-foreground/40" : ""}`}
                    >
                      {v ?? "—"}
                      {highlights[i] && row.label === "Preço" && (
                        <span className="ml-1 text-[10px] text-[var(--gold)]/70">(menor)</span>
                      )}
                      {highlights[i] && row.label === "Área (m²)" && (
                        <span className="ml-1 text-[10px] text-[var(--gold)]/70">(maior)</span>
                      )}
                    </span>
                  ))}
                </div>
              )
            })}

            {/* Tags / Diferenciais */}
            {allTags.length > 0 && (
              <>
                <div
                  className="grid gap-4 items-center px-4 py-3 bg-muted/50"
                  style={{ gridTemplateColumns: `180px repeat(${properties.length}, 1fr)` }}
                >
                  <span className="text-xs uppercase tracking-wider text-muted-foreground font-sans font-medium col-span-full">
                    Diferenciais
                  </span>
                </div>
                {allTags.map((tag, ri) => {
                  const info = getTagInfo(tag)
                  const Icon = info.icon
                  return (
                    <div
                      key={tag}
                      className={`grid gap-4 items-center px-4 py-2.5 ${ri % 2 === 0 ? "" : "bg-muted/30"}`}
                      style={{ gridTemplateColumns: `180px repeat(${properties.length}, 1fr)` }}
                    >
                      <span className="flex items-center gap-1.5 text-xs font-sans text-muted-foreground">
                        <Icon size={11} className="text-[var(--gold)] shrink-0" />
                        {info.label}
                      </span>
                      {properties.map((p) => (
                        <span key={p.id} className="flex items-center">
                          {(p.tags ?? []).includes(tag) ? (
                            <Check size={14} className="text-emerald-500" />
                          ) : (
                            <X size={14} className="text-muted-foreground/30" />
                          )}
                        </span>
                      ))}
                    </div>
                  )
                })}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
