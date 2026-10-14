import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getSite, type SiteSummary } from "@/lib/sites"

type Context = { params: Promise<{ id: string }> }
type Handler = (site: SiteSummary, request: Request) => Promise<Response>

export const siteRoute =
  (handler: Handler) =>
  async (request: Request, { params }: Context): Promise<Response> => {
    const session = await auth.api.getSession({ headers: await headers() })
    const organizationId = session?.session.activeOrganizationId
    if (!organizationId)
      return Response.json({ error: "unauthorized" }, { status: 401 })
    const site = await getSite(organizationId, (await params).id)
    if (!site) return Response.json({ error: "not found" }, { status: 404 })
    return handler(site, request)
  }
