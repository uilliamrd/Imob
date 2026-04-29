import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(_req: Request, { params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ note: "" })

  const { data } = await supabase
    .from("property_notes")
    .select("note")
    .eq("property_id", propertyId)
    .eq("user_id", user.id)
    .maybeSingle()

  return NextResponse.json({ note: data?.note ?? "" })
}

export async function PUT(req: Request, { params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 })

  const { note } = await req.json() as { note: string }

  if (!note?.trim()) {
    // Delete the note if empty
    await supabase.from("property_notes").delete().eq("property_id", propertyId).eq("user_id", user.id)
    return NextResponse.json({ ok: true })
  }

  const { error } = await supabase.from("property_notes").upsert(
    { user_id: user.id, property_id: propertyId, note: note.trim() },
    { onConflict: "user_id,property_id" }
  )

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
