import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

const rateMap = new Map<string, { count: number; resetAt: number }>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + 60_000 })
    return false
  }
  if (entry.count >= 30) return true
  entry.count++
  return false
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (isRateLimited(ip)) return NextResponse.json({ ok: true }) // silently drop

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ ok: true })

  const { property_id, org_id } = body as Record<string, unknown>
  if (typeof property_id !== "string" || !UUID_RE.test(property_id))
    return NextResponse.json({ ok: true })

  const admin = createAdminClient()
  await admin.from("property_views").insert({
    property_id,
    org_id: typeof org_id === "string" && UUID_RE.test(org_id) ? org_id : null,
  })

  return NextResponse.json({ ok: true })
}
