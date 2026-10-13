import { notFound } from "next/navigation"
import { requireOrganization } from "@/lib/session"
import { getSite, listSites } from "@/lib/sites"
import { getSiteSettings } from "./settings"

export async function requireDashboard(publicId: string) {
  const organizationId = await requireOrganization()
  const [site, sites] = await Promise.all([
    getSite(organizationId, publicId),
    listSites(organizationId),
  ])
  if (!site) notFound()
  const settings = await getSiteSettings(site.id)
  return {
    site,
    settings,
    sites: sites.map(({ publicId, name, domain }) => ({
      publicId,
      name,
      domain,
    })),
  }
}

export type SearchParams = Record<string, string | string[] | undefined>

export const first = (search: SearchParams, key: string): string | null => {
  const v = search[key]
  return (Array.isArray(v) ? v[0] : v) ?? null
}
