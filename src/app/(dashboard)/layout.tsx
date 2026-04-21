export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import Image from "next/image"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { BottomNav } from "@/components/dashboard/BottomNav"
import { ThemeSwitch } from "@/components/ThemeSwitch"
import type { ReactNode } from "react"
import type { UserRole, OrgPlan, OrgType } from "@/types/database"

function isEffectivelySuspended(
  plan: string,
  status: string,
  paymentDueDate: string | null,
): boolean {
  if (plan === "free") return false
  if (status === "suspended") return true
  if (status === "active") return false
  if (!paymentDueDate) return false
  const graceCutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  return new Date(paymentDueDate) < graceCutoff
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const adminClient = createAdminClient()
  const { data: profile } = await adminClient
    .from("profiles")
    .select("full_name, avatar_url, role, plan, organization_id, subscription_status, payment_due_date, organization:organizations(plan, subscription_status, payment_due_date, slug, type)")
    .eq("id", user.id)
    .single()

  // Suspension check (admins are never suspended)
  if (profile && profile.role !== "admin") {
    const org = profile.organization as unknown as { plan: string; subscription_status: string; payment_due_date: string | null; slug: string | null } | null
    const effectivePlan = org?.plan ?? profile.plan ?? "free"
    const effectiveStatus = org?.subscription_status ?? profile.subscription_status ?? "trial"
    const effectiveDueDate = org?.payment_due_date ?? profile.payment_due_date ?? null
    if (isEffectivelySuspended(effectivePlan, effectiveStatus, effectiveDueDate)) {
      redirect("/suspenso")
    }
  }

  const orgId = profile?.organization_id ?? null
  const org = profile?.organization as unknown as { plan?: string; slug: string | null; type?: string } | null
  const orgSlug = org?.slug ?? null
  const effectivePlan = ((org?.plan ?? profile?.plan ?? "free") as OrgPlan)
  const orgType = (org?.type ?? null) as OrgType | null

  const safeProfile = {
    full_name: profile?.full_name ?? user.email ?? "Usuário",
    avatar_url: profile?.avatar_url ?? null,
    role: (profile?.role ?? "corretor") as UserRole,
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar — desktop only */}
      <Sidebar
        role={safeProfile.role}
        userName={safeProfile.full_name}
        userAvatar={safeProfile.avatar_url}
        orgSlug={orgSlug}
        userId={user.id}
        plan={effectivePlan}
        orgType={orgType}
      />

      <main className="flex-1 overflow-auto min-w-0">
        {/* Mobile header — hidden on desktop */}
        <div className="lg:hidden sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex-1">
            <p className="text-[9px] uppercase tracking-[0.4em] text-gold/50 font-sans leading-none">RealState</p>
            <h2 className="font-serif text-base font-bold text-foreground leading-tight">Intelligence</h2>
          </div>
          <ThemeSwitch />
          {safeProfile.avatar_url ? (
            <Image src={safeProfile.avatar_url} alt={safeProfile.full_name} width={32} height={32} className="w-8 h-8 rounded-full object-cover border border-gold/20 flex-shrink-0" />
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
