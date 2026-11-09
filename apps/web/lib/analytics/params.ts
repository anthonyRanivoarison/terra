export const RANGES = ["today", "24h", "7d", "30d", "90d", "12m"] as const
export type RangeKey = (typeof RANGES)[number] | "custom"
export type Granularity = "hour" | "day" | "month"
export type Compare = "prev" | "year" | null

export const FILTER_KEYS = [
  "page",
  "hostname",
  "entry",
  "exit",
  "referrer",
  "channel",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "country",
  "region",
  "city",
  "device",
  "browser",
  "os",
  "language",
  "screen",
  "event",
] as const
export type FilterKey = (typeof FILTER_KEYS)[number]
export type Filters = Partial<Record<FilterKey, string>>

export type Window = { from: string; to: string }

export type AnalyticsParams = {
  range: RangeKey
  granularity: Granularity
  compare: Compare
  current: Window
  previous: Window
  filters: Filters
  tz: string
}

type Search = Record<string, string | string[] | undefined>

const DAY = 86_400_000

export const FRESHNESS: Record<RangeKey, number> = {
  today: 60,
  "24h": 60,
  "7d": 300,
  "30d": 300,
  "90d": 900,
  "12m": 900,
  custom: 900,
}
const DATE = /^\d{4}-\d{2}-\d{2}$/

const one = (v: string | string[] | undefined): string | undefined =>
  Array.isArray(v) ? v[0] : v

export function validTimezone(tz: string | null | undefined): string {
  if (!tz) return "UTC"
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz })
    return tz
  } catch {
    return "UTC"
  }
}

function offsetMs(at: number, tz: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(at))
  const m = Object.fromEntries(parts.map((p) => [p.type, Number(p.value)]))
  const v = (key: string) => m[key] ?? 0
  return (
    Date.UTC(
      v("year"),
      v("month") - 1,
      v("day"),
      v("hour"),
      v("minute"),
      v("second")
    ) - at
  )
}

export function localDate(at: number, tz: string): string {
  return new Date(at + offsetMs(at, tz)).toISOString().slice(0, 10)
}

export function zonedMidnight(date: string, tz: string): number {
  const guess = Date.parse(`${date}T00:00:00Z`)
  return guess - offsetMs(guess, tz)
}

export function shiftDate(date: string, days: number, months = 0): string {
  const d = new Date(`${date}T00:00:00Z`)
  d.setUTCMonth(d.getUTCMonth() + months, d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

function resolve(
  range: RangeKey,
  now: number,
  tz: string,
  fromDate?: string,
  toDate?: string
): { from: number; to: number; granularity: Granularity } {
  const today = localDate(now, tz)
  const since = (days: number) => zonedMidnight(shiftDate(today, -days), tz)
  if (range === "today") return { from: since(0), to: now, granularity: "hour" }
  if (range === "24h") return { from: now - DAY, to: now, granularity: "hour" }
  if (range === "30d") return { from: since(29), to: now, granularity: "day" }
  if (range === "90d") return { from: since(89), to: now, granularity: "day" }
  if (range === "12m") {
    const start = zonedMidnight(
      shiftDate(`${today.slice(0, 7)}-01`, 0, -11),
      tz
    )
    return { from: start, to: now, granularity: "month" }
  }
  if (range === "custom" && fromDate && toDate) {
    const from = zonedMidnight(fromDate, tz)
    const to = Math.min(now, zonedMidnight(shiftDate(toDate, 1), tz))
    const days = (to - from) / DAY
    const granularity = days <= 2 ? "hour" : days <= 92 ? "day" : "month"
    return { from, to, granularity }
  }
  return { from: since(6), to: now, granularity: "day" }
}

export function parseParams(
  search: Search,
  now = Date.now(),
  timezone = "UTC"
): AnalyticsParams {
  const tz = validTimezone(timezone)
  const raw = one(search.range)
  const fromDate = one(search.from)
  const toDate = one(search.to)
  const validCustom =
    raw === "custom" &&
    !!fromDate &&
    !!toDate &&
    DATE.test(fromDate) &&
    DATE.test(toDate) &&
    fromDate <= toDate
  const range: RangeKey = validCustom
    ? "custom"
    : RANGES.includes(raw as (typeof RANGES)[number])
      ? (raw as RangeKey)
      : "7d"
  const step = FRESHNESS[range] * 1000
  const rounded = Math.ceil(now / step) * step
  const { from, to, granularity } = resolve(
    range,
    rounded,
    tz,
    fromDate,
    toDate
  )

  const compareRaw = one(search.compare)
  const compare: Compare =
    compareRaw === "prev" || compareRaw === "year" ? compareRaw : null
  const span = to - from
  const previous =
    compare === "year"
      ? { from: from - 365 * DAY, to: to - 365 * DAY }
      : { from: from - span, to: from }

  const filters: Filters = {}
  for (const key of FILTER_KEYS) {
    const value = one(search[key])?.slice(0, 300)
    if (value) filters[key] = value
  }

  const iso = (w: { from: number; to: number }): Window => ({
    from: new Date(w.from).toISOString(),
    to: new Date(w.to).toISOString(),
  })
  return {
    range,
    granularity,
    compare,
    current: iso({ from, to }),
    previous: iso(previous),
    filters,
    tz,
  }
}
