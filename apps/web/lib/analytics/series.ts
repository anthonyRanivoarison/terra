import type { AnalyticsParams, Filters, Granularity, Window } from "./params"
import { BOUNCED, revenueScope } from "./overview"
import { QueryBuilder, runAll, safe, type Query } from "./query"

export type SeriesPoint = {
  bucket: string
  visitors: number
  visits: number
  views: number
  bounceRate: number
  revenueCents: number
  conversionRate: number
}

export type Series = { current: SeriesPoint[]; previous: SeriesPoint[] | null }

const STEP: Record<Granularity, string> = {
  hour: "1 hour",
  day: "1 day",
  month: "1 month",
}

function seriesQuery(
  siteId: string,
  window: Window,
  filters: Filters,
  granularity: Granularity,
  tz: string
): Query {
  const b = new QueryBuilder(siteId)
  const visits = b.visits(window, filters)
  const revenue = revenueScope(b, window, filters)
  const g = b.p(granularity)
  const zone = b.p(tz)
  const local = (column: string) =>
    `date_trunc(${g}, (${column}) AT TIME ZONE ${zone})`
  return b.build(`
    WITH ${visits},
    buckets AS (
      SELECT generate_series(
        ${local(`${b.p(window.from)}::timestamptz`)},
        ${local(`${b.p(window.to)}::timestamptz - interval '1 second'`)},
        ${b.p(STEP[granularity])}::interval
      ) AS bucket
    ),
    vv AS (
      SELECT bucket, COUNT(*) AS visitors FROM (
        SELECT ${local("v.started_at")} AS bucket, v.visitor_id FROM v GROUP BY 1, 2
      ) t GROUP BY 1
    ),
    vs AS (
      SELECT ${local("v.started_at")} AS bucket, COUNT(*) AS visits,
        AVG(CASE WHEN ${BOUNCED} THEN 1 ELSE 0 END) AS bounce
      FROM v GROUP BY 1
    ),
    pv AS (
      ${
        filters.page
          ? `SELECT ${local("s.entered_at")} AS bucket, COUNT(*) AS views
            FROM views s WHERE ${b.views(window, filters)} GROUP BY 1`
          : `SELECT ${local("v.started_at")} AS bucket, SUM(v.views) AS views
            FROM v GROUP BY 1`
      }
    ),
    rv AS (
      SELECT ${local("e.created_at")} AS bucket, SUM(e.amount_cents) AS cents,
        COUNT(DISTINCT e.visitor_id) FILTER (WHERE e.name = 'purchase') AS buyers
      FROM events e WHERE ${revenue} GROUP BY 1
    )
    SELECT
      to_char(buckets.bucket, 'YYYY-MM-DD"T"HH24:MI') AS bucket,
      COALESCE(vv.visitors, 0)::int AS visitors,
      COALESCE(vs.visits, 0)::int AS visits,
      COALESCE(pv.views, 0)::int AS views,
      COALESCE(vs.bounce, 0)::float8 AS "bounceRate",
      COALESCE(rv.cents, 0)::float8 AS "revenueCents",
      CASE WHEN COALESCE(vv.visitors, 0) = 0 THEN 0
        ELSE LEAST(1, COALESCE(rv.buyers, 0)::float8 / vv.visitors)
      END AS "conversionRate"
    FROM buckets
    LEFT JOIN vv USING (bucket)
    LEFT JOIN vs USING (bucket)
    LEFT JOIN pv USING (bucket)
    LEFT JOIN rv USING (bucket)
    ORDER BY buckets.bucket
  `)
}

export function getSeries(
  siteId: string,
  params: AnalyticsParams
): Promise<Series> {
  const { current, previous, filters, granularity, tz, compare } = params
  return safe<Series>(
    "series",
    async () => {
      const queries = [seriesQuery(siteId, current, filters, granularity, tz)]
      if (compare)
        queries.push(seriesQuery(siteId, previous, filters, granularity, tz))
      const [now, before] = (await runAll(queries)) as SeriesPoint[][]
      return { current: now ?? [], previous: before ?? null }
    },
    { current: [], previous: null }
  )
}
