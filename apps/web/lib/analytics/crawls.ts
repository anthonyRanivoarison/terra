import { sql } from "@terra/db/client"

export type CrawlCategory = "answers" | "indexing" | "training"

export type CrawlRange = {
  from: string
  to: string
  granularity: "hour" | "day" | "month"
  tz?: string
}

export type CrawlerStat = {
  crawler: string
  company: string
  category: CrawlCategory
  hits: number
  verified: number
  unverified: number
  verifiedShare: number | null
  lastAt: string
}

export type CrawlPage = { path: string; hits: number; errors: number }

export type CrawlFileHit = { crawler: string; file: string; hits: number }

export type CrawlData = {
  total: number
  totals: Record<CrawlCategory, number>
  crawlerCount: number
  crawlers: CrawlerStat[]
  buckets: string[]
  series: Record<string, number[]>
  pages: Record<string, CrawlPage[]>
  files: CrawlFileHit[]
}

const STEP = { hour: "1 hour", day: "1 day", month: "1 month" } as const
const PAGES_PER_CRAWLER = 100
const FILES = "^/(robots\\.txt|llms(-full)?\\.txt|sitemap[^/]*\\.xml)$"
const SCOPE = "site_id = $1 AND at >= $2::timestamptz AND at < $3::timestamptz"

type StatRow = Omit<CrawlerStat, "verifiedShare" | "lastAt"> & { lastAt: Date }
type SeriesRow = { bucket: string; crawler: string | null; hits: number }
type PageRow = CrawlPage & { crawler: string }

const STATS = `
  SELECT crawler, company, category, COUNT(*)::int AS hits,
    COUNT(*) FILTER (WHERE ip_verified)::int AS verified,
    COUNT(*) FILTER (WHERE ip_verified = false)::int AS unverified,
    MAX(at) AS "lastAt"
  FROM crawls WHERE ${SCOPE}
  GROUP BY 1, 2, 3 ORDER BY hits DESC, crawler`

const SERIES = `
  WITH buckets AS (
    SELECT generate_series(
      date_trunc($4, $2::timestamptz AT TIME ZONE $5),
      date_trunc($4, ($3::timestamptz - interval '1 second') AT TIME ZONE $5),
      $6::interval
    ) AS bucket
  ),
  counts AS (
    SELECT date_trunc($4, at AT TIME ZONE $5) AS bucket, crawler,
      COUNT(*)::int AS hits
    FROM crawls WHERE ${SCOPE} GROUP BY 1, 2
  )
  SELECT to_char(b.bucket, 'YYYY-MM-DD"T"HH24:MI') AS bucket, c.crawler,
    COALESCE(c.hits, 0)::int AS hits
  FROM buckets b LEFT JOIN counts c USING (bucket)
  ORDER BY b.bucket`

const PAGES = `
  SELECT crawler, path, hits, errors FROM (
    SELECT crawler, path, COUNT(*)::int AS hits,
      COUNT(*) FILTER (WHERE status >= 400)::int AS errors,
      row_number() OVER (PARTITION BY crawler ORDER BY COUNT(*) DESC, path) AS rank
    FROM crawls WHERE ${SCOPE} GROUP BY 1, 2
  ) ranked WHERE rank <= $4 ORDER BY crawler, hits DESC, path`

const CRAWLER_FILES = `
  SELECT crawler, lower(path) AS file, COUNT(*)::int AS hits
  FROM crawls WHERE ${SCOPE} AND path ~* $4
  GROUP BY 1, 2 ORDER BY hits DESC`

function seriesOf(rows: SeriesRow[], crawlers: string[]) {
  const buckets: string[] = []
  const index = new Map<string, number>()
  for (const row of rows) {
    if (!index.has(row.bucket)) {
      index.set(row.bucket, buckets.length)
      buckets.push(row.bucket)
    }
  }
  const series: Record<string, number[]> = {}
  for (const crawler of crawlers) series[crawler] = buckets.map(() => 0)
  for (const row of rows) {
    const line = row.crawler ? series[row.crawler] : undefined
    const i = index.get(row.bucket)
    if (line && i !== undefined) line[i] = row.hits
  }
  return { buckets, series }
}

function groupPages(rows: PageRow[]): Record<string, CrawlPage[]> {
  const pages: Record<string, CrawlPage[]> = {}
  for (const { crawler, ...page } of rows) {
    const list = pages[crawler] ?? []
    list.push(page)
    pages[crawler] = list
  }
  return pages
}

export async function getCrawls(
  siteId: string,
  range: CrawlRange
): Promise<CrawlData> {
  const db = sql()
  const scope = [siteId, range.from, range.to]
  const [stats, seriesRows, pageRows, files] = await Promise.all([
    db.unsafe<StatRow[]>(STATS, scope),
    db.unsafe<SeriesRow[]>(SERIES, [
      ...scope,
      range.granularity,
      range.tz ?? "UTC",
      STEP[range.granularity],
    ]),
    db.unsafe<PageRow[]>(PAGES, [...scope, PAGES_PER_CRAWLER]),
    db.unsafe<CrawlFileHit[]>(CRAWLER_FILES, [...scope, FILES]),
  ])
  const crawlers: CrawlerStat[] = stats.map((row) => {
    const checked = row.verified + row.unverified
    return {
      ...row,
      verifiedShare: checked ? row.verified / checked : null,
      lastAt: new Date(row.lastAt).toISOString(),
    }
  })
  const totals: Record<CrawlCategory, number> = {
    answers: 0,
    indexing: 0,
    training: 0,
  }
  for (const c of crawlers) {
    if (c.category in totals) totals[c.category] += c.hits
  }
  return {
    total: totals.answers + totals.indexing + totals.training,
    totals,
    crawlerCount: crawlers.length,
    crawlers,
    ...seriesOf(
      [...seriesRows],
      crawlers.map((c) => c.crawler)
    ),
    pages: groupPages([...pageRows]),
    files: [...files],
  }
}
