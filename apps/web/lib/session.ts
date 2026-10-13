import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/auth/signin")
  return session
}

export async function requireOrganization(): Promise<string> {
  const session = await requireUser()
  const active = session.session.activeOrganizationId
  if (active) return active
  const h = await headers()
  const existing = await auth.api.listOrganizations({ headers: h })
  const first = existing[0]
  const id =
    first?.id ??
    (
      await auth.api.createOrganization({
        headers: h,
        body: {
          name: `${session.user.name || "My"} workspace`,
          slug: `ws-${session.user.id.slice(0, 12).toLowerCase()}`,
        },
      })
    )?.id
  if (!id) throw new Error("Could not create a workspace")
  await auth.api.setActiveOrganization({
    headers: h,
    body: { organizationId: id },
  })
  return id
}
