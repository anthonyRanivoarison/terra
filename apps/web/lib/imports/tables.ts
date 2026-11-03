import { classifyChannel } from "@terra/core/attribution"

export type ImportedRow = {
  date: string
  dimension: string
  value: string
  visitors: number
  visits: number
  pageviews: number
  bounces: number
  duration: number
}

type Rec = Record<string, string>
type Metrics = Omit<ImportedRow, "date" | "dimension" | "value">

const n = (value: string | undefined) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 0
}

const metrics = (r: Rec, visits = r.visits): Metrics => ({
  visitors: n(r.visitors),
  visits: n(visits),
  pageviews: n(r.pageviews),
  bounces: n(r.bounces),
  duration: n(r.visit_duration),
})

const host = (value: string) =>
  value
    .toLowerCase()
    .replace(/^[a-z]+:\/\//, "")
    .split(/[/?#]/)[0]!
    .replace(/^www\./, "")

const blank = (value: string | undefined) =>
  !value || /^(direct \/ none|\(none\)|\(not set\)|none)$/i.test(value)

const row = (dimension: string, value: string, m: Metrics) => ({
  dimension,
  value,
  ...m,
})

function sources(r: Rec) {
  const referrer = blank(r.referrer) ? "" : host(r.referrer!)
  const source = blank(r.source) ? "" : r.source!.toLowerCase()
  const utm = {
    source: r.utm_source || null,
    medium: r.utm_medium || null,
    campaign: r.utm_campaign || null,
    term: r.utm_term || null,
    content: r.utm_content || null,
    ref: null,
  }
  const m = metrics(r)
  const rows = [
    row("channel", classifyChannel(referrer || source || null, utm), m),
  ]
  if (referrer || source) rows.push(row("referrer", referrer || source, m))
  for (const key of ["utm_source", "utm_medium", "utm_campaign"] as const)
    if (r[key]) rows.push(row(key, r[key]!, m))
  return rows
}

function locations(r: Rec) {
  const m = metrics(r)
  const country = (r.country ?? "").toUpperCase()
  if (!/^[A-Z]{2}$/.test(country)) return []
  const region = (r.region ?? "").replace(/^[A-Z]{2}-/i, "")
  return [
    row("country", country, m),
    ...(region ? [row("region", region, m)] : []),
  ]
}

const one = (dimension: string, column: string, visits?: string) => (r: Rec) =>
  r[column] ? [row(dimension, r[column]!, metrics(r, visits && r[visits]))] : []

export const TABLES = {
  visitors: (r: Rec) => [row("total", "", metrics(r))],
  pages: one("page", "page"),
  entry_pages: one("entry", "entry_page", "entrances"),
  exit_pages: one("exit", "exit_page", "exits"),
  sources,
  locations,
  devices: (r: Rec) =>
    one(
      "device",
      "device"
    )({
      ...r,
      device: r.device ? r.device[0]!.toUpperCase() + r.device.slice(1) : "",
    }),
  browsers: one("browser", "browser"),
  operating_systems: one("os", "operating_system"),
} satisfies Record<string, (r: Rec) => Omit<ImportedRow, "date">[]>

export type Table = keyof typeof TABLES

const NAME =
  /(?:^|\/)(?:imported_)?(visitors|pages|entry_pages|exit_pages|sources|locations|devices|browsers|operating_systems)(?:_\d{8}_\d{8})?\.csv$/i

export const tableOf = (fileName: string): Table | null =>
  (NAME.exec(fileName)?.[1]?.toLowerCase() as Table | undefined) ?? null
