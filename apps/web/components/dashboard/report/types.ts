import type { MetricRow } from "@/lib/analytics/metrics"

export type ReportTab = {
  key: string
  label: string
  rows: MetricRow[]
  valueLabel: string
  filter: string | null
}

export const linkFor = (
  kind: string,
  label: string,
  domain: string
): string | null => {
  if (!label) return null
  if (kind === "page" || kind === "entry" || kind === "exit")
    return label.startsWith("/") ? `https://${domain}${label}` : null
  if (kind === "hostname" || kind === "referrer") return `https://${label}`
  return null
}
