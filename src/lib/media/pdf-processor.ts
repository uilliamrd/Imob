import { PDFDocument } from "pdf-lib"
import crypto from "crypto"

export interface ProcessedPDF {
  buffer: Buffer
  hash: string
  pages: number
  sizeOriginal: number
  sizeOptimized: number
  compressionRatio: number
}

export async function processPDF(input: Buffer): Promise<ProcessedPDF> {
  const hash = crypto.createHash("sha256").update(input).digest("hex")
  const sizeOriginal = input.length

  try {
    const doc = await PDFDocument.load(input, { ignoreEncryption: true })

    // Remove metadata to reduce size
    doc.setTitle("")
    doc.setAuthor("")
    doc.setSubject("")
    doc.setKeywords([])
    doc.setProducer("")
    doc.setCreator("")

    const saved = await doc.save({ useObjectStreams: true })
    const buffer = Buffer.from(saved)
    const sizeOptimized = buffer.length
    const compressionRatio = sizeOriginal > 0
      ? Math.round((1 - sizeOptimized / sizeOriginal) * 100 * 100) / 100
      : 0

    return {
      buffer,
      hash,
      pages: doc.getPageCount(),
      sizeOriginal,
      sizeOptimized,
      compressionRatio,
    }
  } catch {
    // If processing fails, return original unchanged
    return {
      buffer: input,
      hash,
      pages: 0,
      sizeOriginal,
      sizeOptimized: sizeOriginal,
      compressionRatio: 0,
    }
  }
}
