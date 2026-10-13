import { preflight } from "@/lib/api/cors"
import { siteRoute } from "@/lib/api/handler"
import { publicSite } from "@/lib/api/site"

export const GET = siteRoute("read:stats", async ({ site }) =>
  Response.json({ data: publicSite(site) })
)

export const OPTIONS = preflight
