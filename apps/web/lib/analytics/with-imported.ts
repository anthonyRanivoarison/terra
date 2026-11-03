import {
  importedSeries,
  importedTotals,
  importedValues,
  IMPORTED_TABS,
  usesImported,
  type ImportedTotals,
} from "./imported"
import { getSection, type MetricRow, type Section } from "./metrics"
import { getOverview, type Overview } from "./overview"
import type { AnalyticsParams } from "./params"
import { safe } from "./query"
import { getSeries, type SeriesPoint } from "./series"

type Base = Pick<Overview, "visitors" | "visits" | "views" | "bounceRate">

function blend<T extends Base>(base: T, extra: ImportedTotals) {
  const visits = base.visits + extra.visits
  const visitors = base.visitors + extra.visitors
  return {
    visits,
    visitors,
    views: base.views + extra.views,
    bounceRate: visits
      ? (base.bounceRate * base.visits + extra.bounces) / visits
      : 0,
    share: visitors ? base.visitors / visitors : 0,
  }
}

export function addOverview(base: Overview, extra: ImportedTotals): Overview {
  if (!extra.visits && !extra.visitors) return base
  const { share, ...totals } = blend(base, extra)
  const kept = base.visits * (1 - base.bounceRate)
  const engaged = kept + Math.max(0, extra.visits - extra.bounces)
  return {
    ...base,
    ...totals,
    visitDuration: engaged
      ? Math.round((base.visitDuration * kept + extra.duration) / engaged)
      : 0,
    conversionRate: base.conversionRate * share,
  }
}

export function addPoint(
  base: SeriesPoint,
  extra: ImportedTotals | undefined
): SeriesPoint {
  if (!extra) return base
  const { share, ...totals } = blend(base, extra)
  return { ...base, ...totals, conversionRate: base.conversionRate * share }
}

export function mergeRows(
  base: MetricRow[],
  extra: MetricRow[],
  limit: number
): MetricRow[] {
  const rows = new Map(base.map((row) => [row.label, { ...row }]))
  for (const row of extra) {
    const current = rows.get(row.label)
    if (current) {
      current.value += row.value
      current.visitors += row.visitors
    } else rows.set(row.label, { ...row })
  }
  return [...rows.values()].sort((a, b) => b.value - a.value).slice(0, limit)
}

export async function overviewWithImported(
  siteId: string,
  params: AnalyticsParams
) {
  const base = await getOverview(siteId, params)
  if (!usesImported(params)) return base
  return safe(
    "imported overview",
    async () => {
      const [current, previous] = await Promise.all([
        importedTotals(siteId, params.current, params.tz),
        importedTotals(siteId, params.previous, params.tz),
      ])
      return {
        current: addOverview(base.current, current),
        previous: addOverview(base.previous, previous),
      }
    },
    base
  )
}

export async function seriesWithImported(
  siteId: string,
  params: AnalyticsParams
) {
  const base = await getSeries(siteId, params)
  if (!usesImported(params)) return base
  const merge = async (points: SeriesPoint[], window = params.current) => {
    const extra = await importedSeries(
      siteId,
      window,
      params.tz,
      params.granularity
    )
    const byBucket = new Map(extra.map((point) => [point.bucket, point]))
    return points.map((point) => addPoint(point, byBucket.get(point.bucket)))
  }
  return safe(
    "imported series",
    async () => ({
      current: await merge(base.current),
      previous: base.previous && (await merge(base.previous, params.previous)),
    }),
    base
  )
}

export async function sectionWithImported(
  siteId: string,
  params: AnalyticsParams,
  section: Section,
  limit = 10
) {
  const base = await getSection(siteId, params, section, limit)
  if (!usesImported(params)) return base
  return safe(
    `imported ${section}`,
    async () => {
      const entries = await Promise.all(
        Object.entries(base).map(async ([tab, rows]) => {
          if (!IMPORTED_TABS[tab]) return [tab, rows] as const
          const extra = await importedValues(
            siteId,
            params.current,
            params.tz,
            tab,
            limit
          )
          return [tab, mergeRows(rows, extra, limit)] as const
        })
      )
      return Object.fromEntries(entries)
    },
    base
  )
}
