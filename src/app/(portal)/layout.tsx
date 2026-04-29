import { PortalLayoutShell } from "./PortalLayoutShell"

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <PortalLayoutShell>{children}</PortalLayoutShell>
}
