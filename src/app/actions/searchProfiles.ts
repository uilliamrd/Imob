"use server"

import { createAdminClient } from "@/lib/supabase/admin"

export interface ProfileResult {
  id: string
  full_name: string | null
  creci: string | null
  avatar_url: string | null
}

export async function searchProfiles(query: string): Promise<ProfileResult[]> {
  if (!query.trim()) return []
  const admin = createAdminClient()
  const { data } = await admin
    .from("profiles")
    .select("id, full_name, creci, avatar_url")
    .or(`full_name.ilike.%${query}%,creci.ilike.%${query}%`)
    .eq("role", "corretor")
    .is("organization_id", null)
    .limit(10)
  return (data ?? []) as ProfileResult[]
}
