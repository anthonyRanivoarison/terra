import { Suspense } from "react"
import { ReportCardSkeleton } from "@/components/dashboard/report/report-card"
import { PendingShell } from "@/components/dashboard/nav-context"
import {
  FunnelSection,
  RevenueSection,
} from "@/components/dashboard/sections-extra"
import { loadAnalyticsPage } from "@/components/shell/analytics-page"
import { PageShell } from "@/components/shell/page-shell"
import { Toolbar } from "@/components/shell/toolbar"
import type { SearchParams } from "@/lib/analytics/access"
import { refreshDashboard } from "../actions"

export const dynamic = "force-dynamic"

export default async function RevenuePage(page: {
  params: Promise<{ id: string }>
  searchParams: Promise<SearchParams>
}) {
  const { site, query, from, to, props } = await loadAnalyticsPage(page)
  return (
    <PageShell>
      <Toolbar
        title="Revenue"
        params={query}
        from={from}
        to={to}
        refresh={refreshDashboard.bind(null, site.publicId)}
      />
      <PendingShell>
        <div className="grid gap-3 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <Suspense fallback={<ReportCardSkeleton />}>
              <RevenueSection {...props} />
            </Suspense>
          </div>
          <Suspense fallback={<ReportCardSkeleton />}>
            <FunnelSection {...props} />
          </Suspense>
        </div>
      </PendingShell>
    </PageShell>
  )
}
