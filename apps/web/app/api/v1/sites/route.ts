import { preflight } from "@/lib/api/cors"
import { apiRoute } from "@/lib/api/handler"
import { listApiSites, publicSite } from "@/lib/api/site"

export const GET = apiRoute("read:stats", async ({ organizationId }) => {
  const sites = await listApiSites(organizationId)
  return Response.json({ data: sites.map(publicSite) })
})

export const OPTIONS = preflight
