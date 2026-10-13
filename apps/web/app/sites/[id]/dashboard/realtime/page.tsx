import { AwaitingFirstEvent } from "@/components/dashboard/awaiting/awaiting-first-event"
import { AnalyticsHeader } from "@/components/dashboard/analytics-header"
import { AnalyticsNavProvider } from "@/components/dashboard/nav-context"
import { RealtimeView } from "@/components/dashboard/realtime/realtime-view"
import { requireDashboard } from "@/lib/analytics/access"
import { realtime } from "@/lib/analytics/cache"

export const dynamic = "force-dynamic"

export default async function RealtimePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { site, sites } = await requireDashboard((await params).id)
  const initial = await realtime(site.id)
  return (
    <AnalyticsNavProvider siteId={site.publicId}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6">
        <AnalyticsHeader
          sites={sites}
          description={`Who is on ${site.domain} right now`}
        />
        <RealtimeView initial={initial} />
      </div>
      <AwaitingFirstEvent site={site} />
    </AnalyticsNavProvider>
  )
}
