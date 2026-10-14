import { beforeAll, describe, expect, it, mock } from "bun:test"
import { parseParams } from "./params"

const SITE = "6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b"
const VISIT = "0a1b2c3d-4e5f-4a6b-8c7d-9e0f1a2b3c4d"
type Captured = { text: string; params: unknown[] }
const unsafeQueries: Captured[] = []
const tagged: { strings: string[]; values: unknown[] }[] = []

const tag = (strings: TemplateStringsArray, ...values: unknown[]) => {
  const entry = { strings: [...strings], values }
  tagged.push(entry)
  return Object.assign(
    Promise.resolve([{ online: 0, visitors: 0, views: 0 }]),
    entry
  )
}
mock.module("@terra/db/client", () => ({
  sql: () =>
    Object.assign(tag, {
      unsafe: (text: string, params: unknown[]) => {
        unsafeQueries.push({ text, params })
        return Promise.resolve([{ visitorId: "x", at: "2026-10-07T00:00:00Z" }])
      },
    }),
}))

const TABLES = /\b(?:FROM|JOIN)\s+(?:visits|views|events)\b/g
const SCOPED = /site_id = (?:\$1::uuid|\w+\.site_id)/g
const JOINED = /\w+\.site_id = \w+\.site_id/g
const count = (text: string, re: RegExp) => (text.match(re) ?? []).length

const params = [
  parseParams({}, Date.now(), "UTC"),
  parseParams(
    { range: "30d", compare: "prev", page: "/", country: "FR", event: "x" },
    Date.now(),
    "Europe/Paris"
  ),
]

beforeAll(async () => {
  const overview = await import("./overview")
  const series = await import("./series")
  const metrics = await import("./metrics")
  const revenue = await import("./revenue")
  const funnel = await import("./funnel")
  const insights = await import("./insights")
  const sessions = await import("./sessions")
  const realtime = await import("./realtime")
  const pages = await import("./pages")
  for (const p of params) {
    await overview.getOverview(SITE, p)
    await series.getSeries(SITE, p)
    for (const s of Object.keys(metrics.SECTIONS) as never[])
      await metrics.getSection(SITE, p, s)
    await metrics.getEvents(SITE, p)
    await metrics.getTab(SITE, p, "country")
    await pages.getPages(SITE, p)
    await revenue.getAttribution(SITE, p)
    await funnel.getFunnel(SITE, p)
    await insights.getHeatmap(SITE, p)
    await insights.getVitals(SITE, p)
    await insights.getPoints(SITE, p)
    await insights.getQuality(SITE, p)
    await sessions.getVisits(SITE, p, 0)
  }
  await sessions.getVisit(SITE, VISIT)
  await realtime.getRealtime(SITE)
  await realtime.getOnline(SITE)
})

describe("site scoping", () => {
  it("binds the site id first in every dynamic query", () => {
    expect(unsafeQueries.length).toBeGreaterThan(40)
    for (const q of unsafeQueries) {
      expect(q.params[0]).toBe(SITE)
      const tables = count(q.text, TABLES)
      expect(tables).toBeGreaterThan(0)
      expect(count(q.text, SCOPED)).toBeGreaterThanOrEqual(tables)
    }
  })

  it("binds the site id in every realtime query", () => {
    const roots = tagged.filter((t) => count(t.strings.join(""), TABLES) > 0)
    expect(roots.length).toBe(8)
    for (const t of roots) {
      const scoped = t.strings.filter(
        (s, i) => /site_id = $/.test(s) && t.values[i] === SITE
      ).length
      expect(scoped + count(t.strings.join(""), JOINED)).toBeGreaterThanOrEqual(
        count(t.strings.join(""), TABLES)
      )
    }
  })
})
