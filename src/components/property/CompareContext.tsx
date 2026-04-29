"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export type CompareItem = {
  id: string
  slug: string
  title: string
  price: number
  images?: string[]
  neighborhood?: string | null
  city?: string | null
  quartos?: number | null
  vagas?: number | null
  area_m2?: number | null
}

type CompareContextValue = {
  items: CompareItem[]
  add: (item: CompareItem) => void
  remove: (id: string) => void
  toggle: (item: CompareItem) => void
  has: (id: string) => boolean
  clear: () => void
  canAdd: boolean
}

const MAX_COMPARE = 3

const CompareContext = createContext<CompareContextValue | null>(null)

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([])

  const add = useCallback((item: CompareItem) => {
    setItems((prev) => {
      if (prev.find((i) => i.id === item.id) || prev.length >= MAX_COMPARE) return prev
      return [...prev, item]
    })
  }, [])

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const toggle = useCallback((item: CompareItem) => {
    setItems((prev) => {
      if (prev.find((i) => i.id === item.id)) return prev.filter((i) => i.id !== item.id)
      if (prev.length >= MAX_COMPARE) return prev
      return [...prev, item]
    })
  }, [])

  const has = useCallback((id: string) => items.some((i) => i.id === id), [items])

  const clear = useCallback(() => setItems([]), [])

  return (
    <CompareContext.Provider value={{ items, add, remove, toggle, has, clear, canAdd: items.length < MAX_COMPARE }}>
      {children}
    </CompareContext.Provider>
  )
}

const NOOP_CONTEXT: CompareContextValue = {
  items: [],
  add: () => {},
  remove: () => {},
  toggle: () => {},
  has: () => false,
  clear: () => {},
  canAdd: true,
}

export function useCompare() {
  return useContext(CompareContext) ?? NOOP_CONTEXT
}
