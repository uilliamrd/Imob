// Script: cadastra 20 unidades no Edifício Residencial Vista Mar
// Rodar: node scripts/seed-vista-mar.mjs
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "fs"
import { resolve, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const env = Object.fromEntries(
  readFileSync(resolve(__dirname, "../.env.local"), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => l.split("=").map((s) => s.trim()))
    .filter(([k]) => k)
    .map(([k, ...rest]) => [k, rest.join("=")])
)

const admin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// Imagens de exemplo (apartamentos de praia / alto padrão)
const IMG = [
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80",
  "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1200&q=80",
  "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=1200&q=80",
]

function imgs(seed) { return [IMG[seed % IMG.length], IMG[(seed + 1) % IMG.length]] }

// 20 unidades: andares 2–15, mix de 2 e 3 dorms
const UNITS = [
  { andar: 2,  apto: "201", suites: 1, quartos: 2, vagas: 1, area: 68,  price: 285000, status: "vendido"    },
  { andar: 2,  apto: "202", suites: 1, quartos: 2, vagas: 1, area: 68,  price: 289000, status: "vendido"    },
  { andar: 3,  apto: "301", suites: 1, quartos: 2, vagas: 1, area: 71,  price: 295000, status: "reserva"    },
  { andar: 3,  apto: "302", suites: 2, quartos: 3, vagas: 2, area: 92,  price: 370000, status: "disponivel" },
  { andar: 4,  apto: "401", suites: 1, quartos: 2, vagas: 1, area: 68,  price: 299000, status: "disponivel" },
  { andar: 4,  apto: "402", suites: 2, quartos: 3, vagas: 2, area: 94,  price: 380000, status: "disponivel" },
  { andar: 5,  apto: "501", suites: 2, quartos: 3, vagas: 2, area: 94,  price: 385000, status: "reserva"    },
  { andar: 5,  apto: "502", suites: 1, quartos: 2, vagas: 1, area: 71,  price: 305000, status: "disponivel" },
  { andar: 6,  apto: "601", suites: 2, quartos: 3, vagas: 2, area: 96,  price: 392000, status: "disponivel" },
  { andar: 6,  apto: "602", suites: 1, quartos: 2, vagas: 1, area: 68,  price: 309000, status: "disponivel" },
  { andar: 8,  apto: "801", suites: 2, quartos: 3, vagas: 2, area: 98,  price: 415000, status: "reserva"    },
  { andar: 8,  apto: "802", suites: 1, quartos: 2, vagas: 1, area: 71,  price: 319000, status: "disponivel" },
  { andar: 10, apto: "1001",suites: 2, quartos: 3, vagas: 2, area: 98,  price: 430000, status: "disponivel" },
  { andar: 10, apto: "1002",suites: 3, quartos: 3, vagas: 2, area: 112, price: 490000, status: "disponivel" },
  { andar: 11, apto: "1101",suites: 2, quartos: 3, vagas: 2, area: 98,  price: 438000, status: "disponivel" },
  { andar: 11, apto: "1102",suites: 1, quartos: 2, vagas: 1, area: 71,  price: 328000, status: "disponivel" },
  { andar: 12, apto: "1201",suites: 3, quartos: 3, vagas: 2, area: 114, price: 498000, status: "disponivel" },
  { andar: 13, apto: "1301",suites: 3, quartos: 4, vagas: 3, area: 128, price: 545000, status: "disponivel" },
  { andar: 14, apto: "1401",suites: 3, quartos: 4, vagas: 3, area: 128, price: 558000, status: "reserva"    },
  { andar: 15, apto: "1501",suites: 4, quartos: 4, vagas: 3, area: 148, price: 620000, status: "disponivel" },
]

function slugify(s) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-")
}

async function main() {
  // 1. Encontrar o empreendimento
  const { data: devs, error: devErr } = await admin
    .from("developments")
    .select("id, org_id, name")
    .ilike("name", "%Vista Mar%")

  if (devErr) { console.error("Erro ao buscar empreendimento:", devErr.message); process.exit(1) }
  if (!devs?.length) { console.error("Empreendimento 'Vista Mar' não encontrado."); process.exit(1) }

  const dev = devs[0]
  console.log(`✓ Empreendimento: ${dev.name} (${dev.id})`)

  // 2. Encontrar o admin para created_by
  const { data: adminUser } = await admin
    .from("profiles")
    .select("id")
    .eq("role", "admin")
    .limit(1)
    .single()

  const createdBy = adminUser?.id ?? dev.org_id ?? "system"
  console.log(`✓ created_by: ${createdBy}`)

  // 3. Inserir as unidades
  let ok = 0, skip = 0
  for (let i = 0; i < UNITS.length; i++) {
    const u = UNITS[i]
    const nome = u.quartos === 2
      ? `Apto ${u.apto} — ${u.quartos} Dorms`
      : u.quartos === 4
        ? `Apto ${u.apto} — ${u.quartos} Dorms`
        : `Apto ${u.apto} — ${u.quartos} Dorms`
    const slug = slugify(`vista-mar-apto-${u.apto}`)

    // Verificar duplicata
    const { data: dup } = await admin.from("properties").select("id").eq("slug", slug).maybeSingle()
    if (dup) { console.log(`  → Já existe: ${slug}`); skip++; continue }

    const { data, error } = await admin.from("properties").insert({
      title:          nome,
      slug,
      description:    `Apartamento de ${u.quartos} dormitórios (${u.suites} suíte${u.suites > 1 ? "s" : ""}) no ${u.andar}º andar do Residencial Vista Mar. ${u.area} m² de área privativa com vista privilegiada para o mar. Acabamento de alto padrão, cozinha integrada e sacada gourmet.`,
      price:          u.price,
      features: {
        suites:       u.suites,
        quartos:      u.quartos,
        vagas:        u.vagas,
        area_m2:      u.area,
        andar:        u.andar,
        numero_apto:  u.apto,
        banheiros:    u.suites + 1,
      },
      tags:           u.quartos >= 4 ? ["VM", "CB", "AL"] : u.quartos === 3 ? ["VM", "MD"] : ["VM"],
      status:         u.status,
      visibility:     "publico",
      tipo_negocio:   "venda",
      categoria:      "apartamento",
      neighborhood:   "Centro",
      city:           "Capão da Canoa",
      development_id: dev.id,
      org_id:         dev.org_id,
      images:         imgs(i),
      created_by:     createdBy,
      created_at:     new Date().toISOString(),
      updated_at:     new Date().toISOString(),
    }).select("id, slug").single()

    if (error) {
      console.error(`  ✗ ${slug}: ${error.message}`)
    } else {
      console.log(`  ✓ ${data.slug} (${u.status})`)
      ok++
    }
  }

  console.log(`\nConcluído: ${ok} criados, ${skip} já existiam.`)
}

main().catch(console.error)
