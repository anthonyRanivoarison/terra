import type { AnalyticsParams, Filters, Window } from "./params"
import { hasFilters, QueryBuilder, runAll, safe, type Query } from "./query"

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

export const EMPTY_OVERVIEW: Overview = {
  visitors: 0,
  visits: 0,
  views: 0,
  bounceRate: 0,
  visitDuration: 0,
  revenueCents: 0,
  purchases: 0,
  conversionRate: 0,
}

export const BOUNCED = "(v.views <= 1 AND v.interactions = 0)"

export function revenueScope(
  b: QueryBuilder,
  window: Window,
  filters: Filters
): string {
  return `${b.siteOf("e")} AND e.name IN ('purchase', 'refund')
    AND e.created_at >= ${b.p(window.from)}::timestamptz
    AND e.created_at < ${b.p(window.to)}::timestamptz
    ${hasFilters(filters) ? "AND e.visitor_id IN (SELECT visitor_id FROM v)" : ""}`
}

function overviewQuery(
  siteId: string,
  window: Window,
  filters: Filters
): Query {
  const b = new QueryBuilder(siteId)
  const visits = b.visits(window, filters)
  const views = filters.page
    ? `(SELECT COUNT(*) FROM views s WHERE ${b.views(window, filters)})`
    : "COALESCE(SUM(v.views), 0)"
  const revenue = revenueScope(b, window, filters)
  return b.build(`
    WITH ${visits},
    r AS (
      SELECT
        COALESCE(SUM(e.amount_cents), 0)::bigint AS cents,
        COUNT(*) FILTER (WHERE e.name = 'purchase')::int AS purchases,
        COUNT(DISTINCT e.visitor_id) FILTER (WHERE e.name = 'purchase')::int AS buyers
      FROM events e WHERE ${revenue}
    )
    SELECT
      (SELECT COUNT(*) FROM (SELECT visitor_id FROM v GROUP BY 1) u)::int
        AS visitors,
      COUNT(*)::int AS visits,
      ${views}::int AS views,
      COALESCE(AVG(CASE WHEN ${BOUNCED} THEN 1 ELSE 0 END), 0)::float8 AS bounce,
      COALESCE(AVG(EXTRACT(EPOCH FROM v.last_seen_at - v.started_at))
        FILTER (WHERE NOT ${BOUNCED}), 0)::float8 AS duration,
      (SELECT cents FROM r)::float8 AS cents,
      (SELECT purchases FROM r) AS purchases,
      (SELECT buyers FROM r) AS buyers
    FROM v
  `)
}

type Row = {
  visitors: number
  visits: number
  views: number
  bounce: number
  duration: number
  cents: number
  purchases: number
  buyers: number
}

const toOverview = (r: Row | undefined): Overview =>
  r
    ? {
        visitors: r.visitors,
        visits: r.visits,
        views: r.views,
        bounceRate: r.bounce,
        visitDuration: Math.round(r.duration),
        revenueCents: Number(r.cents),
        purchases: r.purchases,
        conversionRate: r.visitors ? r.buyers / r.visitors : 0,
      }
    : EMPTY_OVERVIEW

export function getOverview(
  siteId: string,
  params: AnalyticsParams
): Promise<{ current: Overview; previous: Overview }> {
  return safe(
    "overview",
    async () => {
      const [current, previous] = (await runAll([
        overviewQuery(siteId, params.current, params.filters),
        overviewQuery(siteId, params.previous, params.filters),
      ])) as Row[][]
      return {
        current: toOverview(current?.[0]),
        previous: toOverview(previous?.[0]),
      }
    },
    { current: EMPTY_OVERVIEW, previous: EMPTY_OVERVIEW }
  )
}
