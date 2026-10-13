import { sql } from "@terra/db/client"
import type { Filters, FilterKey, Window } from "./params"

export const DIMENSIONS = {
  hostname: "hostname",
  entry: "entry_page",
  exit: "exit_page",
  referrer: "referrer_host",
  channel: "channel",
  utm_source: "utm_source",
  utm_medium: "utm_medium",
  utm_campaign: "utm_campaign",
  country: "country",
  region: "region",
  city: "city",
  device: "device",
  browser: "browser",
  os: "os",
  language: "language",
  screen: "screen",
} as const
export type Dimension = keyof typeof DIMENSIONS

export type Query = { text: string; params: unknown[] }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const isUuid = (value: string): boolean => UUID.test(value)

export class QueryBuilder {
  readonly params: unknown[] = []
  readonly site: string

  constructor(siteId: string) {
    if (!isUuid(siteId)) throw new Error("QueryBuilder needs a site uuid")
    this.site = this.p(siteId)
  }

  p(value: unknown): string {
    this.params.push(value)
    return `$${this.params.length}`
  }

  siteOf(alias: string): string {
    return `${alias}.site_id = ${this.site}::uuid`
  }

  visitConditions(window: Window, filters: Filters): string[] {
    const where = [
      this.siteOf("v"),
      "NOT v.is_bot",
      `v.started_at >= ${this.p(window.from)}::timestamptz`,
      `v.started_at < ${this.p(window.to)}::timestamptz`,
    ]
    for (const [key, value] of Object.entries(filters) as [
      FilterKey,
      string,
    ][]) {
      const column = DIMENSIONS[key as Dimension]
      if (column) where.push(`v.${column} = ${this.p(value)}`)
    }
    if (filters.page) {
      where.push(
        `EXISTS (SELECT 1 FROM views s WHERE ${this.siteOf("s")} AND s.visit_id = v.id AND s.page = ${this.p(filters.page)})`
      )
    }
    if (filters.event) {
      where.push(
        `EXISTS (SELECT 1 FROM events e WHERE ${this.siteOf("e")} AND e.visit_id = v.id AND e.name = ${this.p(filters.event)})`
      )
    }
    return where
  }

  visits(window: Window, filters: Filters): string {
    const where = this.visitConditions(window, filters).join(" AND ")
    return `v AS (SELECT v.* FROM visits v WHERE ${where})`
  }

  views(window: Window, filters: Filters): string {
    const { page, ...rest } = filters
    const where = [
      this.siteOf("s"),
      "NOT s.is_bot",
      `s.entered_at >= ${this.p(window.from)}::timestamptz`,
      `s.entered_at < ${this.p(window.to)}::timestamptz`,
    ]
    if (page) where.push(`s.page = ${this.p(page)}`)
    if (hasFilters(rest)) {
      const visits = this.visitConditions(window, rest).join(" AND ")
      where.push(`s.visit_id IN (SELECT v.id FROM visits v WHERE ${visits})`)
    }
    return where.join(" AND ")
  }

  pageFilter(filters: Filters, alias = "s"): string {
    return filters.page ? `AND ${alias}.page = ${this.p(filters.page)}` : ""
  }

  build(text: string): Query {
    return { text, params: this.params }
  }
}

export const hasFilters = (filters: Filters): boolean =>
  Object.keys(filters).length > 0

export function run<T>(query: Query): Promise<T[]> {
  return sql().unsafe(
    query.text,
    query.params as never[]
  ) as unknown as Promise<T[]>
}

export function runAll(queries: Query[]): Promise<unknown[][]> {
  return Promise.all(queries.map((query) => run<unknown>(query)))
}

export async function safe<T>(
  label: string,
  fn: () => Promise<T>,
  fallback: T
) {
  try {
    return await fn()
  } catch (e) {
    console.error(`[analytics] ${label} failed:`, e)
    return fallback
  }
}
