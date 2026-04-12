import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { OrgForm } from "@/components/dashboard/OrgForm"

export default async function OrganizacaoPage() {
  const user = await requireAuth(["admin", "imobiliaria", "construtora"])
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  const { data: org } = profile?.organization_id
    ? await supabase.from("organizations").select("*").eq("id", profile.organization_id).single()
    : { data: null }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans mb-2">Configurações</p>
        <h1 className="font-serif text-4xl font-bold text-white">
          <AnimatedGradientText className="font-serif text-4xl font-bold">
            Organização
          </AnimatedGradientText>
        </h1>
        <div className="divider-gold mt-4 w-20" />
      </div>

      <OrgForm
        userId={user.id}
        orgId={org?.id}
        initialData={{
          name: org?.name ?? "",
          type: org?.type ?? "construtora",
          portfolio_desc: org?.portfolio_desc ?? "",
          website: org?.website ?? "",
          logo: org?.logo ?? "",
        }}
      />
    </div>
  )
}
