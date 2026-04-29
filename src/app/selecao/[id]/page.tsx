import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Image from "next/image"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Footer } from "@/components/landing/Footer"
import { getTagInfo } from "@/lib/tag-icons"
import {
  BedDouble, Car, Maximize2, MapPin, User, ArrowLeft, BookOpen, Phone,
} from "lucide-react"
import type { Selection, SelectionItem, Property, Profile } from "@/types/database"
import Link from "next/link"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  try {
    const admin = createAdminClient()
    const { data: selection } = await admin
      .from("selections")
      .select("title, items:selection_items(sort_order, property:properties(images)), corretor:profiles(full_name)")
      .eq("id", id)
      .eq("is_public", true)
      .single()
    if (!selection) return {}
    const selAny = selection as unknown as Record<string, unknown>
    const corrector = selAny.corretor as Record<string, unknown> | null
    const corrName = (corrector?.full_name as string | null) ?? "Consultor Especialista"
    const items = (selAny.items as Array<{ sort_order: number; property: { images: string[] } | null }>) ?? []
    const count = items.length
    const firstImg = items.sort((a, b) => a.sort_order - b.sort_order)[0]?.property?.images?.[0] ?? null
    const title = selAny.title as string
    const description = `Seleção de ${count} imóvel${count !== 1 ? "is" : ""} curada por ${corrName}.`
    return {
      title,
      description,
      openGraph: { title, description, images: firstImg ? [firstImg] : [] },
      twitter: { card: "summary_large_image", title, description, images: firstImg ? [firstImg] : [] },
      alternates: { canonical: `/selecao/${id}` },
    }
  } catch {
    return {}
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

function formatPrice(price: number) {
  if (price >= 1_000_000)
    return "R$ " + (price / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + " Mi"
  return "R$ " + price.toLocaleString("pt-BR")
}

const STATUS_BADGE: Record<string, string> = {
  disponivel: "text-emerald-400 bg-emerald-900/20 border-emerald-700/40",
  reserva:    "text-amber-400 bg-amber-900/20 border-amber-700/40",
  vendido:    "text-zinc-400 bg-zinc-800 border-zinc-700/40",
}
const STATUS_LABEL: Record<string, string> = {
  disponivel: "Disponível", reserva: "Em Negociação", vendido: "Vendido",
}

export default async function SelecaoPage({ params }: PageProps) {
  const { id } = await params

  const supabase = await createClient()
  const adminClient = createAdminClient()

  // Fetch selection with items + corretor
  const { data: selection } = await supabase
    .from("selections")
    .select(`
      *,
      corretor:profiles(id, full_name, avatar_url, whatsapp, creci, bio, organization_id),
      items:selection_items(
        *,
        property:properties(*, organization:organizations(*))
      )
    `)
    .eq("id", id)
    .eq("is_public", true)
    .single()

  if (!selection) notFound()

  // Increment view counter (best-effort)
  await adminClient
    .from("selections")
    .update({ views: (selection.views ?? 0) + 1 })
    .eq("id", id)

  const corretor = selection.corretor as Profile | null
  const items = (selection.items ?? []) as Array<SelectionItem & { property: Property }>
  const sorted = [...items].sort((a, b) => a.sort_order - b.sort_order)

  const corrWhatsapp = corretor?.whatsapp ?? "5521999999999"
  const corrName = corretor?.full_name ?? "Consultor Especialista"
  const corrPhoto = corretor?.avatar_url ?? undefined

  return (
    <main className="min-h-screen bg-background">

      {/* Sticky nav */}
      <nav className="sticky top-0 z-40 bg-[rgba(253,250,244,0.85)] backdrop-blur-xl border-b border-border px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-sans">
          <ArrowLeft size={14} />
          Início
        </Link>
        <div className="flex items-center gap-2">
          <BookOpen size={14} className="text-gold" />
          <span className="font-serif text-base font-semibold text-foreground hidden sm:block">Seleção exclusiva</span>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="mb-14 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-gold font-sans mb-3">Curadoria personalizada</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            {selection.title}
          </h1>
          <p className="text-muted-foreground font-sans text-base max-w-lg mx-auto">
            {sorted.length} imóvel{sorted.length !== 1 ? "is" : ""} selecionado{sorted.length !== 1 ? "s" : ""} especialmente para você
          </p>
          <div className="divider-gold mt-6 w-20 mx-auto" />
        </div>

        {/* Corretor card */}
        {corretor && (
          <div className="bg-[#fdf8f2] border border-[rgba(201,169,110,0.25)] rounded-2xl p-6 mb-12 flex items-center gap-5">
            {corrPhoto ? (
              <Image src={corrPhoto} alt={corrName} width={64} height={64} className="w-16 h-16 rounded-full object-cover border-2 border-gold/30 flex-shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-full border-2 border-gold/30 flex items-center justify-center bg-gold/10 flex-shrink-0">
                <User size={24} className="text-gold/60" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-serif text-xl font-semibold text-foreground">{corrName}</p>
              {corretor.creci && (
                <p className="text-gold/70 text-xs font-sans uppercase tracking-wider mt-0.5">CRECI {corretor.creci}</p>
              )}
              {corretor.bio && (
                <p className="text-muted-foreground text-sm font-sans mt-1 line-clamp-2">{corretor.bio}</p>
              )}
            </div>
            <a
              href={`https://wa.me/${corrWhatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("Olá! Recebi sua seleção e gostaria de saber mais.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-graphite text-offwhite hover:bg-gold hover:text-graphite transition-all duration-500 text-xs uppercase tracking-[0.2em] font-sans rounded-xl flex-shrink-0"
            >
              Falar no WhatsApp
            </a>
          </div>
        )}

        {/* Property cards */}
        {sorted.length === 0 ? (
          <div className="py-24 text-center text-muted-foreground font-sans">
            Esta seleção ainda não possui imóveis.
          </div>
        ) : (
          <div className="space-y-10">
            {sorted.map((item, idx) => {
              const p = item.property
              if (!p) return null
              const org = p.organization
              const orgWhatsapp = org?.whatsapp ?? corrWhatsapp

              return (
                <div
                  key={item.id}
                  className="bg-card border border-border rounded-2xl overflow-hidden hover:border-gold/30 transition-all duration-300 group"
                >
                  {/* Image strip */}
                  {p.images.length > 0 ? (
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <div className="absolute bottom-4 left-6 flex items-center gap-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-sans ${STATUS_BADGE[p.status] ?? ""}`}>
                          {STATUS_LABEL[p.status] ?? p.status}
                        </span>
                      </div>
                      <div className="absolute top-4 left-6">
                        <span className="text-white/40 font-serif text-sm">#{idx + 1}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-32 bg-gradient-to-br from-gold/5 to-gold/10 flex items-center justify-center">
                      <span className="font-serif text-gold/30 text-4xl font-bold">#{idx + 1}</span>
                    </div>
                  )}

                  <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Info */}
                    <div className="lg:col-span-2">
                      <p className="text-xs uppercase tracking-[0.25em] text-gold font-sans mb-2">
                        {p.neighborhood && `${p.neighborhood} · `}{p.city}
                      </p>
                      <h2 className="font-serif text-2xl font-bold text-foreground mb-3">
                        <Link href={`/imovel/${p.slug}?ref=${corretor?.id ?? ""}`} className="hover:text-gold transition-colors">
                          {p.title}
                        </Link>
                      </h2>

                      {p.address && (
                        <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-sans mb-4">
                          <MapPin size={12} className="text-gold flex-shrink-0" />
                          {p.address}
                        </div>
                      )}

                      {/* Key stats */}
                      <div className="flex flex-wrap gap-3 mb-4">
                        {p.features.area_m2 && (
                          <div className="flex items-center gap-1.5 text-sm font-sans text-foreground/70">
                            <Maximize2 size={13} className="text-gold" />
                            {p.features.area_m2}m²
                          </div>
                        )}
                        {(p.features.suites || p.features.quartos) && (
                          <div className="flex items-center gap-1.5 text-sm font-sans text-foreground/70">
                            <BedDouble size={13} className="text-gold" />
                            {p.features.suites ?? p.features.quartos} {p.features.suites ? "suítes" : "quartos"}
                          </div>
                        )}
                        {p.features.vagas && (
                          <div className="flex items-center gap-1.5 text-sm font-sans text-foreground/70">
                            <Car size={13} className="text-gold" />
                            {p.features.vagas} vaga{p.features.vagas > 1 ? "s" : ""}
                          </div>
                        )}
                      </div>

                      {/* Tags */}
                      {p.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {p.tags.slice(0, 4).map((tag) => {
                            const info = getTagInfo(tag)
                            const Icon = info.icon
                            return (
                              <div key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-gold/20 bg-gold/5 text-xs font-sans text-foreground">
                                <Icon size={10} className="text-gold" />
                                {info.label}
                              </div>
                            )
                          })}
                          {p.tags.length > 4 && (
                            <span className="text-xs text-muted-foreground font-sans self-center">+{p.tags.length - 4}</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Price + CTA */}
                    <div className="flex flex-col justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-sans mb-1">Valor</p>
                        <p className="font-serif text-3xl font-bold text-foreground">{formatPrice(p.price)}</p>
                      </div>
                      <div className="mt-6 space-y-2">
                        <a
                          href={`https://wa.me/${corrWhatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá! Vi sua seleção "${selection.title}" e gostaria de saber mais sobre ${p.title}.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#1C1C1C] text-[#F5F0E8] hover:bg-[#C9A96E] hover:text-[#1C1C1C] transition-all text-xs uppercase tracking-[0.15em] font-sans rounded-xl"
                        >
                          WhatsApp
                        </a>
                        <a
                          href={`tel:+${corrWhatsapp.replace(/\D/g, "")}`}
                          className="flex items-center justify-center gap-2 w-full py-3 border border-border text-muted-foreground hover:border-gold/40 hover:text-gold transition-all text-xs uppercase tracking-[0.15em] font-sans rounded-xl"
                        >
                          <Phone size={12} /> Ligar
                        </a>
                        <Link
                          href={`/imovel/${p.slug}?ref=${corretor?.id ?? ""}`}
                          className="flex items-center justify-center w-full py-3 border border-border text-muted-foreground hover:border-gold/40 hover:text-gold transition-all duration-300 text-xs uppercase tracking-[0.15em] font-sans rounded-xl"
                        >
                          Ver Detalhes
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Footer
        orgName={corretor?.full_name ?? "RealState Intelligence"}
        whatsapp={corrWhatsapp}
      />
    </main>
  )
}
