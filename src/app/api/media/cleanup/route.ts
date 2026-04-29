import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { deleteFromStorage, listStorageObjects } from "@/lib/media/storage"

// Vercel Cron: runs daily at 03:00 UTC
// vercel.json: { "crons": [{ "path": "/api/media/cleanup", "schedule": "0 3 * * *" }] }
export async function GET(request: Request) {
  // Basic security: only allow Vercel cron or internal calls
  const auth = request.headers.get("authorization")
  if (auth !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  }

  const admin = createAdminClient()
  const results = { tempCleaned: 0, assetsCleaned: 0, errors: 0 }
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 24h ago

  // 1. Clean up orphaned temp files older than 24h
  try {
    const objects = await listStorageObjects("uploads-temp", "")
    for (const obj of objects) {
      if (obj.created_at && obj.created_at < cutoff) {
        await deleteFromStorage("uploads-temp", obj.name)
        results.tempCleaned++
      }
    }
  } catch (err) {
    console.error("[cleanup] temp bucket error:", err)
    results.errors++
  }

  // 2. Hard-delete assets soft-deleted more than 7 days ago
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: toDelete } = await admin
    .from("assets")
    .select("id, storage_bucket, storage_key, variants")
    .eq("status", "deleted")
    .lt("deleted_at", sevenDaysAgo)
    .limit(100)

  for (const asset of toDelete ?? []) {
    try {
      // Delete all variant files from Storage
      const variants = (asset.variants ?? {}) as Record<string, { url?: string } | string>
      const paths: string[] = []

      for (const key of ["thumb", "card", "detail", "full", "original"]) {
        const v = variants[key]
        if (v && typeof v === "object" && "url" in v) {
          const url = v.url
          if (url) {
            // Extract path from Supabase URL
            const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/)
            if (match) paths.push(match[1])
          }
        }
      }

      if (paths.length > 0 && asset.storage_bucket) {
        await admin.storage.from(asset.storage_bucket).remove(paths)
      }

      await admin.from("assets").delete().eq("id", asset.id)
      results.assetsCleaned++
    } catch (err) {
      console.error("[cleanup] asset cleanup error:", asset.id, err)
      results.errors++
    }
  }

  return NextResponse.json({ ok: true, ...results })
}
