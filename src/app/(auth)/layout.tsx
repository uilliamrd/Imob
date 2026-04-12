import type { ReactNode } from "react"
import { Particles } from "@/components/magicui/particles"

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-graphite flex items-center justify-center relative overflow-hidden">
      <Particles quantity={50} color="#C9A96E" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(201,169,110,0.08)_0%,_transparent_70%)]" />
      {children}
    </div>
  )
}
