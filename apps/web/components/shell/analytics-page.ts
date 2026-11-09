import {
  first,
  requireDashboard,
  type SearchParams,
} from "@/lib/analytics/access"
import { parseParams } from "@/lib/analytics/params"

type PageProps = {
  params: Promise<{ id: string }>
  searchParams: Promise<SearchParams>
}

export async function loadAnalyticsPage({ params, searchParams }: PageProps) {
  const [{ site, settings }, search] = await Promise.all([
    params.then(({ id }) => requireDashboard(id)),
    searchParams,
  ])
  const query = parseParams(search, Date.now(), settings.timezone)
  return {
    site,
    settings,
    search,
    query,
    from: first(search, "from"),
    to: first(search, "to"),
    props: { siteId: site.id, params: query, currency: settings.currency },
  }
}
