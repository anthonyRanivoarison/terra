import { cookies } from "next/headers"
import { SidebarInset, SidebarProvider } from "@workspace/ui/components/sidebar"
import { AnalyticsNavProvider } from "@/components/dashboard/nav-context"
import { SiteSidebar } from "@/components/shell/site-sidebar"
import { requireDashboard } from "@/lib/analytics/access"
import { requireUser } from "@/lib/session"

export default async function SiteLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ id: string }>
}>) {
  const [{ site, sites }, { user }, store] = await Promise.all([
    params.then(({ id }) => requireDashboard(id)),
    requireUser(),
    cookies(),
  ])

  return (
    <AnalyticsNavProvider siteId={site.publicId}>
      <SidebarProvider
        defaultOpen={store.get("sidebar_state")?.value !== "false"}
      >
        <SiteSidebar
          sites={sites}
          user={{ name: user.name, email: user.email, image: user.image }}
        />
        <SidebarInset className="min-w-0">{children}</SidebarInset>
      </SidebarProvider>
    </AnalyticsNavProvider>
  )
}
