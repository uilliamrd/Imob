import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import type { UserRole } from "@/types/database"

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const admin = createAdminClient()
  const { data } = await admin
    .from("profiles")
    .select("*, organization:organizations(*)")
    .eq("id", user.id)
    .single()

  return data
}

export async function requireAuth(allowedRoles?: UserRole[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  if (allowedRoles) {
    const admin = createAdminClient()

    let profile: { role: string } | null = null

    // First attempt
    const { data: first, error: firstErr } = await admin
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (first) {
      profile = first
    } else if (firstErr?.code === "PGRST116") {
      // Row not found — new user race condition; wait and retry once
      await new Promise((r) => setTimeout(r, 600))
      const { data: retry } = await admin
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()
      profile = retry ?? null
    }

    // No profile after retry → send to login (account not fully set up)
    if (!profile) redirect("/login")

    // Profile found but wrong role → send to dashboard root
    if (!allowedRoles.includes(profile.role as UserRole)) {
      redirect("/dashboard")
    }
  }

  return user
}
