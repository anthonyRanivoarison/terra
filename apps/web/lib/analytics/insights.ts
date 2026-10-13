import type { AnalyticsParams } from "./params"
import { QueryBuilder, run, runAll, safe } from "./query"
import {
  EMPTY_SCORES,
  HAS_VITALS,
  scoresQuery,
  toScores,
  type VitalScores,
} from "./vitals"

export type HeatCell = { day: number; hour: number; visitors: number }
export type Vital = {
  page: string
  views: number
  lcp: number | null
  inp: number | null
  cls: number | null
  fcp: number | null
  ttfb: number | null
}
export type GeoPoint = {
  city: string
  country: string
  latitude: number
  longitude: number
  visitors: number
}
type Row = { label: string; count: number }
export type Quality = {
  networks: Row[]
  bots: { visits: number; humans: number; breakdown: Row[] }
}

const P75 = (column: string) =>
  `percentile_cont(0.75) WITHIN GROUP (ORDER BY s.${column})::float8`

export function getHeatmap(
  siteId: string,
  params: AnalyticsParams
): Promise<HeatCell[]> {
  const b = new QueryBuilder(siteId)
  const visits = b.visits(params.current, params.filters)
  const zone = b.p(params.tz)
  const local = `v.started_at AT TIME ZONE ${zone}`
  return safe(
    "heatmap",
    () =>
      run<HeatCell>(
        b.build(`
          WITH ${visits}
          SELECT day, hour, COUNT(*)::int AS visitors FROM (
            SELECT EXTRACT(ISODOW FROM ${local})::int AS day,
              EXTRACT(HOUR FROM ${local})::int AS hour, v.visitor_id
            FROM v GROUP BY 1, 2, 3
          ) t GROUP BY 1, 2
        `)
      ),
    []
  )
}

export function getVitals(
  siteId: string,
  params: AnalyticsParams
): Promise<{ vitals: Vital[]; scores: VitalScores }> {
  const b = new QueryBuilder(siteId)
  const query = b.build(`
    SELECT s.page, COUNT(*)::int AS views,
      ${P75("lcp_ms")} AS lcp, ${P75("inp_ms")} AS inp, ${P75("cls")} AS cls,
      ${P75("fcp_ms")} AS fcp, ${P75("ttfb_ms")} AS ttfb
    FROM views s
    WHERE ${b.views(params.current, params.filters)} AND ${HAS_VITALS}
    GROUP BY ROLLUP (s.page) ORDER BY (s.page IS NULL) DESC, 2 DESC LIMIT 11
  `)
  return safe(
    "vitals",
    async () => {
      const [rows, scores] = await runAll([query, scoresQuery(siteId, params)])
      return {
        vitals: (rows as (Vital & { page: string | null })[]).map((r) => ({
          ...r,
          page: r.page ?? "All pages",
        })),
        scores: toScores((scores as Record<string, number>[])[0]),
      }
    },
    { vitals: [], scores: EMPTY_SCORES }
  )
}

export function getPoints(
  siteId: string,
  params: AnalyticsParams
): Promise<GeoPoint[]> {
  const b = new QueryBuilder(siteId)
  const visits = b.visits(params.current, params.filters)
  return safe(
    "points",
    () =>
      run<GeoPoint>(
        b.build(`
          WITH ${visits}
          SELECT city, country,
            ROUND(AVG(latitude)::numeric, 1)::float8 AS latitude,
            ROUND(AVG(longitude)::numeric, 1)::float8 AS longitude,
            COUNT(*)::int AS visitors
          FROM (
            SELECT COALESCE(v.city, '') AS city, COALESCE(v.country, '') AS country,
              AVG(v.latitude) AS latitude, AVG(v.longitude) AS longitude,
              v.visitor_id
            FROM v WHERE v.latitude IS NOT NULL AND v.longitude IS NOT NULL
            GROUP BY 1, 2, 5
          ) t
          GROUP BY 1, 2 ORDER BY 5 DESC LIMIT 300
        `)
      ),
    []
  )
}

export function getQuality(
  siteId: string,
  params: AnalyticsParams
): Promise<Quality> {
  const networks = new QueryBuilder(siteId)
  const visits = networks.visits(params.current, params.filters)
  const bots = new QueryBuilder(siteId)
  const window = `${bots.siteOf("visits")} AND started_at >= ${bots.p(params.current.from)}::timestamptz
    AND started_at < ${bots.p(params.current.to)}::timestamptz`
  return safe(
    "quality",
    async () => {
      const [nets, rows] = (await runAll([
        networks.build(`
          WITH ${visits}
          SELECT v.as_org AS label, COUNT(*)::int AS count FROM v
          WHERE NULLIF(v.as_org, '') IS NOT NULL
          GROUP BY 1 ORDER BY 2 DESC LIMIT 6
        `),
        bots.build(`
          SELECT CASE WHEN is_bot THEN COALESCE(NULLIF(browser, ''), 'Bot')
              ELSE '' END AS label,
            COUNT(*)::int AS count
          FROM visits WHERE ${window}
          GROUP BY 1 ORDER BY 2 DESC
        `),
      ])) as [Row[], Row[]]
      const botList = rows.filter((r) => r.label !== "")
      return {
        networks: nets,
        bots: {
          visits: botList.reduce((sum, r) => sum + r.count, 0),
          humans: rows.find((r) => r.label === "")?.count ?? 0,
          breakdown: botList.slice(0, 8),
        },
      }
    },
    { networks: [], bots: { visits: 0, humans: 0, breakdown: [] } }
  )
}
