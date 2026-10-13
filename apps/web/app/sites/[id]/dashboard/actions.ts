"use server"

import { refreshAnalytics } from "@/lib/analytics/cache"
import { requireOrganization } from "@/lib/session"
import { getSite } from "@/lib/sites"

export async function refreshDashboard(publicId: string): Promise<void> {
  const site = await getSite(await requireOrganization(), publicId)
  if (site) refreshAnalytics(site.id)
}
