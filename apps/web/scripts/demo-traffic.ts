import { sql } from "@terra/db/client"
import { createSite } from "../lib/sites"

export type DemoSite = {
  name: string
  domain: string
  visits: number
  crawls: number
}

export const DEMO_SITES: DemoSite[] = [
  { name: "Launch.now", domain: "launch-now.dev", visits: 16000, crawls: 4000 },
  { name: "Rova Studio", domain: "rova.studio", visits: 7000, crawls: 1500 },
  {
    name: "Field Notes",
    domain: "fieldnotes.blog",
    visits: 3500,
    crawls: 2500,
  },
]

export async function ensureDemoSite(
  organizationId: string,
  site: DemoSite
): Promise<string> {
  const [found] = await sql()`
    SELECT public_id FROM sites
    WHERE organization_id = ${organizationId} AND domain = ${site.domain}
  `
  return (
    found?.public_id ??
    (await createSite(organizationId, site.name, site.domain))
  )
}

export async function seedTraffic(
  publicId: string,
  demo: DemoSite
): Promise<void> {
  const db = sql()
  const [site] = await db`SELECT id FROM sites WHERE public_id = ${publicId}`
  const siteId = site!.id as string

  await db`DELETE FROM visits WHERE site_id = ${siteId}`
  await db`DELETE FROM views WHERE site_id = ${siteId}`
  await db`DELETE FROM events WHERE site_id = ${siteId}`
  await db`DELETE FROM crawls WHERE site_id = ${siteId}`

  await db.unsafe(
    await Bun.file(new URL("./seed-demo.sql", import.meta.url)).text(),
    [siteId, demo.domain, demo.visits, demo.crawls, demo.name]
  )
  await db`
    UPDATE visits v SET entry_page = f.page, exit_page = l.page
    FROM (
      SELECT DISTINCT ON (visit_id) visit_id, page FROM views
      WHERE site_id = ${siteId} ORDER BY visit_id, entered_at
    ) f, (
      SELECT DISTINCT ON (visit_id) visit_id, page FROM views
      WHERE site_id = ${siteId} ORDER BY visit_id, entered_at DESC
    ) l
    WHERE v.site_id = ${siteId} AND f.visit_id = v.id AND l.visit_id = v.id
  `
  await db`
    UPDATE sites SET first_event_at = COALESCE(first_event_at, now())
    WHERE id = ${siteId}
  `

  const [counts] = await db`
    SELECT (SELECT count(*) FROM visits WHERE site_id = ${siteId})::int AS visits,
      (SELECT count(*) FROM views WHERE site_id = ${siteId})::int AS views,
      (SELECT count(*) FROM events WHERE site_id = ${siteId})::int AS events,
      (SELECT count(*) FROM crawls WHERE site_id = ${siteId})::int AS crawls
  `
  console.log(`Seeded ${publicId}`, counts)
}
