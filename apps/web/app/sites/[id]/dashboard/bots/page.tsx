import { Suspense } from "react"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { BotTrafficSection } from "@/components/dashboard/bot-traffic/bot-traffic-section"
import { PendingShell } from "@/components/dashboard/nav-context"
import { QualitySection } from "@/components/dashboard/sections-extra"
import { loadAnalyticsPage } from "@/components/shell/analytics-page"
import { PageShell } from "@/components/shell/page-shell"
import { Toolbar } from "@/components/shell/toolbar"
import type { SearchParams } from "@/lib/analytics/access"
import { refreshDashboard } from "../actions"

export const dynamic = "force-dynamic"

export default async function BotsPage(page: {
  params: Promise<{ id: string }>
  searchParams: Promise<SearchParams>
}) {
  const { site, settings, query, from, to, props } =
    await loadAnalyticsPage(page)
  return (
    <PageShell>
      <Toolbar
        title="AI & bots"
        params={query}
        from={from}
        to={to}
        refresh={refreshDashboard.bind(null, site.publicId)}
      />
      <PendingShell>
        <Suspense fallback={<Skeleton className="h-[32rem] rounded-lg" />}>
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
        <div className="relative h-[31rem]">
          <Suspense fallback={<Skeleton className="h-[31rem] rounded-lg" />}>
            <QualitySection {...props} />
          </Suspense>
        </div>
      </PendingShell>
    </PageShell>
  )
}
