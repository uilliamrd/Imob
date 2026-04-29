import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const admin = createAdminClient()

    const {
      owner_name, owner_phone, owner_email,
      address, neighborhood, city, cep,
      tipo, tipo_negocio, price, area_m2, quartos, vagas, description,
      plan,
    } = body

    if (!owner_name?.trim() || !owner_phone?.trim()) {
      return NextResponse.json({ error: "Nome e telefone são obrigatórios." }, { status: 400 })
    }

    // Check if a property with the same address already exists in the system
    let matched_property_id: string | null = null
    let status = "pending"

    if (address?.trim()) {
      const { data: existing } = await admin
        .from("properties")
        .select("id, title")
        .ilike("address", `%${address.trim()}%`)
        .limit(1)
        .maybeSingle()

      if (existing) {
        matched_property_id = existing.id
        status = "duplicate"
      }
    }

    const { data, error } = await admin
      .from("property_submissions")
      .insert({
        owner_name:   owner_name.trim(),
        owner_phone:  owner_phone.trim(),
        owner_email:  owner_email?.trim() || null,
        address:      address?.trim() || null,
        neighborhood: neighborhood?.trim() || null,
        city:         city?.trim() || null,
        cep:          cep?.trim() || null,
        tipo:         tipo || null,
        tipo_negocio: tipo_negocio || "venda",
        price:        price ? Number(price) : null,
        area_m2:      area_m2 ? Number(area_m2) : null,
        quartos:      quartos ? Number(quartos) : null,
        vagas:        vagas ? Number(vagas) : null,
        description:  description?.trim() || null,
        plan:         plan || "free",
        status,
        matched_property_id,
      })
      .select("id, status")
      .single()

    if (error) throw error

    return NextResponse.json({ id: data.id, status: data.status })
  } catch (e) {
    console.error("submissions POST error", e)
    return NextResponse.json({ error: "Erro ao registrar. Tente novamente." }, { status: 500 })
  }
}
