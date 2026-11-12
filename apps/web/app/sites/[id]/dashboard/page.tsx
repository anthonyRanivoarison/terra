import { Suspense, type ReactNode } from "react"
import { AwaitingFirstEvent } from "@/components/dashboard/awaiting/awaiting-first-event"
import { PendingShell } from "@/components/dashboard/nav-context"
import { ReportCardSkeleton } from "@/components/dashboard/report/report-card"
import {
  MetricSection,
  OverviewSection,
  OverviewSkeleton,
} from "@/components/dashboard/sections"
import {
  CrawlersSection,
  EventsSection,
  FunnelSection,
  HeatmapSection,
  RevenueSection,
} from "@/components/dashboard/sections-extra"
import { loadAnalyticsPage } from "@/components/shell/analytics-page"
import { PageShell } from "@/components/shell/page-shell"
import { Toolbar } from "@/components/shell/toolbar"
import type { SearchParams } from "@/lib/analytics/access"
import { refreshDashboard } from "./actions"

export const dynamic = "force-dynamic"

const Slot = ({ children }: { children: ReactNode }) => (
  <Suspense fallback={<ReportCardSkeleton />}>{children}</Suspense>
)

export default async function DashboardPage(page: {
  params: Promise<{ id: string }>
  searchParams: Promise<SearchParams>
}) {
  const { site, query, from, to, props } = await loadAnalyticsPage(page)
  const report = { ...props, domain: site.domain }

  return (
    <PageShell>
      <Toolbar
        title={`Overview of ${site.domain}`}
        params={query}
        from={from}
        to={to}
        refresh={refreshDashboard.bind(null, site.publicId)}
      />
      <PendingShell>
        <Suspense fallback={<OverviewSkeleton />}>
          <OverviewSection {...props} />
        </Suspense>
        <div className="grid gap-3 lg:grid-cols-2">
          <Slot>
            <MetricSection {...report} name="sources" />
          </Slot>
          <Slot>
            <MetricSection {...report} name="pages" />
          </Slot>
          <Slot>
            <MetricSection {...report} name="location" />
          </Slot>
          <Slot>
            <MetricSection {...report} name="environment" />
          </Slot>
          <Slot>
            <RevenueSection {...props} />
          </Slot>
          <Slot>
            <FunnelSection {...props} />
          </Slot>
          <Slot>
            <EventsSection {...props} />
          </Slot>
          <Slot>
            <CrawlersSection {...props} />
          </Slot>
        </div>
        <Suspense fallback={<ReportCardSkeleton />}>
          <HeatmapSection {...props} />
        </Suspense>
      </PendingShell>
      <AwaitingFirstEvent site={site} />
    </PageShell>
  )
}
