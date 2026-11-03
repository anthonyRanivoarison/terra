export const demoSiteId = process.env.DEMO_SITE_ID || null

export const isDemoSite = (publicId: string) =>
  demoSiteId !== null && publicId === demoSiteId

export const demoPath = demoSiteId ? `/sites/${demoSiteId}/dashboard` : null

export const isDemoPath = (pathname: string) =>
  demoPath !== null &&
  (pathname === demoPath || pathname.startsWith(`${demoPath}/`))
