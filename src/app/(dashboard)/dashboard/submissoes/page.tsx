import { requireAuth } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { SubmissoesClient } from "@/components/dashboard/SubmissoesClient"

export const dynamic = "force-dynamic"

export interface PropertySubmission {
  id: string
  owner_name: string
  owner_phone: string
  owner_email: string | null
  address: string | null
  neighborhood: string | null
  city: string | null
  cep: string | null
  tipo: string | null
  tipo_negocio: string
  price: number | null
  area_m2: number | null
  quartos: number | null
  vagas: number | null
  description: string | null
  plan: "free" | "destaque" | "super_destaque" | "exclusivo"
  status: "pending" | "reviewing" | "approved" | "rejected" | "duplicate"
  matched_property_id: string | null
  admin_notes: string | null
  created_at: string
}

export default async function SubmissoesPage() {
  const user = await requireAuth(["admin"])
  const admin = createAdminClient()

  const { data: profile } = await admin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") redirect("/dashboard")

  const { data: submissions } = await admin
    .from("property_submissions")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.3em] text-gold/60 font-sans mb-1">Admin</p>
        <h1 className="font-serif text-3xl font-bold text-foreground">Submissões de Proprietários</h1>
        <p className="text-muted-foreground font-sans text-sm mt-1">
          Imóveis enviados por proprietários para cadastro no portal.
        </p>
      </div>

      <SubmissoesClient initialSubmissions={(submissions ?? []) as PropertySubmission[]} />
    </div>
  )
}
