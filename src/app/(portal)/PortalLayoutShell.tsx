"use client"

import { usePathname } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { MobileBottomNav } from "@/components/portal/MobileBottomNav"
import { CompareProvider } from "@/components/property/CompareContext"
import { CompareBar } from "@/components/property/CompareBar"
import { ToastProvider } from "@/lib/toast-context"
import { Toaster } from "@/components/ui/Toaster"

// Home route (/) renders the login page — no portal chrome needed
const BARE_ROUTES = ["/"]

export function PortalLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (BARE_ROUTES.includes(pathname)) {
    return <>{children}</>
  }

  return (
    <ToastProvider>
      <CompareProvider>
        <Header />
        <main id="main-content" className="min-h-screen bg-background pt-16 pb-16 md:pb-0">
          {children}
        </main>
        <Footer />
        <MobileBottomNav />
        <CompareBar />
      </CompareProvider>
      <Toaster />
    </ToastProvider>
  )
}
