import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { ProfileForm } from "@/components/dashboard/ProfileForm"

export default async function ConfiguracoesPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans mb-2">Conta</p>
        <h1 className="font-serif text-4xl font-bold text-white">
          <AnimatedGradientText className="font-serif text-4xl font-bold">
            Configurações
          </AnimatedGradientText>
        </h1>
        <div className="divider-gold mt-4 w-20" />
      </div>

      <ProfileForm
        userId={user.id}
        initialData={{
          full_name: profile?.full_name ?? "",
          whatsapp: profile?.whatsapp ?? "",
          creci: profile?.creci ?? "",
          bio: profile?.bio ?? "",
          avatar_url: profile?.avatar_url ?? "",
        }}
      />
    </div>
  )
}
