"use client"

import Image from "next/image"
import { ThemeSwitch } from "@/components/ThemeSwitch"
import { Sidebar } from "./Sidebar"
import { DashboardTopbar } from "./DashboardTopbar"
import { BottomNav } from "./BottomNav"
import type { ReactNode } from "react"
import type { UserRole, OrgPlan, OrgType } from "@/types/database"

interface Props {
  children: ReactNode
  role: UserRole
  user: { name: string; avatar?: string | null; plan?: OrgPlan }
  orgSlug?: string | null
  userId?: string
  orgType?: OrgType | null
}

export function DashboardShell({ children, role, user, orgSlug, userId, orgType }: Props) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar — desktop only */}
      <Sidebar
        role={role}
        userName={user.name}
        userAvatar={user.avatar}
        orgSlug={orgSlug}
        userId={userId}
        plan={user.plan ?? "free"}
        orgType={orgType}
      />

      <main id="main-content" className="flex-1 flex flex-col overflow-auto min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border/60 px-4 h-14 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-baseline gap-0">
            <span className="font-serif text-[15px] font-bold text-foreground">Base</span>
            <span className="font-serif text-[15px] font-bold text-[var(--gold)]">Imob</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeSwitch />
            {user.avatar ? (
              <Image
                src={user.avatar}
                alt={user.name}
                width={32}
                height={32}
                className="w-8 h-8 rounded-xl object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--gold)]/30 to-[var(--gold)]/10 border border-[var(--gold)]/30 flex items-center justify-center">
                <span className="text-[var(--gold)] font-serif font-bold text-xs">
                  {user.name[0]?.toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Desktop topbar */}
        <DashboardTopbar
          userName={user.name}
          userAvatar={user.avatar}
          role={role}
          userId={userId ?? ""}
        />

        {/* Page content */}
        <div className="flex-1 pb-20 lg:pb-0">
          {children}
        </div>
      </main>

      {/* Bottom nav — mobile only */}
      <BottomNav
        role={role}
        userName={user.name}
        userAvatar={user.avatar}
        orgSlug={orgSlug}
        userId={userId}
      />
    </div>
  )
}
