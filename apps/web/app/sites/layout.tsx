import type { Metadata } from "next"
import { cookies } from "next/headers"
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"
import { SiteSidebar } from "@/components/shell/site-sidebar"
import { demoSiteIds } from "@/lib/demo"
import { getOptionalSession, requireOrganization } from "@/lib/session"
import { getDemoSite, listSites } from "@/lib/sites"

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function SitesLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [session, store] = await Promise.all([getOptionalSession(), cookies()])
  const user = session?.user ?? null
  const sites = user
    ? await requireOrganization().then(listSites)
    : await demoSites()

  return (
    <SidebarProvider
      defaultOpen={store.get("sidebar_state")?.value !== "false"}
      style={{ "--sidebar-width": "17rem" } as React.CSSProperties}
    >
      <SiteSidebar
        sites={sites.map(({ publicId, name, domain }) => ({
          publicId,
          name,
          domain,
        }))}
        user={user && { name: user.name, email: user.email, image: user.image }}
      />
      <SidebarInset className="min-w-0 md:peer-data-[variant=inset]:border md:peer-data-[variant=inset]:shadow-[0_1px_3px_oklch(0_0_0/0.06)]">
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}

const demoSites = async () => {
  const sites = await Promise.all(demoSiteIds.map(getDemoSite))
  return sites.filter((site) => site !== null)
}
