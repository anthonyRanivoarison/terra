import { Suspense } from "react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { PendingShell } from "@/components/dashboard/nav-context"
import { PagesTable } from "@/components/dashboard/pages/pages-table"
import { loadAnalyticsPage } from "@/components/shell/analytics-page"
import { PageShell } from "@/components/shell/page-shell"
import { Toolbar } from "@/components/shell/toolbar"
import type { SearchParams } from "@/lib/analytics/access"
import { pages } from "@/lib/analytics/cache"
import type { AnalyticsParams } from "@/lib/analytics/params"
import { refreshDashboard } from "../actions"

export const dynamic = "force-dynamic"

type PagesSectionType = {
  siteId: string
  params: AnalyticsParams
  domain: string
}

const PagesSection = async ({ siteId, params, domain }: PagesSectionType) => (
  <PagesTable rows={await pages(siteId, params)} domain={domain} />
)

export default async function PagesPage(page: {
  params: Promise<{ id: string }>
  searchParams: Promise<SearchParams>
}) {
  const { site, query, from, to } = await loadAnalyticsPage(page)
  return (
    <PageShell>
      <Toolbar
        title="Pages"
        params={query}
        from={from}
        to={to}
        refresh={refreshDashboard.bind(null, site.publicId)}
      />
      <PendingShell>
        <Suspense fallback={<Skeleton className="h-[36rem] rounded-lg" />}>
          <PagesSection siteId={site.id} params={query} domain={site.domain} />
        </Suspense>
      </PendingShell>
    </PageShell>
  )
}
