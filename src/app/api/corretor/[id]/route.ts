import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, whatsapp, creci, bio')
    .eq('id', id)
    .eq('role', 'corretor')
    .maybeSingle()

  if (error || !data) {
    return NextResponse.json({ error: 'Corretor not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}
