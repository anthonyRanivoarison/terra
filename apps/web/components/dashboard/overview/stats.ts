import { useSearchParams } from "next/navigation"
import { formatMoney, formatNumber, formatPercent } from "../format"

export const STATS = [
  { key: "visitors", label: "Visitors", format: formatNumber },
  { key: "views", label: "Views", format: formatNumber },
  { key: "revenueCents", label: "Revenue", format: formatMoney },
  { key: "conversionRate", label: "Conversion", format: formatPercent },
  {
    key: "bounceRate",
    label: "Bounce rate",
    format: formatPercent,
    invert: true,
  },
] as const

export type Stat = (typeof STATS)[number]
export type StatKey = Stat["key"]

export const statOf = (value: string | null): Stat =>
  STATS.find((s) => s.key === value) ?? STATS[0]

export const useSelectedStat = () => {
  const search = useSearchParams()
  const stat = statOf(search.get("metric"))
  const select = (key: StatKey) => {
    const next = new URLSearchParams(window.location.search)
    if (key === STATS[0].key) next.delete("metric")
    else next.set("metric", key)
    const query = next.toString()
    window.history.replaceState(
      null,
      "",
      query ? `${window.location.pathname}?${query}` : window.location.pathname
    )
  }
  return { stat, select }
}
