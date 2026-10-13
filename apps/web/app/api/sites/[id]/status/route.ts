import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { getSite } from "@/lib/sites"

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() })
  const organizationId = session?.session.activeOrganizationId
  if (!organizationId)
    return Response.json({ error: "unauthorized" }, { status: 401 })
  const site = await getSite(organizationId, (await params).id)
  if (!site) return Response.json({ error: "not found" }, { status: 404 })
  return Response.json(
    { live: site.firstEventAt !== null },
    { headers: { "cache-control": "no-store" } }
  )
}
