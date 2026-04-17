export const dynamic = "force-dynamic"

import { PortalNav } from "@/components/portal/PortalNav"
import { Footer } from "@/components/landing/Footer"

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PortalNav />
      <main className="min-h-screen bg-[#FAF8F5]">{children}</main>
      <Footer orgName="RealState Intelligence" />
    </>
  )
}
