import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"
import { ProfileForm } from "@/components/dashboard/ProfileForm"
import { PasswordChangeForm } from "@/components/dashboard/PasswordChangeForm"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { Settings } from "lucide-react"

export default async function ConfiguracoesPage() {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  const email = authUser?.email ?? ""

  return (
    <div className="px-4 py-6 lg:p-8 max-w-2xl space-y-8">
      <PageHeader icon={Settings} category="Conta" title="Configurações" />

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

      <PasswordChangeForm email={email} />
    </div>
  )
}
