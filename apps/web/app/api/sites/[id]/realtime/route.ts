import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { online, realtime } from "@/lib/analytics/cache"
import { getSite } from "@/lib/sites"

export const dynamic = "force-dynamic"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() })
  const organizationId = session?.session.activeOrganizationId
  if (!organizationId)
    return Response.json({ error: "unauthorized" }, { status: 401 })
  const site = await getSite(organizationId, (await params).id)
  if (!site) return Response.json({ error: "not found" }, { status: 404 })
  const full = new URL(request.url).searchParams.get("full") === "1"
  const body = full
    ? await realtime(site.id)
    : { online: await online(site.id) }
  return Response.json(body, { headers: { "cache-control": "no-store" } })
}
