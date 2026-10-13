import type { AnalyticsParams } from "./params"
import { QueryBuilder, type Query } from "./query"

export const VITALS = [
  {
    key: "lcp",
    column: "lcp_ms",
    label: "LCP",
    name: "Largest Contentful Paint",
    good: 2500,
    poor: 4000,
    unit: "ms",
  },
  {
    key: "inp",
    column: "inp_ms",
    label: "INP",
    name: "Interaction to Next Paint",
    good: 200,
    poor: 500,
    unit: "ms",
  },
  {
    key: "cls",
    column: "cls",
    label: "CLS",
    name: "Cumulative Layout Shift",
    good: 0.1,
    poor: 0.25,
    unit: "",
  },
  {
    key: "fcp",
    column: "fcp_ms",
    label: "FCP",
    name: "First Contentful Paint",
    good: 1800,
    poor: 3000,
    unit: "ms",
  },
  {
    key: "ttfb",
    column: "ttfb_ms",
    label: "TTFB",
    name: "Time to First Byte",
    good: 800,
    poor: 1800,
    unit: "ms",
  },
] as const

export type VitalKey = (typeof VITALS)[number]["key"]
export type VitalScore = { good: number; ni: number; poor: number }
export type VitalScores = Record<VitalKey, VitalScore>

export const HAS_VITALS = `(s.lcp_ms IS NOT NULL OR s.inp_ms IS NOT NULL
  OR s.cls IS NOT NULL OR s.fcp_ms IS NOT NULL OR s.ttfb_ms IS NOT NULL)`

export const EMPTY_SCORES = Object.fromEntries(
  VITALS.map((v) => [v.key, { good: 0, ni: 0, poor: 0 }])
) as VitalScores

export function scoresQuery(siteId: string, params: AnalyticsParams): Query {
  const b = new QueryBuilder(siteId)
  const columns = VITALS.flatMap(({ key, column, good, poor }) => [
    `COUNT(*) FILTER (WHERE s.${column} <= ${good})::int AS "${key}_good"`,
    `COUNT(*) FILTER (WHERE s.${column} > ${good} AND s.${column} <= ${poor})::int AS "${key}_ni"`,
    `COUNT(*) FILTER (WHERE s.${column} > ${poor})::int AS "${key}_poor"`,
  ])
  return b.build(`
        SELECT ${columns.join(", ")}
    FROM views s
    WHERE ${b.views(params.current, params.filters)}
      AND ${HAS_VITALS}
  `)
}

export function toScores(row: Record<string, number> | undefined): VitalScores {
  if (!row) return EMPTY_SCORES
  return Object.fromEntries(
    VITALS.map(({ key }) => [
      key,
      {
        good: row[`${key}_good`] ?? 0,
        ni: row[`${key}_ni`] ?? 0,
        poor: row[`${key}_poor`] ?? 0,
      },
    ])
  ) as VitalScores
}
