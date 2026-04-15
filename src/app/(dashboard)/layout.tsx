export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import Image from "next/image"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { BottomNav } from "@/components/dashboard/BottomNav"
import type { ReactNode } from "react"
import type { UserRole } from "@/types/database"

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from("profiles")
    .select("full_name, avatar_url, role, organization_id")
    .eq("id", user.id)
    .single()

  const orgId = profile?.organization_id ?? null
  let orgSlug: string | null = null
  if (orgId) {
    const { data: org } = await adminClient
      .from("organizations")
      .select("slug")
      .eq("id", orgId)
      .single()
    orgSlug = org?.slug ?? null
  }

  const safeProfile = {
    full_name: profile?.full_name ?? user.email ?? "Usuário",
    avatar_url: profile?.avatar_url ?? null,
    role: (profile?.role ?? "corretor") as UserRole,
  }

  return (
    <div className="flex min-h-screen bg-[#0D0D0D]">
      {/* Sidebar — desktop only */}
      <Sidebar
        role={safeProfile.role}
        userName={safeProfile.full_name}
        userAvatar={safeProfile.avatar_url}
        orgSlug={orgSlug}
        userId={user.id}
      />

      <main className="flex-1 overflow-auto min-w-0">
        {/* Mobile header — hidden on desktop */}
        <div className="lg:hidden sticky top-0 z-40 bg-[#111]/90 backdrop-blur-xl border-b border-white/[0.06] px-4 h-14 flex items-center justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-[0.4em] text-gold/50 font-sans leading-none">RealState</p>
            <h2 className="font-serif text-base font-bold text-white leading-tight">Intelligence</h2>
          </div>
          {safeProfile.avatar_url ? (
            <Image src={safeProfile.avatar_url} alt={safeProfile.full_name} width={32} height={32} className="w-8 h-8 rounded-full object-cover border border-gold/20" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center border border-gold/30 flex-shrink-0">
              <span className="text-gold font-serif font-bold text-xs">{safeProfile.full_name[0]?.toUpperCase()}</span>
            </div>
          )}
        </div>

        {/* Page content — bottom padding for mobile nav */}
        <div className="pb-20 lg:pb-0">
          {children}
        </div>
      </main>

      {/* Bottom nav — mobile only */}
      <BottomNav
        role={safeProfile.role}
        userName={safeProfile.full_name}
        userAvatar={safeProfile.avatar_url}
        orgSlug={orgSlug}
        userId={user.id}
      />
    </div>
  )
}
