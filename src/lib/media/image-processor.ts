import sharp from "sharp"
import crypto from "crypto"

export interface ImageVariant {
  buffer: Buffer
  width: number
  height: number
  size: number
}

export interface ProcessedImage {
  variants: Record<string, ImageVariant>
  blurPlaceholder: string
  hash: string
  origWidth: number
  origHeight: number
  jpgFallback: Buffer
}

const VARIANTS = [
  { name: "thumb",  width: 320  },
  { name: "card",   width: 640  },
  { name: "detail", width: 1280 },
  { name: "full",   width: 1920 },
] as const

export async function processImage(input: Buffer): Promise<ProcessedImage> {
  const hash = crypto.createHash("sha256").update(input).digest("hex")

  // Base pipeline: auto-rotate from EXIF, strip all metadata
  const base = sharp(input, { failOnError: false })
    .rotate()         // auto-correct orientation
    .withMetadata({}) // strip EXIF/GPS/camera data (empty = strip all)

  const meta = await base.metadata()
  const origWidth  = meta.width  ?? 0
  const origHeight = meta.height ?? 0

  // Blur placeholder: 16px wide WEBP → base64 ~200 bytes
  const blurBuf = await base.clone()
    .resize(16, undefined, { withoutEnlargement: false })
    .webp({ quality: 20 })
    .toBuffer()
  const blurPlaceholder = `data:image/webp;base64,${blurBuf.toString("base64")}`

  // Generate WEBP variants
  const variants: Record<string, ImageVariant> = {}
  for (const v of VARIANTS) {
    // Skip sizes larger than original (no upscaling), except always generate thumb
    if (v.name !== "thumb" && origWidth > 0 && origWidth <= v.width) continue
    const result = await base.clone()
      .resize(v.width, undefined, { withoutEnlargement: true, fit: "inside" })
      .webp({ quality: 82, effort: 4 })
      .toBuffer({ resolveWithObject: true })
    variants[v.name] = {
      buffer: result.data,
      width: result.info.width,
      height: result.info.height,
      size: result.data.length,
    }
  }

  // Always ensure thumb exists
  if (!variants.thumb) {
    const result = await base.clone()
      .resize(320, undefined, { fit: "inside" })
      .webp({ quality: 75 })
      .toBuffer({ resolveWithObject: true })
    variants.thumb = {
      buffer: result.data,
      width: result.info.width,
      height: result.info.height,
      size: result.data.length,
    }
  }

  // JPG fallback (for legacy compatibility)
  const jpgFallback = await base.clone()
    .jpeg({ quality: 85, mozjpeg: false })
    .toBuffer()

  return { variants, blurPlaceholder, hash, origWidth, origHeight, jpgFallback }
}
