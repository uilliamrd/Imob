"use client"

import { useState } from "react"
import type { PortalProperty, PortalOrg } from "@/app/(portal)/page"
import { HeroSection } from "@/components/portal/home/HeroSection"
import { SearchFloatingCard } from "@/components/portal/home/SearchFloatingCard"
import { FeaturedBuilders } from "@/components/portal/home/FeaturedBuilders"
import { FeaturedAgencies } from "@/components/portal/home/FeaturedAgencies"
import { PropertiesGrid } from "@/components/portal/home/PropertiesGrid"
import { ExploreByCity } from "@/components/portal/home/ExploreByCity"
import { SocialProof } from "@/components/portal/home/SocialProof"
import { FinalCTA } from "@/components/portal/home/FinalCTA"

interface Props {
  properties: PortalProperty[]
  construtoras: PortalOrg[]
  imobiliarias: PortalOrg[]
  superDestaques: PortalProperty[]
  destaqueIds: Set<string>
  heroImage: string | null
}

function parseBRNumber(val: string): number {
  return parseInt(val.replace(/\./g, "").replace(",", ".")) || 0
}

function maskBRNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  if (!digits) return ""
  return Number(digits).toLocaleString("pt-BR")
}

export function PortalHome({ properties, construtoras, imobiliarias, superDestaques, destaqueIds, heroImage }: Props) {
  const [search, setSearch]             = useState("")
  const [filterNegocio, setNegocio]     = useState("")
  const [filterCategoria, setCategoria] = useState("")
  const [filterCity, setCity]           = useState("")
  const [filterBairro, setBairro]       = useState("")
  const [filterBeds, setBeds]           = useState("")
  const [filterVagas, setVagas]         = useState("")
  const [priceMin, setPriceMin]         = useState("")
  const [priceMax, setPriceMax]         = useState("")
  const [filterOrg, setOrg]             = useState("")
  const [showFilters, setShowFilters]   = useState(false)

  const cityOptions = Array.from(
    new Set(properties.map((p) => p.city).filter(Boolean) as string[])
  ).sort((a, b) => a.localeCompare(b, "pt-BR"))

  const bairroOptions = Array.from(
    new Set(
      properties
        .filter((p) => !filterCity || p.city === filterCity)
        .map((p) => p.neighborhood)
        .filter(Boolean) as string[]
    )
  ).sort((a, b) => a.localeCompare(b, "pt-BR"))

  const activeFilters = [filterNegocio, filterCategoria, filterCity, filterBairro, filterBeds, filterVagas, priceMin, priceMax, filterOrg].filter(Boolean).length

  function clearAll() {
    setSearch(""); setNegocio(""); setCategoria(""); setCity(""); setBairro("")
    setBeds(""); setVagas(""); setPriceMin(""); setPriceMax(""); setOrg("")
  }

  const filtered = properties.filter((p) => {
    const q = search.toLowerCase()
    const numPriceMin = parseBRNumber(priceMin)
    const numPriceMax = parseBRNumber(priceMax)
    return (
      (!q || p.title.toLowerCase().includes(q) || (p.neighborhood ?? "").toLowerCase().includes(q) || (p.city ?? "").toLowerCase().includes(q)) &&
      (!filterNegocio || p.tipo_negocio === filterNegocio) &&
      (!filterCategoria || p.categoria === filterCategoria) &&
      (!filterCity || p.city === filterCity) &&
      (!filterBairro || p.neighborhood === filterBairro) &&
      (!filterBeds || ((p.features.dormitorios ?? p.features.suites ?? p.features.quartos ?? 0) as number) >= parseInt(filterBeds)) &&
      (!filterVagas || ((p.features.vagas ?? 0) as number) >= parseInt(filterVagas)) &&
      (!numPriceMin || p.price >= numPriceMin) &&
      (!numPriceMax || p.price <= numPriceMax) &&
      (!filterOrg || p.org_id === filterOrg)
    )
  })

  const sortedFiltered = [
    ...filtered.filter((p) => destaqueIds.has(p.id)),
    ...filtered.filter((p) => !destaqueIds.has(p.id)),
  ]

  const isSearching = !!(search || activeFilters > 0)
  const superDestaqueIds = new Set(superDestaques.map((p) => p.id))
  const listedProperties = isSearching
    ? sortedFiltered
    : sortedFiltered.filter((p) => !superDestaqueIds.has(p.id))

  return (
    <div className="bg-background min-h-screen">

      <HeroSection
        heroImage={heroImage}
        totalProperties={properties.length}
        totalPartners={construtoras.length + imobiliarias.length}
      />

      <SearchFloatingCard
        search={search}          setSearch={setSearch}
        filterNegocio={filterNegocio} setNegocio={setNegocio}
        filterCategoria={filterCategoria} setCategoria={setCategoria}
        filterCity={filterCity}  setCity={(c) => { setCity(c); setBairro("") }}
        filterBairro={filterBairro} setBairro={setBairro}
        filterBeds={filterBeds}  setBeds={setBeds}
        filterVagas={filterVagas} setVagas={setVagas}
        priceMin={priceMin}      setPriceMin={setPriceMin}
        priceMax={priceMax}      setPriceMax={setPriceMax}
        filterOrg={filterOrg}    setOrg={setOrg}
        showFilters={showFilters} setShowFilters={setShowFilters}
        activeFilters={activeFilters}
        clearAll={clearAll}
        cityOptions={cityOptions}
        bairroOptions={bairroOptions}
        orgs={[...construtoras, ...imobiliarias]}
        maskBRNumber={maskBRNumber}
      />

      {!isSearching && <FeaturedBuilders construtoras={construtoras} />}
      {!isSearching && <FeaturedAgencies imobiliarias={imobiliarias} />}

      {!isSearching && superDestaques.length > 0 && (
        <PropertiesGrid
          properties={superDestaques.slice(0, 4)}
          destaqueIds={destaqueIds}
          title="Imóveis em Destaque"
          subtitle="Seleção exclusiva de oportunidades premium"
        />
      )}

      {!isSearching && (
        <ExploreByCity properties={properties} onCitySelect={setCity} />
      )}

      <PropertiesGrid
        id="grid-imoveis"
        properties={listedProperties}
        destaqueIds={destaqueIds}
        title={isSearching ? `${filtered.length} imóvel${filtered.length !== 1 ? "is" : ""} encontrado${filtered.length !== 1 ? "s" : ""}` : "Imóveis Disponíveis"}
        subtitle={!isSearching ? "Explore todo o nosso portfólio de imóveis" : undefined}
        onClearFilters={activeFilters > 0 ? clearAll : undefined}
      />

      {!isSearching && (
        <SocialProof
          construtoras={construtoras}
          imobiliarias={imobiliarias}
          totalProperties={properties.length}
        />
      )}

      {!isSearching && <FinalCTA />}
    </div>
  )
}
