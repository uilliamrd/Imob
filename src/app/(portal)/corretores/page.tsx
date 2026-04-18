import type { Metadata } from "next"
import { createAdminClient } from "@/lib/supabase/admin"
import Image from "next/image"
import Link from "next/link"
import { User, ArrowRight, BadgeCheck } from "lucide-react"

export const metadata: Metadata = {
  title: "Corretores Especializados",
  description: "Encontre corretores especializados em imóveis de alto padrão para te atender.",
}

export default async function CorretoresPage() {
  const admin = createAdminClient()

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, full_name, avatar_url, creci, bio, slug, organization:organizations(id, name)")
    .eq("role", "corretor")
    .eq("is_active", true)
    .order("full_name")

  const corretores = (profiles ?? []) as unknown as {
    id: string
    full_name: string | null
    avatar_url: string | null
    creci: string | null
    bio: string | null
    slug: string | null
    organization: { id: string; name: string } | null
  }[]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <p className="text-[10px] uppercase tracking-[0.4em] text-gold/60 font-sans mb-3">Portal</p>
        <h1 className="font-serif text-4xl font-bold text-foreground mb-3">Corretores</h1>
        <p className="text-muted-foreground font-sans text-sm max-w-xl">
          Especialistas prontos para te ajudar a encontrar o imóvel ideal.
        </p>
        <div className="divider-gold mt-5 w-16" />
      </div>

      {corretores.length === 0 ? (
        <div className="py-24 text-center">
          <User size={32} className="mx-auto text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground font-sans text-sm">Nenhum corretor disponível no portal.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {corretores.map((c) => (
            <Link
              key={c.id}
              href={`/corretor/${c.slug ?? c.id}`}
              className="group bg-card border border-border rounded-xl p-5 flex flex-col items-center text-center hover:border-gold/30 transition-all duration-300"
            >
              {/* Avatar */}
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted mb-3 flex-shrink-0">
                {c.avatar_url ? (
                  <Image src={c.avatar_url} alt={c.full_name ?? "Corretor"} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={20} className="text-muted-foreground/30" />
                  </div>
                )}
              </div>

              <p className="font-serif text-foreground text-sm font-semibold leading-tight mb-1">
                {c.full_name ?? "Corretor"}
              </p>

              {c.creci && (
                <div className="flex items-center gap-1 text-gold/70 mb-2">
                  <BadgeCheck size={11} />
                  <span className="text-[10px] font-sans text-muted-foreground">CRECI {c.creci}</span>
                </div>
              )}

              {c.organization && (
                <span className="text-[10px] font-sans text-muted-foreground/60 bg-muted px-2 py-0.5 rounded-full mb-3">
                  {c.organization.name}
                </span>
              )}

              {c.bio && (
                <p className="text-muted-foreground font-sans text-xs leading-relaxed line-clamp-2 mb-3">
                  {c.bio}
                </p>
              )}

              <span className="mt-auto flex items-center gap-1 text-[11px] font-sans text-gold/60 group-hover:text-gold transition-colors">
                Ver minisite <ArrowRight size={10} />
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
