import {
  classifyChannel,
  parseReferrer,
  parseUtm,
} from "@terra/core/attribution"
import { resolveGeo } from "@terra/core/geo"
import { hostAllowed } from "@terra/core/hostname"
import { describeClient, parseUA } from "@terra/core/parse-ua"
import type {
  EventPayload,
  PageviewPayload,
  PingPayload,
} from "@terra/core/payload"
import type { Site } from "./sites"

export type VisitorInfo = Awaited<ReturnType<typeof visitorInfo>>

type Base = { siteId: string; at: Date }

export type Job = Base &
  (
    | {
        kind: "pageview"
        p: PageviewPayload
        info: VisitorInfo
        source: Source
      }
    | { kind: "ping"; p: PingPayload }
    | { kind: "event"; p: EventPayload; isBot: boolean }
    | { kind: "crawl"; crawl: CrawlRow }
  )

export type CrawlRow = {
  crawler: string
  company: string
  category: string
  hostname: string
  path: string
  status: number | null
  ipVerified: boolean | null
}

type Source = ReturnType<typeof source>

export async function visitorInfo(request: Request, client: unknown) {
  const ua = request.headers.get("user-agent") ?? ""
  const parsed = parseUA(ua, request.headers.get("sec-ch-ua"))
  const geo = await resolveGeo(request)
  const details = describeClient(ua, parsed.browser, client)
  return { ...parsed, geo, details }
}

export function source(p: PageviewPayload, site: Site) {
  const utm = parseUtm(p.location.query)
  const ref = parseReferrer(p.referrer, null)
  const internal =
    ref.host !== null && hostAllowed(ref.host, site.domain, site.allowed)
  const host = internal ? null : ref.host
  return {
    utm,
    referrer: internal ? null : ref.referrer,
    host,
    channel: classifyChannel(host, utm),
  }
}

export function isBotRequest(request: Request): boolean {
  return parseUA(
    request.headers.get("user-agent") ?? "",
    request.headers.get("sec-ch-ua")
  ).isBot
}
