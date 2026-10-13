import { keepQuery } from "./attribution"

export type Vitals = {
  lcp: number | null
  inp: number | null
  cls: number | null
  fcp: number | null
  ttfb: number | null
}

export type Location = { hostname: string; page: string; query: string | null }

export type PageviewPayload = {
  type: "pageview"
  websiteId: string
  visitorId: string
  sessionId: string
  viewId: string
  location: Location
  title: string | null
  referrer: string | null
  client: unknown
}

export type PingPayload = {
  type: "ping" | "leave"
  websiteId: string
  sessionId: string
  viewId: string
  duration: number
  scroll: number | null
  vitals: Vitals | null
}

export type EventPayload = {
  type: "event"
  websiteId: string
  visitorId: string
  sessionId: string | null
  location: Location
  name: string
  props: Record<string, string> | null
}

export type TrackPayload = PageviewPayload | PingPayload | EventPayload

const WEBSITE_ID = /^ws_[A-Za-z0-9]{8,32}$/
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const VISITOR = /^[A-Za-z0-9_-]{8,64}$/
const EVENT_NAME = /^[a-z0-9_:-]{1,64}$/
const PROP_KEY = /^[a-z0-9_-]{1,64}$/
const RESERVED = new Set(["purchase", "refund", "pageview"])

const str = (value: unknown, max: number): string | null =>
  typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null

const uuid = (value: unknown): string | null =>
  typeof value === "string" && UUID.test(value) ? value.toLowerCase() : null

const int = (value: unknown, max: number): number | null =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.round(Math.max(0, Math.min(max, value)))
    : null

export function parseLocation(value: unknown): Location | null {
  const raw = str(value, 2000)
  if (!raw) return null
  try {
    const url = new URL(raw)
    if (!/^https?:$/.test(url.protocol)) return null
    return {
      hostname: url.hostname.toLowerCase().replace(/^www\./, ""),
      page: url.pathname.slice(0, 300) || "/",
      query: url.search ? keepQuery(url.search) : null,
    }
  } catch {
    return null
  }
}

function props(value: unknown): Record<string, string> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const out: Record<string, string> = {}
  for (const [key, raw] of Object.entries(value).slice(0, 10)) {
    const v =
      typeof raw === "number" || typeof raw === "boolean" ? `${raw}` : raw
    const clean = str(v, 255)
    if (PROP_KEY.test(key) && clean) out[key] = clean
  }
  return Object.keys(out).length ? out : null
}

function vitals(value: unknown): Vitals | null {
  if (!value || typeof value !== "object") return null
  const v = value as Record<string, unknown>
  const cls =
    typeof v.cls === "number" && Number.isFinite(v.cls)
      ? Math.max(0, Math.min(10, v.cls))
      : null
  const out = {
    lcp: int(v.lcp, 120_000),
    inp: int(v.inp, 60_000),
    cls,
    fcp: int(v.fcp, 120_000),
    ttfb: int(v.ttfb, 120_000),
  }
  return Object.values(out).some((x) => x !== null) ? out : null
}

export function parsePayload(body: unknown): TrackPayload | null {
  if (!body || typeof body !== "object") return null
  const b = body as Record<string, unknown>
  const websiteId = str(b.websiteId, 40)
  if (!websiteId || !WEBSITE_ID.test(websiteId)) return null

  if (b.type === "pageview") {
    const visitorId = str(b.visitorId, 64)
    const sessionId = uuid(b.sessionId)
    const viewId = uuid(b.viewId)
    const location = parseLocation(b.url)
    if (!visitorId || !VISITOR.test(visitorId) || !sessionId || !viewId) {
      return null
    }
    if (!location) return null
    return {
      type: "pageview",
      websiteId,
      visitorId,
      sessionId,
      viewId,
      location,
      title: str(b.title, 200),
      referrer: str(b.referrer, 500),
      client: b.client,
    }
  }

  if (b.type === "ping" || b.type === "leave") {
    const sessionId = uuid(b.sessionId)
    const viewId = uuid(b.viewId)
    if (!sessionId || !viewId) return null
    return {
      type: b.type,
      websiteId,
      sessionId,
      viewId,
      duration: int(b.duration, 86_400) ?? 0,
      scroll: int(b.scroll, 100),
      vitals: vitals(b.vitals),
    }
  }

  if (b.type === "event") {
    const visitorId = str(b.visitorId, 64)
    const name = str(b.name, 64)
    const location = parseLocation(b.url)
    if (!visitorId || !VISITOR.test(visitorId) || !location) return null
    if (!name || !EVENT_NAME.test(name) || RESERVED.has(name)) return null
    return {
      type: "event",
      websiteId,
      visitorId,
      sessionId: uuid(b.sessionId),
      location,
      name,
      props: props(b.props),
    }
  }

  return null
}
