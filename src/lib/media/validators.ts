import FileType from "file-type"

export const ALLOWED_IMAGE_MIMES = [
  "image/jpeg", "image/png", "image/webp", "image/avif", "image/heic", "image/gif",
]
export const ALLOWED_VIDEO_MIMES = [
  "video/mp4", "video/quicktime", "video/x-msvideo", "video/x-matroska",
]
export const ALLOWED_PDF_MIMES = ["application/pdf"]
export const ALL_ALLOWED_MIMES = [
  ...ALLOWED_IMAGE_MIMES, ...ALLOWED_VIDEO_MIMES, ...ALLOWED_PDF_MIMES,
]

export const SIZE_LIMITS = {
  image:    30  * 1024 * 1024,  // 30 MB
  video:    500 * 1024 * 1024,  // 500 MB
  pdf:      50  * 1024 * 1024,  // 50 MB
  document: 50  * 1024 * 1024,
}

export type MediaCategory = "image" | "video" | "pdf"

export function getMimeCategory(mime: string): MediaCategory {
  if (ALLOWED_IMAGE_MIMES.includes(mime)) return "image"
  if (ALLOWED_VIDEO_MIMES.includes(mime)) return "video"
  return "pdf"
}

export async function validateFile(
  buffer: Buffer,
  declaredMime: string,
  size: number
): Promise<{ mime: string; category: MediaCategory }> {
  // Detect real MIME from magic bytes
  const detected = await FileType.fromBuffer(buffer.slice(0, 4100))

  // PDFs start with %PDF — file-type might return application/pdf
  if (!detected) {
    // Fallback: trust declared MIME only for PDFs (start with %PDF)
    if (declaredMime === "application/pdf" && buffer.slice(0, 4).toString() === "%PDF") {
      const category = getMimeCategory(declaredMime)
      if (size > SIZE_LIMITS[category]) {
        throw new Error(`Arquivo muito grande. Máximo: ${SIZE_LIMITS[category] / 1024 / 1024}MB`)
      }
      return { mime: declaredMime, category }
    }
    throw new Error("Não foi possível identificar o tipo do arquivo")
  }

  if (!ALL_ALLOWED_MIMES.includes(detected.mime)) {
    throw new Error(`Tipo de arquivo não permitido: ${detected.mime}`)
  }

  // Warn if declared and detected diverge (allow jpeg/jpg mismatch)
  const declaredNorm = declaredMime.replace("image/jpg", "image/jpeg")
  const detectedNorm = detected.mime.replace("image/jpg", "image/jpeg")
  if (declaredNorm !== detectedNorm) {
    // Allow heic→jpeg conversion (some browsers report heic as jpeg)
    const isHeicException =
      (declaredNorm === "image/heic" && detectedNorm === "image/jpeg") ||
      (detectedNorm === "image/heic" && declaredNorm === "image/jpeg")
    if (!isHeicException) {
      throw new Error(
        `Tipo declarado (${declaredMime}) diverge do conteúdo real (${detected.mime})`
      )
    }
  }

  const category = getMimeCategory(detected.mime)
  if (size > SIZE_LIMITS[category]) {
    throw new Error(`Arquivo muito grande. Máximo: ${SIZE_LIMITS[category] / 1024 / 1024}MB`)
  }

  return { mime: detected.mime, category }
}
