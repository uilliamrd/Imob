import { PortalNav } from "@/components/portal/PortalNav"
import { Footer } from "@/components/landing/Footer"

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PortalNav />
      <main className="min-h-screen bg-background">{children}</main>
      <Footer orgName="RealState Intelligence" />
    </>
  )
}
