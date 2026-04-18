import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import OpenAI from "openai"

const ALLOWED_ROLES = ["admin", "imobiliaria", "corretor", "construtora"]

async function getAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const admin = createAdminClient()
  const { data: p } = await admin.from("profiles").select("role").eq("id", user.id).single()
  if (!p || !ALLOWED_ROLES.includes(p.role)) return null
  return user
}

export async function POST(request: Request) {
  const user = await getAuth()
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 403 })

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY não configurada" }, { status: 500 })

  const body = await request.json()
  const {
    categoria, tipo_negocio, price, neighborhood, city,
    features = {}, tags = [], development_name,
  } = body

  const tipoLabel: Record<string, string> = {
    venda: "venda", aluguel: "aluguel", temporada: "temporada", permuta: "permuta",
  }

  const parts: string[] = []
  if (categoria)    parts.push(`Tipo: ${categoria} para ${tipoLabel[tipo_negocio] ?? tipo_negocio}`)
  if (neighborhood || city) parts.push(`Localização: ${[neighborhood, city].filter(Boolean).join(", ")}`)
  if (price)        parts.push(`Preço: R$ ${Number(price).toLocaleString("pt-BR")}`)
  if (features.suites)   parts.push(`${features.suites} suíte${features.suites > 1 ? "s" : ""}`)
  if (features.quartos)  parts.push(`${features.quartos} dormitório${features.quartos > 1 ? "s" : ""}`)
  if (features.vagas)    parts.push(`${features.vagas} vaga${features.vagas > 1 ? "s" : ""} de garagem`)
  if (features.area_m2)  parts.push(`${features.area_m2}m² privativos`)
  if (features.banheiros) parts.push(`${features.banheiros} banheiro${features.banheiros > 1 ? "s" : ""}`)
  if (features.andar)    parts.push(`${features.andar}º andar`)
  if (features.mobiliado && features.mobiliado !== "Sem mobília") parts.push(features.mobiliado)
  if (development_name)  parts.push(`Empreendimento: ${development_name}`)
  if (tags.length > 0)   parts.push(`Diferenciais: ${tags.join(", ")}`)

  const userPrompt = `Gere conteúdo de marketing para este imóvel de alto padrão:
${parts.map((p) => `- ${p}`).join("\n")}

Responda APENAS com JSON válido no formato abaixo, sem texto extra:
{"title": "...", "description": "...", "slug": "..."}

Regras:
- title: até 70 caracteres, atrativo, menciona categoria e localização
- description: 2 parágrafos curtos (6–8 linhas total), persuasivo, menciona principais características e diferenciais, inclui palavras-chave SEO para imóveis
- slug: kebab-case sem acentos baseado no título (ex: "apartamento-4-suites-leblon")`

  try {
    const openai = new OpenAI({ apiKey })
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 600,
      temperature: 0.7,
      messages: [
        {
          role: "system",
          content: "Você é um redator especializado em imóveis de alto padrão no Brasil. Escreva em português do Brasil. Seja conciso, persuasivo e inclua palavras-chave para SEO imobiliário. Responda SEMPRE com JSON válido.",
        },
        { role: "user", content: userPrompt },
      ],
    })

    const raw = completion.choices[0]?.message?.content ?? ""
    const match = raw.match(/\{[\s\S]*\}/)
    if (!match) throw new Error("Resposta inválida do modelo")

    const parsed = JSON.parse(match[0]) as { title?: string; description?: string; slug?: string }
    return NextResponse.json({
      title: parsed.title ?? "",
      description: parsed.description ?? "",
      slug: parsed.slug ?? "",
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro ao gerar conteúdo"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
