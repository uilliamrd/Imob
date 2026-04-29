import { createAdminClient } from "@/lib/supabase/admin"
import type { Asset } from "@/types/database"

export async function findDuplicateAsset(
  hash: string,
  tenantId: string
): Promise<Asset | null> {
  const admin = createAdminClient()
  const { data } = await admin
    .from("assets")
    .select("*")
    .eq("hash", hash)
    .eq("tenant_id", tenantId)
    .eq("status", "ready")
    .is("deleted_at", null)
    .limit(1)
    .single()
  return data as Asset | null
}
