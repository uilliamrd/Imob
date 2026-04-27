import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import type { IngestPropertyPayload } from '@/types/database'

function isValidToken(provided: string): boolean {
  const expected = process.env.API_INGEST_TOKEN
  if (!expected || !provided) return false
  try {
    const a = Buffer.from(provided)
    const b = Buffer.from(expected)
    if (a.length !== b.length) return false
    return timingSafeEqual(a, b)
  } catch { return false }
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '') ?? ""

  if (!isValidToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: IngestPropertyPayload | IngestPropertyPayload[]
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const payloads = Array.isArray(body) ? body : [body]

  if (payloads.length === 0) {
    return NextResponse.json({ error: 'Empty payload' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const results: Array<{ slug: string; action: 'created' | 'updated'; error?: string }> = []

  for (const payload of payloads) {
    if (!payload.slug || !payload.title || payload.price == null) {
      results.push({ slug: payload.slug ?? 'unknown', action: 'created', error: 'Missing required fields: slug, title, price' })
      continue
    }

    const record = {
      slug: payload.slug,
      title: payload.title,
      description: payload.description ?? null,
      price: payload.price,
      features: payload.features ?? {},
      tags: payload.tags ?? [],
      status: payload.status ?? 'disponivel',
      visibility: payload.visibility ?? 'publico',
      org_id: payload.org_id ?? null,
      development_id: payload.development_id ?? null,
      images: payload.images ?? [],
      video_url: payload.video_url ?? null,
      address: payload.address ?? null,
      neighborhood: payload.neighborhood ?? null,
      city: payload.city ?? null,
      updated_at: new Date().toISOString(),
    }

    const { data: existing } = await supabase
      .from('properties')
      .select('id')
      .eq('slug', payload.slug)
      .maybeSingle()

    if (existing) {
      const { error } = await supabase
        .from('properties')
        .update(record)
        .eq('slug', payload.slug)

      results.push({ slug: payload.slug, action: 'updated', ...(error && { error: error.message }) })
    } else {
      const { error } = await supabase
        .from('properties')
        .insert({ ...record, created_at: new Date().toISOString() })

      results.push({ slug: payload.slug, action: 'created', ...(error && { error: error.message }) })
    }
  }

  const errors = results.filter((r) => r.error)
  const created = results.filter((r) => r.action === 'created' && !r.error).length
  const updated = results.filter((r) => r.action === 'updated' && !r.error).length
  const status = errors.length === results.length ? 500 : errors.length > 0 ? 207 : 200

  // Write ingest log (best-effort — don't fail the request if logging fails)
  const slugs = payloads.map((p) => p.slug).filter(Boolean).slice(0, 5).join(', ')
  const logMessage = errors.length === 0
    ? `Ingestão via n8n — ${results.length} registro(s): ${slugs}${results.length > 5 ? '...' : ''}`
    : `Ingestão via n8n com erros — ${errors.length} falha(s) de ${results.length}`

  await supabase.from('ingest_logs').insert({
    status: errors.length === results.length ? 'error' : 'success',
    message: logMessage,
    payload_summary: slugs || null,
    rows_processed: results.length,
    rows_created: created,
    rows_updated: updated,
    rows_errored: errors.length,
  })

  return NextResponse.json(
    {
      processed: results.length,
      created,
      updated,
      errors: errors.length,
      results,
    },
    { status }
  )
}
