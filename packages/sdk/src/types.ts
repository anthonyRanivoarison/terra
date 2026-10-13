export type Range = "today" | "24h" | "7d" | "30d" | "90d" | "12m" | "custom"

export type FilterKey =
  | "page"
  | "hostname"
  | "entry"
  | "exit"
  | "referrer"
  | "channel"
  | "utm_source"
  | "utm_medium"
  | "utm_campaign"
  | "country"
  | "region"
  | "city"
  | "device"
  | "browser"
  | "os"
  | "language"
  | "screen"
  | "event"

export type StatsQuery = {
  range?: Range
  from?: string | Date
  to?: string | Date
  compare?: "prev" | "year"
  filters?: Partial<Record<FilterKey, string>>
}

export type Section = "pages" | "sources" | "environment" | "location"

export type Site = {
  id: string
  name: string
  domain: string
  timezone: string
  currency: string
  live: boolean
  createdAt: string
}

export type Overview = {
  visitors: number
  visits: number
  views: number
  bounceRate: number
  visitDuration: number
  revenueCents: number
  purchases: number
  conversionRate: number
}

export type Stats = { current: Overview; previous: Overview | null }

export type SeriesPoint = {
  bucket: string
  visitors: number
  views: number
  revenueCents: number
}

export type Timeseries = {
  current: SeriesPoint[]
  previous: SeriesPoint[] | null
}

export type MetricRow = { label: string; value: number; visitors: number }

export type Breakdown = Record<string, MetricRow[]>

export type EventStat = MetricRow & {
  props: { key: string; value: string; count: number }[]
}

export type Realtime = {
  online: number
  visitors30m: number
  views30m: number
  minutes: { minute: string; views: number }[]
  pages: { label: string; visitors: number }[]
  countries: { label: string; visitors: number }[]
  referrers: { label: string; visitors: number }[]
  feed: {
    kind: "view" | "event"
    at: string
    label: string
    visitId: string | null
    country: string | null
    city: string | null
    device: string | null
    browser: string | null
  }[]
  points: { latitude: number; longitude: number; visitors: number }[]
}

export type Visit = {
  id: string
  visitorId: string
  startedAt: string
  durationS: number
  views: number
  interactions: number
  isNew: boolean
  hostname: string | null
  entryPage: string
  exitPage: string
  channel: string
  referrer: string | null
  utmCampaign: string | null
  country: string | null
  region: string | null
  city: string | null
  device: string | null
  browser: string | null
  os: string | null
  language: string | null
  screen: string | null
  revenueCents: number
}

export type VisitPage = { rows: Visit[]; hasMore: boolean }

export type VisitDetail = {
  visit: Visit
  visitor: { visits: number; firstSeen: string; revenueCents: number }
  timeline: {
    kind: "view" | "event"
    at: string
    label: string
    detail: string | null
    durationS: number | null
    scrollPct: number | null
    amountCents: number | null
  }[]
  others: Visit[]
}

export type Goal = {
  name: string
  visitorId: string
  props?: Record<string, string | number | boolean>
  url?: string
  timestamp?: string | number | Date
  id?: string
}

export type Payment = {
  id: string
  visitorId: string
  amount: number
  currency: string
  provider?: string
  refunded?: boolean
  timestamp?: string | number | Date
}

export type WrittenEvent = {
  id: string
  name: string
  visitId: string | null
  createdAt: string
  amount: number | null
  currency: string | null
  duplicate: boolean
}
