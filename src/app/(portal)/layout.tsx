import { PortalNav } from "@/components/portal/PortalNav"
import { Footer } from "@/components/landing/Footer"
import { MobileBottomNav } from "@/components/portal/MobileBottomNav"

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PortalNav />
      <main className="min-h-screen bg-background pb-16 md:pb-0">{children}</main>
      <Footer orgName="RealState Intelligence" />
      <MobileBottomNav />
    </>
  )
}
