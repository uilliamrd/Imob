import { createAdminClient } from "@/lib/supabase/admin"
import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { PropertyForm } from "@/components/dashboard/PropertyForm"
import type { Development } from "@/types/database"

export default async function NovoImovelPage() {
  const user = await requireAuth(["admin", "imobiliaria", "construtora", "corretor"])
  const admin = createAdminClient()

  const [
    { data: profile },
    { data: developments },
    { data: bairros },
    { data: logradouros },
  ] = await Promise.all([
    admin.from("profiles").select("organization_id").eq("id", user.id).single(),
    admin.from("developments").select("*").order("name"),
    admin.from("bairros").select("*").order("name"),
    admin.from("logradouros").select("*").order("name"),
  ])

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans mb-2">Portfólio</p>
        <h1 className="font-serif text-4xl font-bold text-white">
          <AnimatedGradientText className="font-serif text-4xl font-bold">Novo Imóvel</AnimatedGradientText>
        </h1>
        <div className="divider-gold mt-4 w-20" />
      </div>

      <PropertyForm
        orgId={profile?.organization_id}
        developments={(developments ?? []) as Development[]}
        bairros={(bairros ?? []) as { id: string; name: string; city: string; state: string }[]}
        logradouros={(logradouros ?? []) as { id: string; type: string; name: string; bairro_id: string | null; city: string; cep: string | null }[]}
      />
    </div>
  )
}
