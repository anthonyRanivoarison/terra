import Link from "next/link"
import { notFound } from "next/navigation"
import { VisitDetail } from "@/components/dashboard/sessions/visit-detail"
import { VisitMeta } from "@/components/dashboard/sessions/visit-meta"
import { PageShell } from "@/components/shell/page-shell"
import { Toolbar } from "@/components/shell/toolbar"
import { requireDashboard } from "@/lib/analytics/access"
import { visit as getVisit } from "@/lib/analytics/cache"

export const dynamic = "force-dynamic"

export default async function VisitPage({
  params,
}: {
  params: Promise<{ id: string; visitId: string }>
}) {
  const { id, visitId } = await params
  const { site, settings } = await requireDashboard(id)
  const detail = await getVisit(site.id, visitId)
  if (!detail) notFound()
  const base = `/sites/${site.publicId}/dashboard`

  return (
    <PageShell>
      <Toolbar title="Visit" />
      <Link
        href={`${base}/sessions`}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← All sessions
      </Link>
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight">
          <VisitMeta visit={detail.visit} />
        </h2>
        <p className="font-mono text-xs text-muted-foreground">
          {detail.visit.visitorId}
        </p>
      </div>
      <VisitDetail detail={detail} base={base} currency={settings.currency} />
    </PageShell>
  )
}
