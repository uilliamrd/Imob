"use client"

import { useState, useMemo, useRef, Suspense } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import {
  Search, MapPin, Send, SearchX, ChevronDown, Building2,
  SlidersHorizontal, X, ChevronUp, Check, Phone,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { PropertyCard, IntentChip, SkeletonGrid } from "@/components/ui/premium"
import { PageHeader } from "@/components/dashboard/PageHeader"
import { CATEGORIA_GROUPS } from "@/lib/constants/property-categories"
import type { PropertyFeatures } from "@/types/database"

// ── Types ─────────────────────────────────────────────────────────────────────

export type BuscarProperty = {
  id: string
  code?: number | null
  title: string
  slug: string
  price: number
  neighborhood: string | null
  city: string | null
  images: string[] | null
  status: string
  org_id: string | null
  features: PropertyFeatures | null
  tipo_negocio?: string | null
  tags?: string[] | null
  categoria?: string | null
  development_id?: string | null
  development?: { id: string; name: string } | null
  organization: {
    id: string
    name: string
    slug: string | null
    logo: string | null
    brand_colors: { primary?: string } | null
  } | null
}

export type BuscarConstrutora = {
  id: string
  name: string
  slug: string | null
  logo: string | null
  brand_colors: { primary?: string } | null
}

interface Props {
  properties: BuscarProperty[]
  construtoras: BuscarConstrutora[]
  role: "corretor" | "imobiliaria"
  userName: string
}

// ── Filter config ──────────────────────────────────────────────────────────────

// Grupos derivados de CATEGORIA_GROUPS — cada opção cobre todas as subcategorias do grupo
const TIPO_OPTIONS = [
  { value: "", label: "Todos os tipos", values: [] as string[] },
  ...CATEGORIA_GROUPS.map((g) => ({
    value: g.label.toLowerCase(),
    label: g.label,
    values: g.values,
  })),
]

const PRECO_OPTIONS: { value: string; label: string; min: number; max: number }[] = [
  { value: "", label: "Qualquer preço", min: 0, max: Infinity },
  { value: "0-300000", label: "Até R$ 300 mil", min: 0, max: 300000 },
  { value: "300000-600000", label: "R$ 300 mil – R$ 600 mil", min: 300000, max: 600000 },
  { value: "600000-1000000", label: "R$ 600 mil – R$ 1 mi", min: 600000, max: 1000000 },
  { value: "1000000-2000000", label: "R$ 1 mi – R$ 2 mi", min: 1000000, max: 2000000 },
  { value: "2000000-max", label: "Acima de R$ 2 mi", min: 2000000, max: Infinity },
]

const DORM_OPTIONS = [
  { value: "", label: "Quartos" },
  { value: "1", label: "1+" },
  { value: "2", label: "2+" },
  { value: "3", label: "3+" },
  { value: "4", label: "4+" },
]

const FINALIDADE_OPTIONS = [
  { value: "", label: "Todas as finalidades" },
  { value: "venda", label: "Venda" },
  { value: "aluguel", label: "Aluguel" },
  { value: "temporada", label: "Temporada / Lançamento" },
  { value: "permuta", label: "Permuta" },
]

const FINALIDADE_LABELS: Record<string, string> = {
  venda: "Venda", aluguel: "Aluguel", temporada: "Temporada/Lançamento", permuta: "Permuta",
}

const SITUACAO_OPTIONS = [
  { value: "", label: "Todas as situações" },
  { value: "disponivel", label: "Disponível" },
  { value: "reserva", label: "Reservado" },
  { value: "vendido", label: "Vendido" },
]

const SITUACAO_LABELS: Record<string, string> = {
  disponivel: "Disponível", reserva: "Reservado", vendido: "Vendido",
}

const MOBILIA_OPTIONS = ["Mobiliado", "Semi-mobiliado", "Sem mobília", "Decorado"]

const QUICK_CHIPS = [
  { value: "lancamentos", label: "Lançamentos" },
  { value: "beira-mar", label: "Beira-mar" },
  { value: "alto-padrao", label: "Alto padrão" },
  { value: "pronto", label: "Pronto para morar" },
  { value: "financiavel", label: "Financiável" },
  { value: "piscina", label: "Com piscina" },
]

// Abas de navegação rápida — sem "Coberturas" (categoria removida do cadastro)
const TIPO_TABS = [
  { value: "",            label: "Todos",         values: [] as string[] },
  { value: "apartamento", label: "Apartamentos",  values: CATEGORIA_GROUPS.find((g) => g.label === "Apartamento")?.values ?? [] },
  { value: "casa",        label: "Casas",         values: CATEGORIA_GROUPS.find((g) => g.label === "Casa")?.values ?? [] },
  { value: "lancamento",  label: "Lançamentos",   values: [] as string[] },
]

const PAGE_SIZE = 12

// ── Advanced filter default ────────────────────────────────────────────────────

function initAdv(params: URLSearchParams) {
  return {
    finalidade: params.get("fin") ?? "",
    situacao: params.get("sit") ?? "",
    dormMin: params.get("dormMin") ?? "",
    dormMax: params.get("dormMax") ?? "",
    suitesMin: params.get("sMin") ?? "",
    suitesMax: params.get("sMax") ?? "",
    banhMin: params.get("banhMin") ?? "",
    banhMax: params.get("banhMax") ?? "",
    vagasMin: params.get("vMin") ?? "",
    vagasMax: params.get("vMax") ?? "",
    precoMin: params.get("pMin") ?? "",
    precoMax: params.get("pMax") ?? "",
    areaMin: params.get("aMin") ?? "",
    areaMax: params.get("aMax") ?? "",
    areaTotMin: params.get("atMin") ?? "",
    areaTotMax: params.get("atMax") ?? "",
    cidade: params.get("cid") ?? "",
    bairro: params.get("bairro") ?? "",
    mobilia: params.get("mob")?.split(",").filter(Boolean) ?? ([] as string[]),
    financiavel: params.get("fnc") === "1",
    permuta: params.get("perm") === "1",
    temFotos: params.get("fotos") ?? "",
    codigo: params.get("cod") ?? "",
    development: params.get("dev") ?? "",
  }
}

type AdvFilters = ReturnType<typeof initAdv>
const ADV_EMPTY: AdvFilters = {
  finalidade: "", situacao: "",
  dormMin: "", dormMax: "", suitesMin: "", suitesMax: "",
  banhMin: "", banhMax: "", vagasMin: "", vagasMax: "",
  precoMin: "", precoMax: "", areaMin: "", areaMax: "", areaTotMin: "", areaTotMax: "",
  cidade: "", bairro: "", mobilia: [],
  financiavel: false, permuta: false, temFotos: "", codigo: "",
  development: "",
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function statusBadgeFor(status: string) {
  if (status === "disponivel") return { label: "Disponível", className: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30" }
  if (status === "reserva") return { label: "Reserva", className: "text-amber-600 bg-amber-500/10 border-amber-500/30" }
  return { label: status, className: "text-muted-foreground bg-muted border-border" }
}

function toNum(s: string): number { return parseInt(s.replace(/\D/g, ""), 10) || 0 }
function hasAdv(adv: AdvFilters): boolean {
  return !!(adv.finalidade || adv.situacao || adv.dormMin || adv.dormMax ||
    adv.suitesMin || adv.suitesMax || adv.banhMin || adv.banhMax ||
    adv.vagasMin || adv.vagasMax || adv.precoMin || adv.precoMax ||
    adv.areaMin || adv.areaMax || adv.areaTotMin || adv.areaTotMax || adv.cidade || adv.bairro ||
    adv.mobilia.length || adv.financiavel || adv.permuta || adv.temFotos || adv.codigo || adv.development)
}

// ── Select + input components ──────────────────────────────────────────────────

function Sel({ value, onChange, options, className = "" }: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  className?: string
}) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 pl-3 pr-7 rounded-lg border border-border bg-background text-foreground text-sm font-sans appearance-none focus:outline-none focus:border-[var(--gold)]/60 transition-colors cursor-pointer"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
    </div>
  )
}

function Inp({ value, onChange, placeholder, type = "text", className = "" }: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  className?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full h-10 px-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm font-sans focus:outline-none focus:border-[var(--gold)]/60 transition-colors ${className}`}
    />
  )
}

function RangeRow({ label, minVal, maxVal, onMin, onMax }: {
  label: string
  minVal: string
  maxVal: string
  onMin: (v: string) => void
  onMax: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-xs text-muted-foreground font-sans mb-1.5">{label}</label>
      <div className="flex items-center gap-2">
        <Inp value={minVal} onChange={onMin} placeholder="De" type="number" />
        <span className="text-muted-foreground text-xs shrink-0">–</span>
        <Inp value={maxVal} onChange={onMax} placeholder="Até" type="number" />
      </div>
    </div>
  )
}

// ── Inner component (uses useSearchParams — must be inside Suspense) ───────────

function BuscarImoveisInner({ properties, construtoras, role, userName }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()

  // ── Applied (synced to URL) ────────────────────────────────────────────────
  const [search, setSearch] = useState(params.get("q") ?? "")
  const [filterTipo, setFilterTipo] = useState(params.get("tipo") ?? "")
  const [filterPreco, setFilterPreco] = useState(params.get("preco") ?? "")
  const [filterDorms, setFilterDorms] = useState(params.get("dorms") ?? "")
  const [filterConstrutora, setFilterConstrutora] = useState(params.get("org") ?? "")
  const [activeTab, setActiveTab] = useState(params.get("tab") ?? "")
  const [activeChips, setActiveChips] = useState<string[]>(
    params.get("chips")?.split(",").filter(Boolean) ?? []
  )
  const [adv, setAdv] = useState<AdvFilters>(() => initAdv(params))
  const [page, setPage] = useState(1)

  // ── Pending (before clicking Buscar / Aplicar) ─────────────────────────────
  const [pendingQ, setPendingQ] = useState(search)
  const [pendingTipo, setPendingTipo] = useState(filterTipo)
  const [pendingPreco, setPendingPreco] = useState(filterPreco)
  const [pendingDorms, setPendingDorms] = useState(filterDorms)
  const [pendAdv, setPendAdv] = useState<AdvFilters>(() => initAdv(params))
  const [showAdvanced, setShowAdvanced] = useState(false)

  // ── Autocomplete ───────────────────────────────────────────────────────────
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── URL builder ────────────────────────────────────────────────────────────

  function buildURL(
    q: string, tipo: string, preco: string, dorms: string,
    org: string, tab: string, chips: string[], a: AdvFilters
  ) {
    const p = new URLSearchParams()
    if (q) p.set("q", q)
    if (tipo) p.set("tipo", tipo)
    if (preco) p.set("preco", preco)
    if (dorms) p.set("dorms", dorms)
    if (org) p.set("org", org)
    if (tab) p.set("tab", tab)
    if (chips.length) p.set("chips", chips.join(","))
    if (a.finalidade) p.set("fin", a.finalidade)
    if (a.situacao) p.set("sit", a.situacao)
    if (a.dormMin) p.set("dormMin", a.dormMin)
    if (a.dormMax) p.set("dormMax", a.dormMax)
    if (a.suitesMin) p.set("sMin", a.suitesMin)
    if (a.suitesMax) p.set("sMax", a.suitesMax)
    if (a.banhMin) p.set("banhMin", a.banhMin)
    if (a.banhMax) p.set("banhMax", a.banhMax)
    if (a.vagasMin) p.set("vMin", a.vagasMin)
    if (a.vagasMax) p.set("vMax", a.vagasMax)
    if (a.precoMin) p.set("pMin", a.precoMin)
    if (a.precoMax) p.set("pMax", a.precoMax)
    if (a.areaMin) p.set("aMin", a.areaMin)
    if (a.areaMax) p.set("aMax", a.areaMax)
    if (a.areaTotMin) p.set("atMin", a.areaTotMin)
    if (a.areaTotMax) p.set("atMax", a.areaTotMax)
    if (a.cidade) p.set("cid", a.cidade)
    if (a.bairro) p.set("bairro", a.bairro)
    if (a.mobilia.length) p.set("mob", a.mobilia.join(","))
    if (a.financiavel) p.set("fnc", "1")
    if (a.permuta) p.set("perm", "1")
    if (a.temFotos) p.set("fotos", a.temFotos)
    if (a.codigo) p.set("cod", a.codigo)
    if (a.development) p.set("dev", a.development)
    const qs = p.toString()
    router.replace(pathname + (qs ? "?" + qs : ""), { scroll: false })
  }

  // ── Apply simple bar ───────────────────────────────────────────────────────

  function applySearch() {
    setSearch(pendingQ)
    setFilterTipo(pendingTipo)
    setFilterPreco(pendingPreco)
    setFilterDorms(pendingDorms)
    setPage(1)
    buildURL(pendingQ, pendingTipo, pendingPreco, pendingDorms, filterConstrutora, activeTab, activeChips, adv)
  }

  // ── Apply advanced filters ─────────────────────────────────────────────────

  function applyAdvanced() {
    setAdv(pendAdv)
    setPage(1)
    buildURL(search, filterTipo, filterPreco, filterDorms, filterConstrutora, activeTab, activeChips, pendAdv)
    setShowAdvanced(false)
  }

  function clearAdvanced() {
    setPendAdv(ADV_EMPTY)
    setAdv(ADV_EMPTY)
    setPage(1)
    buildURL(search, filterTipo, filterPreco, filterDorms, filterConstrutora, activeTab, activeChips, ADV_EMPTY)
  }

  // ── Quick-apply (construtora, tab, chips) ──────────────────────────────────

  function applyOrg(orgId: string) {
    const next = filterConstrutora === orgId ? "" : orgId
    setFilterConstrutora(next)
    setPage(1)
    buildURL(search, filterTipo, filterPreco, filterDorms, next, activeTab, activeChips, adv)
  }

  function applyTab(tab: string) {
    setActiveTab(tab)
    setPage(1)
    buildURL(search, filterTipo, filterPreco, filterDorms, filterConstrutora, tab, activeChips, adv)
  }

  function applyChip(chip: string) {
    const next = activeChips.includes(chip) ? activeChips.filter((c) => c !== chip) : [...activeChips, chip]
    setActiveChips(next)
    setPage(1)
    buildURL(search, filterTipo, filterPreco, filterDorms, filterConstrutora, activeTab, next, adv)
  }

  // ── Remove individual filters ──────────────────────────────────────────────

  function removeSimple(key: "q" | "tipo" | "preco" | "dorms") {
    const q2 = key === "q" ? "" : search
    const t2 = key === "tipo" ? "" : filterTipo
    const p2 = key === "preco" ? "" : filterPreco
    const d2 = key === "dorms" ? "" : filterDorms
    setSearch(q2); setPendingQ(q2)
    setFilterTipo(t2); setPendingTipo(t2)
    setFilterPreco(p2); setPendingPreco(p2)
    setFilterDorms(d2); setPendingDorms(d2)
    setPage(1)
    buildURL(q2, t2, p2, d2, filterConstrutora, activeTab, activeChips, adv)
  }

  function removeAdvField(key: keyof AdvFilters) {
    const val = Array.isArray(adv[key]) ? [] : typeof adv[key] === "boolean" ? false : ""
    const newAdv = { ...adv, [key]: val } as AdvFilters
    setAdv(newAdv)
    setPendAdv(newAdv)
    setPage(1)
    buildURL(search, filterTipo, filterPreco, filterDorms, filterConstrutora, activeTab, activeChips, newAdv)
  }

  function clearAll() {
    setSearch(""); setPendingQ("")
    setFilterTipo(""); setPendingTipo("")
    setFilterPreco(""); setPendingPreco("")
    setFilterDorms(""); setPendingDorms("")
    setFilterConstrutora("")
    setActiveTab("")
    setActiveChips([])
    setAdv(ADV_EMPTY)
    setPendAdv(ADV_EMPTY)
    setPage(1)
    router.replace(pathname, { scroll: false })
  }

  // ── Autocomplete ───────────────────────────────────────────────────────────

  function handleLocationInput(val: string) {
    setPendingQ(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      if (!val.trim()) { setSuggestions([]); return }
      const lower = val.toLowerCase()
      const places = Array.from(new Set(
        properties
          .flatMap((p) => [p.neighborhood, p.city].filter(Boolean) as string[])
          .filter((s) => s.toLowerCase().includes(lower))
      )).slice(0, 6)
      setSuggestions(places)
      setShowSuggestions(places.length > 0)
    }, 300)
  }

  // ── PendAdv helper ─────────────────────────────────────────────────────────

  function pset<K extends keyof AdvFilters>(key: K, val: AdvFilters[K]) {
    setPendAdv((prev) => ({ ...prev, [key]: val }))
  }

  function toggleMobilia(opt: string) {
    setPendAdv((prev) => ({
      ...prev,
      mobilia: prev.mobilia.includes(opt) ? prev.mobilia.filter((m) => m !== opt) : [...prev.mobilia, opt],
    }))
  }

  // ── Filtering ─────────────────────────────────────────────────────────────

  const precoRange = PRECO_OPTIONS.find((o) => o.value === filterPreco) ?? PRECO_OPTIONS[0]
  const minDorms = filterDorms ? parseInt(filterDorms) : 0

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      const feat = p.features as PropertyFeatures | null
      const tags = (p.tags ?? []).map((t) => t.toLowerCase())

      // Simple bar
      const q = search.toLowerCase()
      const matchSearch = !q
        || p.title.toLowerCase().includes(q)
        || (p.neighborhood ?? "").toLowerCase().includes(q)
        || (p.city ?? "").toLowerCase().includes(q)

      // Compara contra todas as subcategorias do grupo selecionado
      const tipoGroup = TIPO_OPTIONS.find((o) => o.value === filterTipo.toLowerCase())
      const matchTipo = !filterTipo
        || (tipoGroup?.values ?? []).some((v) => (p.categoria ?? "").toLowerCase() === v.toLowerCase())
      const matchPreco = !filterPreco || (p.price >= precoRange.min && p.price <= precoRange.max)
      const dorms = feat?.suites ?? feat?.dormitorios ?? feat?.quartos ?? 0
      const matchDorms = !minDorms || dorms >= minDorms
      const matchOrg = !filterConstrutora || p.org_id === filterConstrutora

      // Tab — compara contra todas as subcategorias do grupo da aba
      let matchTab = true
      if (activeTab === "lancamento") matchTab = tags.some((t) => t.includes("lança") || t.includes("lanca"))
      else if (activeTab) {
        const tab = TIPO_TABS.find((t) => t.value === activeTab)
        matchTab = (tab?.values ?? []).some((v) => (p.categoria ?? "").toLowerCase() === v.toLowerCase())
      }

      // Quick chips
      const matchChips = activeChips.every((chip) => {
        if (chip === "lancamentos") return tags.some((t) => t.includes("lança") || t.includes("lanca"))
        if (chip === "beira-mar") return tags.some((t) => t.includes("beira") || t.includes("mar") || t.includes("praia"))
        if (chip === "alto-padrao") return tags.some((t) => t.includes("alto") || t.includes("padrão") || t.includes("padrao") || t.includes("luxo"))
        if (chip === "pronto") return tags.some((t) => t.includes("pronto") || t.includes("entrega"))
        if (chip === "financiavel") return tags.some((t) => t.includes("financ"))
        if (chip === "piscina") return tags.some((t) => t.includes("piscina"))
        return true
      })

      // Advanced
      const matchFinalidade = !adv.finalidade || (p.tipo_negocio ?? "") === adv.finalidade
      const matchSituacao = !adv.situacao || p.status === adv.situacao

      const dormNum = feat?.dormitorios ?? feat?.suites ?? feat?.quartos ?? 0
      const matchDormMin = !adv.dormMin || dormNum >= parseInt(adv.dormMin)
      const matchDormMax = !adv.dormMax || dormNum <= parseInt(adv.dormMax)

      const suites = feat?.suites ?? 0
      const matchSuitesMin = !adv.suitesMin || suites >= parseInt(adv.suitesMin)
      const matchSuitesMax = !adv.suitesMax || suites <= parseInt(adv.suitesMax)

      const banh = feat?.banheiros ?? 0
      const matchBanhMin = !adv.banhMin || banh >= parseInt(adv.banhMin)
      const matchBanhMax = !adv.banhMax || banh <= parseInt(adv.banhMax)

      const vagas = feat?.vagas ?? 0
      const matchVagasMin = !adv.vagasMin || vagas >= parseInt(adv.vagasMin)
      const matchVagasMax = !adv.vagasMax || vagas <= parseInt(adv.vagasMax)

      const matchPMin = !adv.precoMin || p.price >= toNum(adv.precoMin)
      const matchPMax = !adv.precoMax || p.price <= toNum(adv.precoMax)

      const area = feat?.area_m2 ?? 0
      const matchAreaMin = !adv.areaMin || area >= parseInt(adv.areaMin)
      const matchAreaMax = !adv.areaMax || area <= parseInt(adv.areaMax)
      const areaTot = (feat?.area_total ?? feat?.area_terreno ?? 0) as number
      const matchAreaTotMin = !adv.areaTotMin || areaTot >= parseInt(adv.areaTotMin)
      const matchAreaTotMax = !adv.areaTotMax || areaTot <= parseInt(adv.areaTotMax)

      const matchCidade = !adv.cidade || (p.city ?? "").toLowerCase().includes(adv.cidade.toLowerCase())
      const matchBairro = !adv.bairro || (p.neighborhood ?? "").toLowerCase().includes(adv.bairro.toLowerCase())

      const mob = (feat?.mobiliado ?? "").toLowerCase()
      const matchMobilia = adv.mobilia.length === 0
        || adv.mobilia.some((m) => mob.includes(m.toLowerCase()))

      const matchFinanciavel = !adv.financiavel || tags.some((t) => t.includes("financ"))
      const matchPermuta = !adv.permuta
        || tags.some((t) => t.includes("permut"))
        || (p.tipo_negocio ?? "") === "permuta"

      const imgs = p.images ?? []
      const matchFotos = !adv.temFotos || adv.temFotos === "all"
        || (adv.temFotos === "yes" && imgs.length > 0)
        || (adv.temFotos === "no" && imgs.length === 0)

      const matchCodigo = !adv.codigo || adv.codigo.split(",")
        .map((s) => s.trim())
        .some((c) => c && String(p.code ?? "") === c)

      const matchDevelopment = !adv.development || p.development_id === adv.development

      return (
        matchSearch && matchTipo && matchPreco && matchDorms && matchOrg && matchTab && matchChips &&
        matchFinalidade && matchSituacao &&
        matchDormMin && matchDormMax && matchSuitesMin && matchSuitesMax &&
        matchBanhMin && matchBanhMax && matchVagasMin && matchVagasMax &&
        matchPMin && matchPMax && matchAreaMin && matchAreaMax && matchAreaTotMin && matchAreaTotMax &&
        matchCidade && matchBairro && matchMobilia &&
        matchFinanciavel && matchPermuta && matchFotos && matchCodigo && matchDevelopment
      )
    })
  }, [
    properties, search, filterTipo, filterPreco, filterDorms, filterConstrutora, activeTab, activeChips,
    adv, precoRange, minDorms,
  ])

  const paginated = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = filtered.length > paginated.length

  // ── Developments derived from data ─────────────────────────────────────────
  const devOptions = useMemo(() =>
    Array.from(
      new Map(
        properties
          .filter((p) => p.development)
          .map((p) => [p.development!.id, p.development!])
      ).values()
    ).sort((a, b) => a.name.localeCompare(b.name, "pt-BR"))
  , [properties])

  // ── Active filter chips ────────────────────────────────────────────────────

  const activeFilterChips = useMemo(() => {
    const chips: { key: string; label: string; clear: () => void }[] = []
    if (search) chips.push({ key: "q", label: `"${search}"`, clear: () => removeSimple("q") })
    if (filterTipo) chips.push({ key: "tipo", label: filterTipo, clear: () => removeSimple("tipo") })
    if (filterPreco) chips.push({ key: "preco", label: PRECO_OPTIONS.find((o) => o.value === filterPreco)?.label ?? filterPreco, clear: () => removeSimple("preco") })
    if (minDorms) chips.push({ key: "dorms", label: `${minDorms}+ quartos`, clear: () => removeSimple("dorms") })
    if (adv.finalidade) chips.push({ key: "fin", label: FINALIDADE_LABELS[adv.finalidade] ?? adv.finalidade, clear: () => removeAdvField("finalidade") })
    if (adv.situacao) chips.push({ key: "sit", label: SITUACAO_LABELS[adv.situacao] ?? adv.situacao, clear: () => removeAdvField("situacao") })
    if (adv.dormMin || adv.dormMax) chips.push({ key: "dorm", label: `Dorms: ${adv.dormMin || "0"}–${adv.dormMax || "∞"}`, clear: () => { removeAdvField("dormMin"); removeAdvField("dormMax") } })
    if (adv.suitesMin || adv.suitesMax) chips.push({ key: "suit", label: `Suítes: ${adv.suitesMin || "0"}–${adv.suitesMax || "∞"}`, clear: () => { removeAdvField("suitesMin"); removeAdvField("suitesMax") } })
    if (adv.banhMin || adv.banhMax) chips.push({ key: "banh", label: `Banh: ${adv.banhMin || "0"}–${adv.banhMax || "∞"}`, clear: () => { removeAdvField("banhMin"); removeAdvField("banhMax") } })
    if (adv.vagasMin || adv.vagasMax) chips.push({ key: "vaga", label: `Vagas: ${adv.vagasMin || "0"}–${adv.vagasMax || "∞"}`, clear: () => { removeAdvField("vagasMin"); removeAdvField("vagasMax") } })
    if (adv.precoMin || adv.precoMax) chips.push({ key: "prange", label: `R$ ${adv.precoMin || "0"} – ${adv.precoMax || "∞"}`, clear: () => { removeAdvField("precoMin"); removeAdvField("precoMax") } })
    if (adv.areaMin || adv.areaMax) chips.push({ key: "area", label: `Área priv.: ${adv.areaMin || "0"}–${adv.areaMax || "∞"} m²`, clear: () => { removeAdvField("areaMin"); removeAdvField("areaMax") } })
    if (adv.areaTotMin || adv.areaTotMax) chips.push({ key: "areatot", label: `Área total: ${adv.areaTotMin || "0"}–${adv.areaTotMax || "∞"} m²`, clear: () => { removeAdvField("areaTotMin"); removeAdvField("areaTotMax") } })
    if (adv.cidade) chips.push({ key: "cid", label: `Cidade: ${adv.cidade}`, clear: () => removeAdvField("cidade") })
    if (adv.bairro) chips.push({ key: "bairro", label: `Bairro: ${adv.bairro}`, clear: () => removeAdvField("bairro") })
    if (adv.mobilia.length) chips.push({ key: "mob", label: adv.mobilia.join(", "), clear: () => removeAdvField("mobilia") })
    if (adv.financiavel) chips.push({ key: "fnc", label: "Financiável", clear: () => removeAdvField("financiavel") })
    if (adv.permuta) chips.push({ key: "perm", label: "Permuta", clear: () => removeAdvField("permuta") })
    if (adv.temFotos === "yes") chips.push({ key: "fotos", label: "Com fotos", clear: () => removeAdvField("temFotos") })
    if (adv.temFotos === "no") chips.push({ key: "fotos", label: "Sem fotos", clear: () => removeAdvField("temFotos") })
    if (adv.codigo) chips.push({ key: "cod", label: `Cód: ${adv.codigo}`, clear: () => removeAdvField("codigo") })
    if (adv.development) {
      const dev = devOptions.find((d) => d.id === adv.development)
      if (dev) chips.push({ key: "dev", label: `Empreend.: ${dev.name}`, clear: () => removeAdvField("development") })
    }
    if (filterConstrutora) {
      const org = construtoras.find((c) => c.id === filterConstrutora)
      if (org) chips.push({ key: "org", label: org.name, clear: () => { setFilterConstrutora(""); buildURL(search, filterTipo, filterPreco, filterDorms, "", activeTab, activeChips, adv) } })
    }
    return chips
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filterTipo, filterPreco, filterDorms, filterConstrutora, adv, minDorms, construtoras, activeChips, devOptions])

  const hasAnyFilter = activeFilterChips.length > 0 || activeChips.length > 0
  const activeConst = construtoras.find((c) => c.id === filterConstrutora)
  const gridTitle = activeConst
    ? `Imóveis da ${activeConst.name}`
    : hasAnyFilter ? `${filtered.length} imóveis encontrados`
    : "Todos os imóveis disponíveis"

  const roleLabel = role === "corretor" ? "Corretor" : "Imobiliária"
  const advActive = hasAdv(adv)

  // ── Cities derived from data ───────────────────────────────────────────────
  const availCidades = useMemo(() =>
    Array.from(new Set(properties.map((p) => p.city).filter(Boolean) as string[])).sort()
  , [properties])

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">

      {/* Page header */}
      <PageHeader
        title="Base de Imóveis"
        subtitle="Busque na base completa de imóveis e compartilhe com seus clientes."
        category={roleLabel}
      />

      {/* ── Bloco 1: Filtros ──────────────────────────────────────────────── */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">

        {/* Linha simples */}
        <div className="flex flex-col lg:flex-row gap-2.5">

          {/* Tipo */}
          <Sel
            value={pendingTipo}
            onChange={setPendingTipo}
            options={TIPO_OPTIONS}
            className="lg:w-44 shrink-0"
          />

          {/* Localização com autocomplete */}
          <div className="relative flex-1 min-w-0">
            <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
            <input
              type="text"
              value={pendingQ}
              onChange={(e) => handleLocationInput(e.target.value)}
              onFocus={() => suggestions.length && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              onKeyDown={(e) => e.key === "Enter" && applySearch()}
              placeholder="Cidade ou bairro"
              className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm font-sans focus:outline-none focus:border-[var(--gold)]/60 transition-colors"
            />
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-11 left-0 right-0 z-20 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={() => { setPendingQ(s); setSuggestions([]); setShowSuggestions(false) }}
                    className="w-full text-left px-4 py-2.5 text-sm font-sans text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <MapPin size={12} className="text-muted-foreground shrink-0" />
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Preço */}
          <Sel
            value={pendingPreco}
            onChange={setPendingPreco}
            options={PRECO_OPTIONS}
            className="lg:w-52 shrink-0"
          />

          {/* Quartos */}
          <Sel
            value={pendingDorms}
            onChange={setPendingDorms}
            options={DORM_OPTIONS}
            className="lg:w-36 shrink-0"
          />

          {/* Buscar */}
          <button
            type="button"
            onClick={applySearch}
            className="h-10 px-5 rounded-lg bg-[var(--gold)] text-[#0a0a0a] font-sans font-semibold text-sm hover:bg-[var(--gold-light)] transition-colors flex items-center justify-center gap-2 whitespace-nowrap w-full lg:w-auto shrink-0"
          >
            <Search size={14} />
            Buscar
          </button>
        </div>

        {/* Toggle filtros avançados */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setShowAdvanced((v) => !v)}
            className={`flex items-center gap-1.5 text-sm font-sans transition-colors ${advActive ? "text-[var(--gold)] font-medium" : "text-muted-foreground hover:text-[var(--gold)]"}`}
          >
            <SlidersHorizontal size={14} />
            Filtros avançados
            {advActive && <span className="ml-1 text-[10px] bg-[var(--gold)] text-[#0a0a0a] rounded-full px-1.5 py-0.5 font-bold">ON</span>}
            {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_CHIPS.map((chip) => (
              <IntentChip
                key={chip.value}
                label={chip.label}
                active={activeChips.includes(chip.value)}
                onClick={() => applyChip(chip.value)}
              />
            ))}
          </div>
        </div>

        {/* Painel avançado */}
        <AnimatePresence initial={false}>
          {showAdvanced && (
            <motion.div
              key="adv"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="pt-4 border-t border-border/60 space-y-5">
                {/* Linha 1 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-muted-foreground font-sans mb-1.5">Finalidade</label>
                    <Sel value={pendAdv.finalidade} onChange={(v) => pset("finalidade", v)} options={FINALIDADE_OPTIONS} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground font-sans mb-1.5">Situação</label>
                    <Sel value={pendAdv.situacao} onChange={(v) => pset("situacao", v)} options={SITUACAO_OPTIONS} />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground font-sans mb-1.5">Tipo de imóvel</label>
                    <Sel
                      value={pendingTipo}
                      onChange={setPendingTipo}
                      options={TIPO_OPTIONS}
                    />
                  </div>
                  {devOptions.length > 0 && (
                    <div>
                      <label className="block text-xs text-muted-foreground font-sans mb-1.5">Empreendimento</label>
                      <Sel
                        value={pendAdv.development}
                        onChange={(v) => pset("development", v)}
                        options={[
                          { value: "", label: "Todos os empreendimentos" },
                          ...devOptions.map((d) => ({ value: d.id, label: d.name })),
                        ]}
                      />
                    </div>
                  )}
                </div>

                {/* Linha 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <RangeRow label="Dormitórios" minVal={pendAdv.dormMin} maxVal={pendAdv.dormMax} onMin={(v) => pset("dormMin", v)} onMax={(v) => pset("dormMax", v)} />
                  <RangeRow label="Suítes" minVal={pendAdv.suitesMin} maxVal={pendAdv.suitesMax} onMin={(v) => pset("suitesMin", v)} onMax={(v) => pset("suitesMax", v)} />
                  <RangeRow label="Banheiros" minVal={pendAdv.banhMin} maxVal={pendAdv.banhMax} onMin={(v) => pset("banhMin", v)} onMax={(v) => pset("banhMax", v)} />
                </div>

                {/* Linha 3 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <RangeRow label="Vagas" minVal={pendAdv.vagasMin} maxVal={pendAdv.vagasMax} onMin={(v) => pset("vagasMin", v)} onMax={(v) => pset("vagasMax", v)} />
                  <div>
                    <label className="block text-xs text-muted-foreground font-sans mb-1.5">Valor De / Até (R$)</label>
                    <div className="flex items-center gap-2">
                      <Inp value={pendAdv.precoMin} onChange={(v) => pset("precoMin", v)} placeholder="De" type="number" />
                      <span className="text-muted-foreground text-xs shrink-0">–</span>
                      <Inp value={pendAdv.precoMax} onChange={(v) => pset("precoMax", v)} placeholder="Até" type="number" />
                    </div>
                  </div>
                  <RangeRow label="Área privativa (m²)" minVal={pendAdv.areaMin} maxVal={pendAdv.areaMax} onMin={(v) => pset("areaMin", v)} onMax={(v) => pset("areaMax", v)} />
                  <RangeRow label="Área total / terreno (m²)" minVal={pendAdv.areaTotMin} maxVal={pendAdv.areaTotMax} onMin={(v) => pset("areaTotMin", v)} onMax={(v) => pset("areaTotMax", v)} />
                </div>

                {/* Linha 4 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-muted-foreground font-sans mb-1.5">Cidade</label>
                    <div className="relative">
                      <select
                        value={pendAdv.cidade}
                        onChange={(e) => pset("cidade", e.target.value)}
                        className="w-full h-10 pl-3 pr-7 rounded-lg border border-border bg-background text-foreground text-sm font-sans appearance-none focus:outline-none focus:border-[var(--gold)]/60 transition-colors cursor-pointer"
                      >
                        <option value="">Todas as cidades</option>
                        {availCidades.map((c) => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground font-sans mb-1.5">Bairro</label>
                    <Inp value={pendAdv.bairro} onChange={(v) => pset("bairro", v)} placeholder="Nome do bairro" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground font-sans mb-1.5">Código do imóvel</label>
                    <Inp value={pendAdv.codigo} onChange={(v) => pset("codigo", v)} placeholder="Ex: 123, 456" />
                  </div>
                </div>

                {/* Linha 5 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Facilidades */}
                  <div>
                    <label className="block text-xs text-muted-foreground font-sans mb-2">Facilidades de pagamento</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: "financiavel", label: "Financiável" },
                        { key: "permuta", label: "Permuta" },
                      ].map(({ key, label }) => {
                        const active = key === "financiavel" ? pendAdv.financiavel : pendAdv.permuta
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => pset(key as "financiavel" | "permuta", !active)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans border transition-all ${
                              active
                                ? "bg-[var(--gold)]/10 border-[var(--gold)]/40 text-[var(--gold)]"
                                : "bg-transparent border-border text-muted-foreground hover:border-[var(--gold)]/30"
                            }`}
                          >
                            {active && <Check size={11} />}
                            {label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Mobília */}
                  <div>
                    <label className="block text-xs text-muted-foreground font-sans mb-2">Mobília</label>
                    <div className="flex flex-wrap gap-2">
                      {MOBILIA_OPTIONS.map((opt) => {
                        const active = pendAdv.mobilia.includes(opt)
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => toggleMobilia(opt)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans border transition-all ${
                              active
                                ? "bg-[var(--gold)]/10 border-[var(--gold)]/40 text-[var(--gold)]"
                                : "bg-transparent border-border text-muted-foreground hover:border-[var(--gold)]/30"
                            }`}
                          >
                            {active && <Check size={11} />}
                            {opt}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Linha 6 */}
                <div>
                  <label className="block text-xs text-muted-foreground font-sans mb-2">Fotos</label>
                  <div className="flex gap-2">
                    {[{ v: "", l: "Todos" }, { v: "yes", l: "Com fotos" }, { v: "no", l: "Sem fotos" }].map(({ v, l }) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => pset("temFotos", v)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-sans border transition-all ${
                          pendAdv.temFotos === v
                            ? "bg-[var(--gold)]/10 border-[var(--gold)]/40 text-[var(--gold)]"
                            : "bg-transparent border-border text-muted-foreground hover:border-[var(--gold)]/30"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Rodapé */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <button
                    type="button"
                    onClick={clearAdvanced}
                    className="text-sm font-sans text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Limpar filtros
                  </button>
                  <button
                    type="button"
                    onClick={applyAdvanced}
                    className="h-9 px-5 rounded-lg bg-[var(--gold)] text-[#0a0a0a] font-sans font-semibold text-sm hover:bg-[var(--gold-light)] transition-colors"
                  >
                    Aplicar filtros
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Chips de filtros ativos ────────────────────────────────────────── */}
      {activeFilterChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeFilterChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.clear}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-sans bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/30 hover:bg-[var(--gold)]/20 transition-colors"
            >
              {chip.label}
              <X size={11} />
            </button>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-sans text-muted-foreground hover:text-foreground underline-offset-2 hover:underline transition-colors ml-1"
          >
            Limpar todos
          </button>
        </div>
      )}

      {/* ── Bloco 2: Construtoras parceiras ───────────────────────────────── */}
      {construtoras.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground font-sans mb-2.5">
            Construtoras Parceiras
          </p>
          <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {construtoras.map((org) => {
              const accent = org.brand_colors?.primary ?? "#C4A052"
              const isActive = filterConstrutora === org.id
              return (
                <button
                  key={org.id}
                  type="button"
                  onClick={() => applyOrg(org.id)}
                  className={`flex-shrink-0 flex items-center gap-2.5 rounded-xl px-4 py-2.5 border transition-all text-sm font-sans ${
                    isActive
                      ? "bg-[var(--forest)]/5 border-[var(--forest)]/50 text-foreground"
                      : "bg-card border-border hover:border-[var(--gold)]/30 text-foreground/70 hover:text-foreground"
                  }`}
                >
                  {org.logo ? (
                    <Image src={org.logo} alt={org.name} width={56} height={16} className="h-4 w-auto object-contain" />
                  ) : (
                    <div className="w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: accent + "20" }}>
                      <Building2 size={10} style={{ color: accent }} />
                    </div>
                  )}
                  <span className="whitespace-nowrap">{org.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Bloco 3: Grid de imóveis ───────────────────────────────────────── */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
          <h2 className="font-serif text-lg font-semibold text-foreground leading-tight">
            {gridTitle}
          </h2>
          <div className="flex items-center overflow-x-auto scrollbar-none border-b border-border shrink-0">
            {TIPO_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => applyTab(tab.value)}
                className={`px-4 py-2 text-sm font-sans whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  activeTab === tab.value
                    ? "border-[var(--gold)] text-[var(--gold)] font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-4 text-center">
            <SearchX size={40} className="text-muted-foreground/25" />
            <div>
              <p className="font-serif text-base font-semibold text-foreground">Nenhum imóvel encontrado</p>
              <p className="text-muted-foreground text-sm font-sans mt-1">
                Tente ajustar os filtros ou buscar por outro termo.
              </p>
            </div>
            <button
              type="button"
              onClick={clearAll}
              className="px-4 py-2 text-sm font-sans text-muted-foreground hover:text-foreground border border-border rounded-lg hover:border-[var(--gold)]/30 transition-colors"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginated.map((p) => (
                <div key={p.id} className="relative group/card">
                  <PropertyCard
                    id={p.id}
                    slug={p.slug}
                    title={p.title}
                    price={p.price}
                    neighborhood={p.neighborhood}
                    city={p.city}
                    images={p.images ?? []}
                    quartos={
                      (p.features as PropertyFeatures | null)?.suites
                      ?? (p.features as PropertyFeatures | null)?.dormitorios
                      ?? null
                    }
                    vagas={(p.features as PropertyFeatures | null)?.vagas ?? null}
                    area_m2={(p.features as PropertyFeatures | null)?.area_m2 ?? null}
                    tipo_negocio={p.tipo_negocio ?? undefined}
                    statusBadge={statusBadgeFor(p.status)}
                    href={`/dashboard/imoveis/${p.id}`}
                  />
                  {/* Overlay — Disparar anúncio */}
                  <div className="absolute bottom-[4.25rem] left-3 right-3 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 pointer-events-none group-hover/card:pointer-events-auto z-10">
                    <Link
                      href="/dashboard/anuncios"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-card/90 backdrop-blur-sm border border-[var(--gold)]/40 text-[var(--gold)] text-xs font-sans font-medium hover:bg-[var(--gold)] hover:text-[#0a0a0a] transition-all duration-150 shadow-sm"
                    >
                      <Send size={12} />
                      Disparar anúncio
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  type="button"
                  onClick={() => setPage((prev) => prev + 1)}
                  className="px-8 py-2.5 rounded-xl border border-border text-foreground text-sm font-sans hover:border-[var(--gold)]/40 hover:text-[var(--gold)] transition-colors"
                >
                  Carregar mais
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ── Public export — wrapped in Suspense (required by useSearchParams) ──────────

export function BuscarImoveisClient(props: Props) {
  return (
    <Suspense fallback={<SkeletonGrid count={9} />}>
      <BuscarImoveisInner {...props} />
    </Suspense>
  )
}
