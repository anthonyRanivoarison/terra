import { resolveSite } from "@/lib/analytics/access"
import type { SiteSummary } from "@/lib/sites"

type Context = { params: Promise<{ id: string }> }
type Handler = (site: SiteSummary, request: Request) => Promise<Response>

export const siteRoute =
  (handler: Handler) =>
  async (request: Request, { params }: Context): Promise<Response> => {
    const site = await resolveSite((await params).id)
    if (!site) return Response.json({ error: "not found" }, { status: 404 })
    return handler(site, request)
  }
