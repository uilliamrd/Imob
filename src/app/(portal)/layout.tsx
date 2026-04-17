export const dynamic = "force-dynamic"

import { PortalNav } from "@/components/portal/PortalNav"
import { Footer } from "@/components/landing/Footer"

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    // force-light overrides all CSS custom properties (--background, --card, --foreground, etc.)
    // to their light-mode values regardless of the .dark class on <html>.
    // This ensures the public portal always renders with the warm cream/editorial theme.
    <div className="force-light" style={{ colorScheme: "light" }}>
      <PortalNav />
      <main className="min-h-screen bg-[#FAF8F5]">{children}</main>
      <Footer orgName="RealState Intelligence" />
    </div>
  )
}
