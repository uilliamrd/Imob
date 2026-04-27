"use server"

import { createAdminClient } from "@/lib/supabase/admin"

export interface ProfileResult {
  id: string
  full_name: string | null
  creci: string | null
  avatar_url: string | null
}

// Strip PostgREST metacharacters that could inject extra filter conditions
function sanitizeFilterValue(s: string): string {
  return s.replace(/[(),]/g, "").slice(0, 100).trim()
}

export async function searchProfiles(query: string): Promise<ProfileResult[]> {
  if (!query.trim()) return []
  const safe = sanitizeFilterValue(query)
  if (!safe) return []
  const admin = createAdminClient()
  const { data } = await admin
    .from("profiles")
    .select("id, full_name, creci, avatar_url")
    .or(`full_name.ilike.%${safe}%,creci.ilike.%${safe}%`)
    .eq("role", "corretor")
    .is("organization_id", null)
    .limit(10)
  return (data ?? []) as ProfileResult[]
}
