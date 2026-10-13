import { billingAccess } from "@/lib/billing/access"
import { portalUrl } from "@/lib/billing/portal"

export async function GET(req: Request) {
  const access = await billingAccess()
  if (!access) return Response.redirect(new URL("/auth/signin", req.url))
  const fallback = new URL("/settings/billing", req.url)
  if (!access.canManage) return Response.redirect(fallback)
  const url = await portalUrl(access.organizationId).catch((error) => {
    console.error("[billing] portal session", error)
    return null
  })
  return Response.redirect(url ?? fallback)
}
