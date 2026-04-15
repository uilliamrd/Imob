import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { RefLinksClient } from "@/components/dashboard/RefLinksClient"

export default async function CorretorPage() {
  const user = await requireAuth(["corretor", "admin"])
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, whatsapp, creci, avatar_url, organization_id")
    .eq("id", user.id)
    .single()

  const { data: properties } = await supabase
    .from("properties")
    .select("id, title, slug, status, price, neighborhood, city")
    .in("visibility", ["publico", "equipe"])
    .eq("status", "disponivel")
    .order("updated_at", { ascending: false })

  return (
    <div className="px-4 py-6 lg:p-8 max-w-5xl">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans mb-2">Corretor</p>
        <h1 className="font-serif text-4xl font-bold text-white">
          <AnimatedGradientText className="font-serif text-4xl font-bold">Meus Links</AnimatedGradientText>
        </h1>
        <p className="text-white/40 font-sans text-sm mt-2">
          Compartilhe imóveis com seu link personalizado. Quando alguém acessar via seu link, seus dados de contato substituem os da construtora.
        </p>
        <div className="divider-gold mt-4 w-20" />
      </div>

      <RefLinksClient
        userId={profile?.id ?? user.id}
        properties={properties ?? []}
        profile={profile}
      />
    </div>
  )
}
