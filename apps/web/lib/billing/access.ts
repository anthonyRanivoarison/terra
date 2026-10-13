import { headers } from "next/headers"
import { auth } from "@/lib/auth"

export type BillingAccess = {
  organizationId: string
  email: string
  canManage: boolean
}

export async function billingAccess(): Promise<BillingAccess | null> {
  const h = await headers()
  const session = await auth.api.getSession({ headers: h })
  const organizationId = session?.session.activeOrganizationId
  if (!session || !organizationId) return null
  const member = await auth.api
    .getActiveMember({ headers: h })
    .catch(() => null)
  const roles = String(member?.role ?? "").split(",")
  return {
    organizationId,
    email: session.user.email,
    canManage: roles.includes("owner") || roles.includes("admin"),
  }
}
