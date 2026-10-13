import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { fetchFavicon } from "@/lib/favicon"
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
  const icon = await fetchFavicon(site.domain)
  if (!icon)
    return new Response(null, {
      status: 404,
      headers: { "cache-control": "private, max-age=3600" },
    })
  return new Response(icon.body, {
    headers: {
      "content-type": icon.type,
      "cache-control": "private, max-age=86400",
      "x-content-type-options": "nosniff",
      "content-security-policy":
        "default-src 'none'; style-src 'unsafe-inline'; sandbox",
    },
  })
}
