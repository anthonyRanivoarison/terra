import { AwaitingFirstEvent } from "@/components/dashboard/awaiting/awaiting-first-event"
import { Suspense } from "react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { AnalyticsHeader } from "@/components/dashboard/analytics-header"
import { MetricTableSkeleton } from "@/components/dashboard/metric-table"
import {
  AnalyticsNavProvider,
  PendingShell,
} from "@/components/dashboard/nav-context"
import { OverviewSkeleton } from "@/components/dashboard/overview-cards"
import {
  ChartSection,
  MapSection,
  MetricSection,
  OverviewSection,
} from "@/components/dashboard/sections"
import {
  EventsSection,
  FunnelSection,
  HeatmapSection,
  QualitySection,
  RevenueSection,
  VitalsSection,
} from "@/components/dashboard/sections-extra"
import {
  first,
  requireDashboard,
  type SearchParams,
} from "@/lib/analytics/access"
import { BotTrafficSection } from "@/components/dashboard/bot-traffic/bot-traffic-section"
import { parseParams } from "@/lib/analytics/params"
import { refreshDashboard } from "./actions"

export const dynamic = "force-dynamic"

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<SearchParams>
}) {
  const { site, sites, settings } = await requireDashboard((await params).id)
  const search = await searchParams
  const query = parseParams(search, Date.now(), settings.timezone)
  const props = { siteId: site.id, params: query, currency: settings.currency }
  const table = <MetricTableSkeleton />
  const block = (h: string) => <Skeleton className={`${h} rounded-xl`} />

  return (
    <AnalyticsNavProvider siteId={site.publicId}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6">
        <AnalyticsHeader
          sites={sites}
          description={`Traffic and revenue on ${site.domain}`}
          refresh={refreshDashboard.bind(null, site.publicId)}
          params={query}
          from={first(search, "from")}
          to={first(search, "to")}
        />
        <PendingShell>
          <Suspense fallback={<OverviewSkeleton />}>
            <OverviewSection {...props} />
          </Suspense>
          <Suspense fallback={block("h-[20.5rem]")}>
            <ChartSection {...props} />
          </Suspense>

          <div className="grid gap-4 lg:grid-cols-2">
            <Suspense fallback={table}>
              <MetricSection {...props} name="pages" />
            </Suspense>
            <Suspense fallback={table}>
              <MetricSection {...props} name="sources" />
            </Suspense>
          </div>

          <Suspense fallback={block("h-[34rem]")}>
            <MapSection {...props} />
          </Suspense>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Suspense fallback={table}>
              <MetricSection {...props} name="location" />
            </Suspense>
            <Suspense fallback={table}>
              <MetricSection {...props} name="environment" />
            </Suspense>
            <div className="md:col-span-2 xl:col-span-1">
              <Suspense fallback={table}>
                <EventsSection {...props} />
              </Suspense>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <Suspense fallback={table}>
                <RevenueSection {...props} />
              </Suspense>
            </div>
            <Suspense fallback={table}>
              <FunnelSection {...props} />
            </Suspense>
          </div>

          <Suspense fallback={block("h-[30rem]")}>
            <VitalsSection {...props} />
          </Suspense>

          <div className="grid gap-4 xl:grid-cols-3">
            <div className="min-w-0 xl:col-span-2">
              <Suspense fallback={block("h-[31rem]")}>
                <HeatmapSection {...props} />
              </Suspense>
            </div>
            <div className="relative h-[31rem] min-w-0 xl:h-auto">
              <Suspense fallback={block("h-[31rem]")}>
                <QualitySection {...props} />
              </Suspense>
            </div>
          </div>

          <Suspense fallback={block("h-[32rem]")}>
            <BotTrafficSection
              key={`${query.current.from}-${query.current.to}`}
              siteId={site.id}
              from={query.current.from}
              to={query.current.to}
              granularity={query.granularity}
              tz={settings.timezone}
              setupHref={`/sites/${site.publicId}#bot-tracking`}
            />
          </Suspense>
        </PendingShell>
      </div>
      <AwaitingFirstEvent site={site} />
    </AnalyticsNavProvider>
  )
}
