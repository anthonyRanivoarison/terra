import { Suspense } from "react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { PendingShell } from "@/components/dashboard/nav-context"
import { VitalsSection } from "@/components/dashboard/sections-extra"
import { loadAnalyticsPage } from "@/components/shell/analytics-page"
import { PageShell } from "@/components/shell/page-shell"
import { Toolbar } from "@/components/shell/toolbar"
import type { SearchParams } from "@/lib/analytics/access"
import { refreshDashboard } from "../actions"

export const dynamic = "force-dynamic"

export default async function PerformancePage(page: {
  params: Promise<{ id: string }>
  searchParams: Promise<SearchParams>
}) {
  const { site, query, from, to, props } = await loadAnalyticsPage(page)
  return (
    <PageShell>
      <Toolbar
        title="Performance"
        params={query}
        from={from}
        to={to}
        refresh={refreshDashboard.bind(null, site.publicId)}
      />
      <PendingShell>
        <Suspense fallback={<Skeleton className="h-[30rem] rounded-lg" />}>
          <VitalsSection {...props} />
        </Suspense>
      </PendingShell>
    </PageShell>
  )
}
