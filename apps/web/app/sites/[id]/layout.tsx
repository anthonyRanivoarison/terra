import { AnalyticsNavProvider } from "@/components/dashboard/nav-context"
import { requireDashboard } from "@/lib/analytics/access"

export default async function SiteLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ id: string }>
}>) {
  const { site } = await params.then(({ id }) => requireDashboard(id))

  return (
    <AnalyticsNavProvider siteId={site.publicId}>
      {children}
    </AnalyticsNavProvider>
  )
}
