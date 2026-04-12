import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { PropertyForm } from "@/components/dashboard/PropertyForm"
import type { Development } from "@/types/database"

export default async function NovoImovelPage() {
  const user = await requireAuth(["admin", "imobiliaria", "construtora", "corretor"])
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  const { data: developments } = await supabase
    .from("developments")
    .select("*")
    .order("name")

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans mb-2">Portfólio</p>
        <h1 className="font-serif text-4xl font-bold text-white">
          <AnimatedGradientText className="font-serif text-4xl font-bold">Novo Imóvel</AnimatedGradientText>
        </h1>
        <div className="divider-gold mt-4 w-20" />
      </div>

      <PropertyForm
        orgId={profile?.organization_id}
        developments={(developments ?? []) as Development[]}
      />
    </div>
  )
}
