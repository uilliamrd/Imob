export const dynamic = "force-dynamic"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { AIAssistant } from "@/components/dashboard/AIAssistant"
import { ToastProvider } from "@/lib/toast-context"
import { Toaster } from "@/components/ui/Toaster"
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

  // Query essencial — colunas que sempre existiram, nunca falha
  const { data: profile } = await adminClient
    .from("profiles")
    .select("full_name, avatar_url, role, organization_id")
    .eq("id", user.id)
    .single()

  // Query estendida — colunas adicionadas pelas migrations (pode falhar graciosamente)
  const { data: extProfile } = await adminClient
    .from("profiles")
    .select("plan, subscription_status, payment_due_date, organization:organizations(plan, subscription_status, payment_due_date, slug, type)")
    .eq("id", user.id)
    .single()

  // Suspension check (admins are never suspended)
  if (profile?.role && profile.role !== "admin" && extProfile) {
    const org = (extProfile as unknown as { organization?: { plan: string; subscription_status: string; payment_due_date: string | null; slug: string | null } }).organization ?? null
    const effectivePlan = org?.plan ?? (extProfile as unknown as { plan?: string }).plan ?? "free"
    const effectiveStatus = org?.subscription_status ?? (extProfile as unknown as { subscription_status?: string }).subscription_status ?? "trial"
    const effectiveDueDate = org?.payment_due_date ?? (extProfile as unknown as { payment_due_date?: string | null }).payment_due_date ?? null
    if (isEffectivelySuspended(effectivePlan, effectiveStatus, effectiveDueDate)) {
      redirect("/suspenso")
    }
  }

  const extAny = extProfile as unknown as Record<string, unknown> | null
  const org = (extAny?.organization ?? null) as { plan?: string; slug?: string | null; type?: string } | null
  const orgSlug = org?.slug ?? null
  const effectivePlan = ((org?.plan ?? (extAny?.plan as string | undefined) ?? "free") as OrgPlan)
  const orgType = (org?.type ?? null) as OrgType | null

  const safeProfile = {
    full_name: profile?.full_name ?? user.email ?? "Usuário",
    avatar_url: profile?.avatar_url ?? null,
    role: (profile?.role ?? "corretor") as UserRole,
  }

  return (
    <ToastProvider>
      <DashboardShell
        role={safeProfile.role}
        user={{ name: safeProfile.full_name, avatar: safeProfile.avatar_url, plan: effectivePlan }}
        orgSlug={orgSlug}
        userId={user.id}
        orgType={orgType}
      >
        {children}
      </DashboardShell>
      <AIAssistant />
      <Toaster />
    </ToastProvider>
  )
}
