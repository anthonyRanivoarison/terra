import { AwaitingFirstEvent } from "@/components/dashboard/awaiting/awaiting-first-event"
import { PendingShell } from "@/components/dashboard/nav-context"
import { VisitsTable } from "@/components/dashboard/sessions/visits-table"
import { PageShell } from "@/components/shell/page-shell"
import { Toolbar } from "@/components/shell/toolbar"
import {
  first,
  requireDashboard,
  type SearchParams,
} from "@/lib/analytics/access"
import { visits } from "@/lib/analytics/cache"
import { parseParams } from "@/lib/analytics/params"

export const dynamic = "force-dynamic"

export default async function SessionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<SearchParams>
}) {
  const { site, settings } = await requireDashboard((await params).id)
  const search = await searchParams
  const query = parseParams(search, Date.now(), settings.timezone)
  const page = Math.max(0, Number(first(search, "page_n")) || 0)
  const { rows, hasMore } = await visits(site.id, query, page)
  const base = `/sites/${site.publicId}/dashboard`
  const hrefFor = (n: number) => {
    const next = new URLSearchParams()
    for (const key of Object.keys(search)) {
      const v = first(search, key)
      if (v && key !== "page_n") next.set(key, v)
    }
    if (n > 0) next.set("page_n", String(n))
    const qs = next.toString()
    return `${base}/sessions${qs ? `?${qs}` : ""}`
  }

  return (
    <PageShell>
      <Toolbar
        title="Sessions"
        params={query}
        from={first(search, "from")}
        to={first(search, "to")}
      />
      <PendingShell>
        <VisitsTable
          rows={rows}
          page={page}
          hasMore={hasMore}
          hrefFor={hrefFor}
          base={base}
          currency={settings.currency}
        />
      </PendingShell>
      <AwaitingFirstEvent site={site} />
    </PageShell>
  )
}
