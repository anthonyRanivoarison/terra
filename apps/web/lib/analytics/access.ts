import { cache } from "react"
import { notFound } from "next/navigation"
import { isDemoSite } from "@/lib/demo"
import { getOptionalSession, requireOrganization } from "@/lib/session"
import { getDemoSite, getSite, listSites, type SiteSummary } from "@/lib/sites"
import { getSiteSettings } from "./settings"

const switcher = (sites: SiteSummary[]) =>
  sites.map(({ publicId, name, domain }) => ({ publicId, name, domain }))

const ownsSite = async (publicId: string) => {
  const organizationId = (await getOptionalSession())?.session
    .activeOrganizationId
  return organizationId ? getSite(organizationId, publicId) : null
}

const demoDashboard = async (publicId: string) => {
  if (!isDemoSite(publicId) || (await ownsSite(publicId))) return null
  const site = await getDemoSite(publicId)
  if (!site) return null
  return {
    site,
    settings: await getSiteSettings(site.id),
    sites: switcher([site]),
    readOnly: true,
  }
}

export const requireDashboard = cache(async (publicId: string) => {
  const demo = await demoDashboard(publicId)
  if (demo) return demo
  const organizationId = await requireOrganization()
  const [site, sites] = await Promise.all([
    getSite(organizationId, publicId),
    listSites(organizationId),
  ])
  if (!site) notFound()
  const settings = await getSiteSettings(site.id)
  return { site, settings, sites: switcher(sites), readOnly: false }
})

export const resolveSite = async (publicId: string) =>
  (await ownsSite(publicId)) ?? (await getDemoSite(publicId))

export type SearchParams = Record<string, string | string[] | undefined>

export const first = (search: SearchParams, key: string): string | null => {
  const v = search[key]
  return (Array.isArray(v) ? v[0] : v) ?? null
}
