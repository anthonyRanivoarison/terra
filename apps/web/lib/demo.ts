export const demoSiteIds = (process.env.DEMO_SITE_IDS ?? "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean)

export const isDemoSite = (publicId: string) => demoSiteIds.includes(publicId)

export const demoPath = demoSiteIds[0]
  ? `/sites/${demoSiteIds[0]}/dashboard`
  : null

export const isDemoPath = (pathname: string) => {
  const [, root, id, section] = pathname.split("/")
  return root === "sites" && isDemoSite(id ?? "") && section === "dashboard"
}
