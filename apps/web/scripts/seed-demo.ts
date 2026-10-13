import { sql } from "@terra/db/client"
import { auth } from "../lib/auth"
import { createSite } from "../lib/sites"

const DEMO = {
  name: "Demo",
  email: "demo@terra.test",
  password: "terra-demo-password",
}

const FRESH = {
  name: "New user",
  email: "new@terra.test",
  password: "terra-new-password",
}

const db = sql()
const [fresh] = await db`SELECT id FROM "user" WHERE email = ${FRESH.email}`
if (!fresh) await auth.api.signUpEmail({ body: FRESH })
const existing = await db`SELECT id FROM "user" WHERE email = ${DEMO.email}`
const userId =
  existing[0]?.id ?? (await auth.api.signUpEmail({ body: DEMO })).user.id

const orgs = await db`
  SELECT o.id FROM organization o JOIN member m ON m."organizationId" = o.id
  WHERE m."userId" = ${userId}
`
const orgId =
  orgs[0]?.id ??
  (
    await auth.api.createOrganization({
      body: {
        name: "Demo workspace",
        slug: `demo-${userId.slice(0, 8).toLowerCase()}`,
        userId,
      },
    })
  )?.id

const [found] = await db`
  SELECT public_id FROM sites WHERE organization_id = ${orgId} AND domain = 'launch-now.dev'
`
const publicId =
  found?.public_id ?? (await createSite(orgId, "Launch.now", "launch-now.dev"))
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
await db.end()
process.exit(0)
