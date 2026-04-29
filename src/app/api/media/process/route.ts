import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { validateFile, getMimeCategory, ALLOWED_IMAGE_MIMES, ALLOWED_PDF_MIMES } from "@/lib/media/validators"
import { processImage } from "@/lib/media/image-processor"
import { processPDF } from "@/lib/media/pdf-processor"
import { downloadFromStorage, uploadToStorage, deleteFromStorage } from "@/lib/media/storage"
import { findDuplicateAsset } from "@/lib/media/dedup"

export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    // Auth
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

    const body = await request.json() as {
      storageKey: string
      originalName: string
      mimeType: string
      fileSize: number
      tenantId: string
      ownerType?: string
      ownerId?: string
    }

    const { storageKey, originalName, mimeType, fileSize, tenantId, ownerType = "pending", ownerId } = body

    if (!storageKey || !tenantId || !mimeType) {
      return NextResponse.json({ error: "Parâmetros obrigatórios ausentes" }, { status: 400 })
    }

    // Verify tenant ownership
    const admin = createAdminClient()
    const { data: profile } = await admin
      .from("profiles")
      .select("organization_id, role")
      .eq("id", user.id)
      .single()

    const isAdmin = profile?.role === "admin"
    const userTenantId = profile?.organization_id

    if (!isAdmin && userTenantId !== tenantId) {
      return NextResponse.json({ error: "Sem permissão para este tenant" }, { status: 403 })
    }

    // Download from temp bucket
    const buffer = await downloadFromStorage("uploads-temp", storageKey)

    // Validate MIME via magic bytes
    const { mime, category } = await validateFile(buffer, mimeType, fileSize)

    // Check deduplication
    const existing = await findDuplicateAsset(
      require("crypto").createHash("sha256").update(buffer).digest("hex"),
      tenantId
    )
    if (existing) {
      await deleteFromStorage("uploads-temp", storageKey)
      return NextResponse.json({ asset: existing, deduplicated: true })
    }

    // Process based on type
    let asset: Record<string, unknown>

    if (ALLOWED_IMAGE_MIMES.includes(mime)) {
      // Image pipeline
      const processed = await processImage(buffer)
      const basePath = `${tenantId}/assets/${processed.hash}`
      const variants: Record<string, { url: string; width: number; height: number; size: number }> = {}

      // Upload each variant
      for (const [name, v] of Object.entries(processed.variants)) {
        const url = await uploadToStorage(
          "property-images",
          `${basePath}/${name}.webp`,
          v.buffer,
          "image/webp"
        )
        variants[name] = { url, width: v.width, height: v.height, size: v.size }
      }

      // JPG fallback
      const jpgUrl = await uploadToStorage(
        "property-images",
        `${basePath}/full.jpg`,
        processed.jpgFallback,
        "image/jpeg"
      )

      const { data: inserted } = await admin.from("assets").insert({
        tenant_id: tenantId,
        owner_type: ownerType,
        owner_id: ownerId ?? null,
        type: "image",
        mime,
        original_name: originalName,
        size_original: fileSize,
        size_optimized: Object.values(processed.variants).reduce((a, v) => a + v.size, 0),
        compression_ratio: Math.round((1 - Object.values(processed.variants).reduce((a, v) => a + v.size, 0) / fileSize) * 100 * 100) / 100,
        width: processed.origWidth,
        height: processed.origHeight,
        hash: processed.hash,
        storage_bucket: "property-images",
        storage_key: `${basePath}/full.webp`,
        variants: {
          ...variants,
          jpg: { url: jpgUrl },
          blur_placeholder: processed.blurPlaceholder,
        },
        status: "ready",
      }).select().single()

      asset = inserted as Record<string, unknown>

    } else if (ALLOWED_PDF_MIMES.includes(mime)) {
      // PDF pipeline
      const processed = await processPDF(buffer)
      const basePath = `${tenantId}/assets/${processed.hash}`
      const pdfUrl = await uploadToStorage(
        "property-images",
        `${basePath}/document.pdf`,
        processed.buffer,
        "application/pdf",
        "86400"
      )

      const { data: inserted } = await admin.from("assets").insert({
        tenant_id: tenantId,
        owner_type: ownerType,
        owner_id: ownerId ?? null,
        type: "pdf",
        mime,
        original_name: originalName,
        size_original: processed.sizeOriginal,
        size_optimized: processed.sizeOptimized,
        compression_ratio: processed.compressionRatio,
        pages: processed.pages,
        hash: processed.hash,
        storage_bucket: "property-images",
        storage_key: `${basePath}/document.pdf`,
        variants: { original: { url: pdfUrl } },
        status: "ready",
      }).select().single()

      asset = inserted as Record<string, unknown>

    } else {
      // Video or unsupported: store as-is (no server-side transcoding)
      return NextResponse.json({
        error: "Processamento de vídeo requer Cloudflare Stream ou Mux. Envie o link do vídeo diretamente.",
        code: "VIDEO_NOT_SUPPORTED",
      }, { status: 422 })
    }

    // Delete from temp bucket
    await deleteFromStorage("uploads-temp", storageKey)

    return NextResponse.json({ asset })

  } catch (err) {
    console.error("[media/process]", err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno no processamento" },
      { status: 500 }
    )
  }
}
