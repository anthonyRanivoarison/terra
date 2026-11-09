"use server"

import { resolveSite } from "@/lib/analytics/access"
import { refreshAnalytics } from "@/lib/analytics/cache"

export async function refreshDashboard(publicId: string): Promise<void> {
  const site = await resolveSite(publicId)
  if (site) refreshAnalytics(site.id)
}
