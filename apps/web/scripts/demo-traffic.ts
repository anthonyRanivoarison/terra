import { sql } from "@terra/db/client"
import { createSite } from "../lib/sites"

export const DEMO_DOMAIN = "launch-now.dev"

export async function ensureDemoSite(organizationId: string): Promise<string> {
  const [found] = await sql()`
    SELECT public_id FROM sites
    WHERE organization_id = ${organizationId} AND domain = ${DEMO_DOMAIN}
  `
  return (
    found?.public_id ??
    (await createSite(organizationId, "Launch.now", DEMO_DOMAIN))
  )
}

export async function seedTraffic(publicId: string): Promise<void> {
  const db = sql()
  const [site] = await db`SELECT id FROM sites WHERE public_id = ${publicId}`
  const siteId = site!.id as string

  await db`DELETE FROM visits WHERE site_id = ${siteId}`
  await db`DELETE FROM views WHERE site_id = ${siteId}`
  await db`DELETE FROM events WHERE site_id = ${siteId}`
  await db`DELETE FROM crawls WHERE site_id = ${siteId}`

  await db.unsafe(
    await Bun.file(new URL("./seed-demo.sql", import.meta.url)).text(),
    [siteId]
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
