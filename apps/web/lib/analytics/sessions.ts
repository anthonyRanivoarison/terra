import type { AnalyticsParams } from "./params"
import { QueryBuilder, run, safe } from "./query"

export type VisitRow = {
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

export type TimelineItem = {
  kind: "view" | "event"
  at: string
  label: string
  detail: string | null
  durationS: number | null
  scrollPct: number | null
  amountCents: number | null
}

export const PAGE_SIZE = 25

const iso = (column: string) => `to_json(${column}) #>> '{}'`

export const VISIT_FIELDS = `
  v.id, v.visitor_id AS "visitorId", ${iso("v.started_at")} AS "startedAt",
  EXTRACT(EPOCH FROM v.last_seen_at - v.started_at)::int AS "durationS",
  v.views, v.interactions, v.is_new AS "isNew", v.hostname,
  v.entry_page AS "entryPage", v.exit_page AS "exitPage", v.channel,
  v.referrer, v.utm_campaign AS "utmCampaign", v.country, v.region, v.city,
  v.device, v.browser, v.os, v.language, v.screen,
  COALESCE((SELECT SUM(e.amount_cents) FROM events e
    WHERE e.site_id = v.site_id AND e.visit_id = v.id
      AND e.name IN ('purchase', 'refund')), 0)::float8
    AS "revenueCents"`

export function getVisits(
  siteId: string,
  params: AnalyticsParams,
  page: number
): Promise<{ rows: VisitRow[]; hasMore: boolean }> {
  const b = new QueryBuilder(siteId)
  const visits = b.visits(params.current, params.filters)
  const offset = b.p(Math.max(0, Math.floor(page) || 0) * PAGE_SIZE)
  const query = b.build(`
    WITH ${visits}
    SELECT ${VISIT_FIELDS} FROM v
    ORDER BY v.started_at DESC LIMIT ${PAGE_SIZE + 1} OFFSET ${offset}
  `)
  return safe(
    "visits",
    async () => {
      const rows = await run<VisitRow>(query)
      return {
        rows: rows.slice(0, PAGE_SIZE),
        hasMore: rows.length > PAGE_SIZE,
      }
    },
    { rows: [], hasMore: false }
  )
}

export { getVisit, type VisitDetail } from "./visit"
