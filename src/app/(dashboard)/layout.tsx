export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { Sidebar } from "@/components/dashboard/Sidebar"
import type { ReactNode } from "react"
import type { UserRole } from "@/types/database"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  // Use admin client to bypass RLS — profile is always readable server-side
  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from("profiles")
    .select("full_name, avatar_url, role")
    .eq("id", user.id)
    .single()

  const safeProfile = {
    full_name: profile?.full_name ?? user.email ?? "Usuário",
    avatar_url: profile?.avatar_url ?? null,
    role: (profile?.role ?? "corretor") as UserRole,
    org_id: null as string | null,
    organization: null as null,
  }
  const orgSlug: string | null = null

  return (
    <div className="flex min-h-screen bg-[#0D0D0D]">
      <Sidebar
        role={(safeProfile.role as UserRole) ?? "corretor"}
        userName={safeProfile.full_name ?? user.email ?? "Usuário"}
        userAvatar={safeProfile.avatar_url}
        orgSlug={orgSlug}
        userId={user.id}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
