export function formatPrice(price: number): string {
  if (price >= 1_000_000)
    return "R$ " + (price / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + " Mi"
  return "R$ " + price.toLocaleString("pt-BR")
}

export function formatVGV(vgv: number): string {
  if (vgv >= 1_000_000_000)
    return "R$ " + (vgv / 1_000_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + " Bi"
  if (vgv >= 1_000_000)
    return "R$ " + (vgv / 1_000_000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + " Mi"
  return "R$ " + vgv.toLocaleString("pt-BR")
}

export function formatArea(area: number): string {
  return area.toLocaleString("pt-BR") + " m²"
}
