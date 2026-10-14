import { AwaitingFirstEvent } from "@/components/dashboard/awaiting/awaiting-first-event"
import { RealtimeView } from "@/components/dashboard/realtime/realtime-view"
import { PageShell } from "@/components/shell/page-shell"
import { Toolbar } from "@/components/shell/toolbar"
import { requireDashboard } from "@/lib/analytics/access"
import { realtime } from "@/lib/analytics/cache"

export const dynamic = "force-dynamic"

export default async function RealtimePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { site } = await requireDashboard((await params).id)
  const initial = await realtime(site.id)
  return (
    <PageShell>
      <Toolbar title="Realtime" />
      <RealtimeView initial={initial} />
      <AwaitingFirstEvent site={site} />
    </PageShell>
  )
}
