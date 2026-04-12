import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  let body: {
    name: string
    phone: string
    property_id?: string
    property_slug?: string
    ref_id?: string
    org_id?: string
    source?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { name, phone, property_id, property_slug, ref_id, org_id, source } = body

  if (!name?.trim() || !phone?.trim()) {
    return NextResponse.json({ error: 'name and phone are required' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { error } = await supabase.from('leads').insert({
    name: name.trim(),
    phone: phone.trim(),
    property_id: property_id ?? null,
    property_slug: property_slug ?? null,
    ref_id: ref_id ?? null,
    org_id: org_id ?? null,
    source: source ?? 'imovel',
    status: 'novo',
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
