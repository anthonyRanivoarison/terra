import { sql } from "@terra/db/client"
import { auth } from "../lib/auth"
import { ensureDemoSite, seedTraffic } from "./demo-traffic"

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

await seedTraffic(await ensureDemoSite(orgId))
await db.end()
process.exit(0)
