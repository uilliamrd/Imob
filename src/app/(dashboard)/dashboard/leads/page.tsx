import { createClient } from "@/lib/supabase/server"
import { requireAuth } from "@/lib/auth"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { LeadsClient } from "@/components/dashboard/LeadsClient"
import { MessageSquare } from "lucide-react"
import type { Lead } from "@/types/database"

export default async function LeadsPage() {
  const user = await requireAuth(["imobiliaria", "corretor"])
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, organization_id")
    .eq("id", user.id)
    .single()

  const role = profile?.role
  const orgId = profile?.organization_id

  let query = supabase
    .from("leads")
    .select("*, property:properties(id, title, slug)")
    .order("created_at", { ascending: false })

  if (role === "corretor") {
    query = query.eq("ref_id", user.id)
  } else if (role === "imobiliaria" && orgId) {
    query = query.eq("org_id", orgId)
  }

  const { data: leads } = await query

  return (
    <div className="px-4 py-6 lg:p-8 max-w-5xl">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare size={18} className="text-gold" />
          <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans">Central</p>
        </div>
        <h1 className="font-serif text-4xl font-bold text-white">
          <AnimatedGradientText className="font-serif text-4xl font-bold">Leads</AnimatedGradientText>
        </h1>
        <p className="text-muted-foreground font-sans text-sm mt-2 max-w-xl">
          Mensagens recebidas pelas páginas de imóveis, minisite e links de referência.
        </p>
        <div className="divider-gold mt-4 w-20" />
      </div>

      <LeadsClient initialLeads={(leads ?? []) as Lead[]} />
    </div>
  )
}
