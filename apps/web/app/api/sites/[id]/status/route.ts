import { siteRoute } from "@/lib/api/site-route"

export const GET = siteRoute(async (site) =>
  Response.json(
    { live: site.firstEventAt !== null },
    { headers: { "cache-control": "no-store" } }
  )
)
