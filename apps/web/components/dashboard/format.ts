import { countryName } from "@/lib/country"

export function formatDuration(seconds: number | null): string {
  if (seconds === null) return "—"
  const s = Math.max(0, Math.round(seconds))
  if (s < 60) return `${s}s`
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`
}

export const formatNumber = (n: number): string =>
  n >= 10_000
    ? Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(n)
    : n.toLocaleString("en-US")

export const formatMoney = (cents: number, currency = "USD"): string =>
  (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: cents % 100 === 0 ? 0 : 2,
  })

export const formatPercent = (ratio: number): string => {
  const pct = ratio * 100
  return `${pct.toFixed(pct > 0 && pct < 10 ? 1 : 0)}%`
}

export const SERIES = {
  blue: { light: "#2a78d6", dark: "#3987e5" },
  orange: { light: "#eb6834", dark: "#d95926" },
  aqua: { light: "#1baf7a", dark: "#199e70" },
  other: { light: "#a1a1aa", dark: "#52525b" },
} as const

export function dimensionLabel(key: string, value: string): string {
  if (!value) {
    if (key === "referrer") return "Direct"
    if (key === "title") return "(untitled)"
    return "Unknown"
  }
  if (key === "country") return countryName(value)
  return value
}

export function bucketLabel(bucket: string, granularity: string): string {
  const date = new Date(`${bucket}:00Z`)
  if (Number.isNaN(date.getTime())) return bucket
  if (granularity === "hour") {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      timeZone: "UTC",
    })
  }
  if (granularity === "month") {
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "2-digit",
      timeZone: "UTC",
    })
  }
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
}
