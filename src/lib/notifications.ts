import { createAdminClient } from "@/lib/supabase/admin"

type AdminClient = ReturnType<typeof createAdminClient>

interface PropertyInfo {
  id: string
  title: string
  slug: string
  price: number
  org_name: string
}

function formatPrice(price: number): string {
  if (price >= 1_000_000)
    return "R$ " + (price / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + " Mi"
  return "R$ " + price.toLocaleString("pt-BR")
}

export async function notifyNewProperty(property: PropertyInfo, adminClient: AdminClient) {
  const { data: corretores } = await adminClient
    .from("profiles")
    .select("id")
    .eq("role", "corretor")
    .eq("is_active", true)
    .eq("notif_new_property", true)

  if (!corretores || corretores.length === 0) return

  const rows = corretores.map(c => ({
    recipient_id: c.id,
    type: "new_property",
    title: `Novo imóvel: ${property.title}`,
    body: `${formatPrice(property.price)} · ${property.org_name}`,
    link: `/imovel/${property.slug}`,
    metadata: { property_id: property.id },
  }))

  await adminClient.from("notifications").insert(rows)
}
