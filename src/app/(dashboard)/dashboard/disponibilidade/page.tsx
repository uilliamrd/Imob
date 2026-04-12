import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { DisponibilidadeClient } from "@/components/dashboard/DisponibilidadeClient"
import { ClipboardList } from "lucide-react"
import type { Property, Development } from "@/types/database"

export default async function DisponibilidadePage() {
  const user = await requireAuth(["construtora"])
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("org_id")
    .eq("id", user.id)
    .single()

  const orgId = profile?.org_id ?? null

  const [{ data: developments }, { data: properties }] = await Promise.all([
    supabase.from("developments").select("*").eq("org_id", orgId ?? "").order("name"),
    supabase.from("properties").select("*").eq("org_id", orgId ?? "").order("development_id").order("price"),
  ])

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <ClipboardList size={18} className="text-gold" />
          <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans">Construtora</p>
        </div>
        <h1 className="font-serif text-4xl font-bold text-white">
          <AnimatedGradientText className="font-serif text-4xl font-bold">Disponibilidade</AnimatedGradientText>
        </h1>
        <p className="text-white/30 font-sans text-sm mt-2 max-w-xl">
          Marque unidades como Disponível, Reservada ou Vendida por empreendimento.
        </p>
        <div className="divider-gold mt-4 w-20" />
      </div>

      <DisponibilidadeClient
        developments={(developments ?? []) as Development[]}
        properties={(properties ?? []) as Property[]}
      />
    </div>
  )
}
