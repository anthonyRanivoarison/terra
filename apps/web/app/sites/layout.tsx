import type { Metadata } from "next"
import { landingCta } from "@/components/marketing/cta"
import { InformationCard } from "@/components/shell/information-card"
import { SiteHeader } from "@/components/shell/site-header"
import { signUpOpen } from "@/lib/auth"
import { demoSiteIds } from "@/lib/demo"
import { siteConfig } from "@/lib/seo"
import { getOptionalSession, requireOrganization } from "@/lib/session"
import { getDemoSite, listSites } from "@/lib/sites"

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function SitesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getOptionalSession()
  const user = session?.user ?? null
  const sites = user
    ? await requireOrganization().then(listSites)
    : await demoSites()

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <SiteHeader
        sites={sites.map(({ publicId, name, domain }) => ({
          publicId,
          name,
          domain,
        }))}
        cta={landingCta(false, signUpOpen, siteConfig.github)}
        user={user && { name: user.name, email: user.email, image: user.image }}
      />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      {user && (
        <aside className="fixed bottom-4 left-4 z-20 hidden w-60 2xl:block">
          <InformationCard />
        </aside>
      )}
    </div>
  )
}

const demoSites = async () => {
  const sites = await Promise.all(demoSiteIds.map(getDemoSite))
  return sites.filter((site) => site !== null)
}
