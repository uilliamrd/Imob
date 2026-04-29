import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { requireAuth } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import {
  BedDouble, Car, Maximize2, Bath, MapPin, Phone, Lock,
  ExternalLink, Calendar,
} from "lucide-react"
import {
  BackButton,
  PropertyNotesEditor,
  PropertySharePanel,
  PropertyInfoCard,
} from "@/components/dashboard/ImovelDetailClient"
import type { PropertyFeatures } from "@/types/database"

interface PageProps {
  params: Promise<{ id: string }>
}

function formatPrice(p: number): string {
  if (p >= 1_000_000) return `R$ ${(p / 1_000_000).toFixed(p % 1_000_000 === 0 ? 0 : 1)} mi`
  if (p >= 1_000) return `R$ ${(p / 1_000).toFixed(0)} mil`
  return p.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

export default async function ImovelDetalhePage({ params }: PageProps) {
  const { id } = await params
  await requireAuth(["admin", "imobiliaria", "corretor", "construtora", "secretaria"])

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const admin = createAdminClient()

  const [{ data: property }, { data: noteRow }] = await Promise.all([
    admin
      .from("properties")
      .select(`
        id, code, title, description, price, features, tags, status, visibility,
        created_by, org_id, development_id, images, video_url, address, neighborhood,
        city, cep, categoria, tipo_negocio, slug, created_at, updated_at,
        organization:organizations(id, name, slug, logo, brand_colors)
      `)
      .eq("id", id)
      .single(),
    supabase
      .from("property_notes")
      .select("note")
      .eq("property_id", id)
      .eq("user_id", user.id)
      .maybeSingle(),
  ])

  if (!property) notFound()

  const feat = property.features as PropertyFeatures | null
  const images = (property.images as string[]) ?? []
  const tags = (property.tags as string[]) ?? []
  const org = Array.isArray(property.organization)
    ? (property.organization[0] ?? null)
    : (property.organization as { id: string; name: string; slug: string | null; logo: string | null; brand_colors: { primary?: string } | null } | null)

  const trackedPath = `/imovel/${property.slug}?ref=${user.id}`
  const initialNote = noteRow?.note ?? ""

  const TIPO_LABEL: Record<string, string> = {
    venda: "Venda",
    aluguel: "Aluguel",
    temporada: "Temporada",
    permuta: "Permuta",
  }

  const STATUS_LABEL: Record<string, { label: string; className: string }> = {
    disponivel: { label: "Disponível", className: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30" },
    reserva: { label: "Reserva", className: "text-amber-600 bg-amber-500/10 border-amber-500/30" },
    vendido: { label: "Vendido", className: "text-muted-foreground bg-muted border-border" },
  }
  const statusInfo = STATUS_LABEL[property.status] ?? STATUS_LABEL.vendido

  return (
    <div className="px-6 py-8 lg:px-8 max-w-6xl mx-auto">

      {/* Back */}
      <BackButton />

      {/* ── Galeria ─────────────────────────────────────────────────────────── */}
      {images.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-2 rounded-2xl overflow-hidden h-[380px] mb-8">
          <div className="relative">
            <Image
              src={images[0]}
              alt={property.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 66vw"
            />
          </div>
          {images.length > 1 && (
            <div className="hidden lg:grid grid-rows-2 gap-2">
              {images.slice(1, 3).map((img, i) => (
                <div key={i} className="relative overflow-hidden">
                  <Image
                    src={img}
                    alt={`${property.title} ${i + 2}`}
                    fill
                    className="object-cover"
                    sizes="33vw"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="h-56 bg-muted rounded-2xl flex items-center justify-center mb-8">
          <span className="text-muted-foreground text-sm font-sans">Sem fotos cadastradas</span>
        </div>
      )}

      {/* ── Dois painéis ────────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-[65%_35%] gap-8 items-start">

        {/* ── ESQUERDA ──────────────────────────────────────────────────────── */}
        <div className="space-y-6">

          {/* Título + badges + preço */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {property.tipo_negocio && (
                <span className="text-[10px] uppercase tracking-wider font-sans px-2 py-0.5 rounded-full border border-[var(--forest)]/40 text-[var(--forest)] bg-[var(--forest)]/8">
                  {TIPO_LABEL[property.tipo_negocio] ?? property.tipo_negocio}
                </span>
              )}
              <span className={`text-[10px] uppercase tracking-wider font-sans px-2 py-0.5 rounded-full border ${statusInfo.className}`}>
                {statusInfo.label}
              </span>
              {property.categoria && (
                <span className="text-[10px] uppercase tracking-wider font-sans px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                  {property.categoria}
                </span>
              )}
            </div>
            <h1 className="font-serif text-2xl font-bold text-foreground leading-snug">
              {property.title}
            </h1>
            {(property.neighborhood || property.city) && (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground font-sans mt-1.5">
                <MapPin size={14} />
                {[property.neighborhood, property.city].filter(Boolean).join(", ")}
              </p>
            )}
            <p className="font-serif text-3xl font-bold text-[var(--gold)] mt-3">
              {formatPrice(property.price)}
            </p>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-[var(--gold)]/30 via-[var(--gold)]/10 to-transparent" />

          {/* Características */}
          {(feat?.suites != null || feat?.dormitorios != null || feat?.quartos != null ||
            feat?.banheiros != null || feat?.vagas != null || feat?.area_m2 != null) && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {(feat.suites ?? feat.dormitorios ?? feat.quartos) != null && (
                <div className="flex flex-col items-center gap-1.5 p-3 bg-muted/40 rounded-xl">
                  <BedDouble size={18} className="text-[var(--gold)]/70" />
                  <span className="text-lg font-serif font-bold text-foreground">
                    {feat.suites ?? feat.dormitorios ?? feat.quartos}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-sans">
                    {feat.suites ? "Suítes" : "Quartos"}
                  </span>
                </div>
              )}
              {feat.banheiros != null && (
                <div className="flex flex-col items-center gap-1.5 p-3 bg-muted/40 rounded-xl">
                  <Bath size={18} className="text-[var(--gold)]/70" />
                  <span className="text-lg font-serif font-bold text-foreground">{feat.banheiros}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-sans">Banheiros</span>
                </div>
              )}
              {feat.vagas != null && (
                <div className="flex flex-col items-center gap-1.5 p-3 bg-muted/40 rounded-xl">
                  <Car size={18} className="text-[var(--gold)]/70" />
                  <span className="text-lg font-serif font-bold text-foreground">{feat.vagas}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-sans">Vagas</span>
                </div>
              )}
              {feat.area_m2 != null && (
                <div className="flex flex-col items-center gap-1.5 p-3 bg-muted/40 rounded-xl">
                  <Maximize2 size={18} className="text-[var(--gold)]/70" />
                  <span className="text-lg font-serif font-bold text-foreground">{feat.area_m2}</span>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-sans">m²</span>
                </div>
              )}
            </div>
          )}

          {/* Descrição */}
          {property.description && (
            <>
              <div className="h-px bg-gradient-to-r from-[var(--gold)]/30 via-[var(--gold)]/10 to-transparent" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-sans mb-3">Descrição</p>
                <p className="text-sm font-sans text-foreground/80 leading-relaxed whitespace-pre-line">
                  {property.description}
                </p>
              </div>
            </>
          )}

          {/* Tags / Diferenciais */}
          {tags.length > 0 && (
            <>
              <div className="h-px bg-gradient-to-r from-[var(--gold)]/30 via-[var(--gold)]/10 to-transparent" />
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-sans mb-3">Diferenciais</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 text-xs font-sans rounded-full border border-border bg-muted/40 text-foreground/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Proprietário — exclusivo dashboard */}
          {(feat?.nome_proprietario || feat?.contato_proprietario) && (
            <>
              <div className="h-px bg-gradient-to-r from-[var(--gold)]/30 via-[var(--gold)]/10 to-transparent" />
              <div className="bg-muted/50 rounded-xl p-4 border border-border">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-sans mb-3">Proprietário</p>
                <div className="space-y-2">
                  {feat.nome_proprietario && (
                    <p className="text-sm font-sans font-medium text-foreground">{feat.nome_proprietario}</p>
                  )}
                  {feat.contato_proprietario && (
                    <a
                      href={`tel:${feat.contato_proprietario.replace(/\D/g, "")}`}
                      className="flex items-center gap-2 text-sm font-sans text-[var(--forest)] hover:underline"
                    >
                      <Phone size={13} />
                      {feat.contato_proprietario}
                    </a>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-border/40">
                  <Lock size={11} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-sans">Dados visíveis apenas para você</span>
                </div>
              </div>
            </>
          )}

          {/* Anotações privadas */}
          <>
            <div className="h-px bg-gradient-to-r from-[var(--gold)]/30 via-[var(--gold)]/10 to-transparent" />
            <PropertyNotesEditor propertyId={id} initialNote={initialNote} />
          </>

          {/* Link para LP pública */}
          {property.visibility === "publico" && (
            <Link
              href={`/imovel/${property.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-sans text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink size={13} />
              Ver página pública do imóvel
            </Link>
          )}
        </div>

        {/* ── DIREITA (sticky) ────────────────────────────────────────────── */}
        <div className="space-y-4 lg:sticky lg:top-24 self-start">
          <PropertySharePanel
            trackedPath={trackedPath}
            propertyTitle={property.title}
            propertyCity={property.city}
            propertyPrice={property.price}
          />
          <PropertyInfoCard
            code={property.code}
            createdAt={property.created_at}
            updatedAt={property.updated_at}
            orgName={org?.name}
          />
        </div>
      </div>
    </div>
  )
}
