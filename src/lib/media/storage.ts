import { createAdminClient } from "@/lib/supabase/admin"

const admin = createAdminClient()

export async function downloadFromStorage(
  bucket: string,
  path: string
): Promise<Buffer> {
  const { data, error } = await admin.storage.from(bucket).download(path)
  if (error || !data) throw new Error(`Falha ao baixar ${bucket}/${path}: ${error?.message}`)
  const arrayBuffer = await data.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function uploadToStorage(
  bucket: string,
  path: string,
  buffer: Buffer,
  contentType: string,
  cacheControl = "31536000" // 1 year for immutable hashed files
): Promise<string> {
  const { error } = await admin.storage.from(bucket).upload(path, buffer, {
    contentType,
    cacheControl,
    upsert: true,
  })
  if (error) throw new Error(`Falha ao enviar ${bucket}/${path}: ${error.message}`)
  const { data } = admin.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export async function deleteFromStorage(
  bucket: string,
  path: string
): Promise<void> {
  await admin.storage.from(bucket).remove([path])
}

export async function listStorageObjects(
  bucket: string,
  prefix: string
): Promise<{ name: string; created_at: string | null }[]> {
  const { data } = await admin.storage.from(bucket).list(prefix, { limit: 1000 })
  return (data ?? []).map((o) => ({ name: o.name, created_at: o.created_at ?? null }))
}
