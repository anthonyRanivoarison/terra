import { getVisit } from "@/lib/analytics/sessions"
import { preflight } from "@/lib/api/cors"
import { notFound } from "@/lib/api/errors"
import { siteRoute } from "@/lib/api/handler"

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const GET = siteRoute<{ siteId: string; visitId: string }>(
  "read:stats",
  async ({ site, params }) => {
    if (!UUID.test(params.visitId)) return notFound("No such visit.")
    const visit = await getVisit(site.uuid, params.visitId.toLowerCase())
    if (!visit) return notFound("No such visit.")
    return Response.json({ data: visit })
  }
)

export const OPTIONS = preflight
