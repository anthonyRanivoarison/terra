import Link from "next/link"
import { notFound } from "next/navigation"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { formatDuration, formatMoney } from "@/components/dashboard/format"
import { VisitMeta } from "@/components/dashboard/sessions/visit-meta"
import { VisitTimeline } from "@/components/dashboard/sessions/visit-timeline"
import { VisitsTable } from "@/components/dashboard/sessions/visits-table"
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
  const { visit, visitor, timeline, others } = detail
  const base = `/sites/${site.publicId}/dashboard`
  const facts = [
    ["Started", new Date(visit.startedAt).toLocaleString("en-GB")],
    ["Duration", formatDuration(visit.durationS)],
    ["Views", String(visit.views)],
    ["Hostname", visit.hostname ?? "—"],
    ["Source", visit.referrer ?? visit.channel],
    ["Channel", visit.channel],
    ["Campaign", visit.utmCampaign ?? "—"],
    ["Entry", visit.entryPage],
    ["Exit", visit.exitPage],
    ["Language", visit.language ?? "—"],
    ["Screen", visit.screen ?? "—"],
    [
      "Visitor",
      `${visitor.visits} ${visitor.visits === 1 ? "visit" : "visits"}, first seen ${new Date(visitor.firstSeen).toLocaleDateString("en-GB")}`,
    ],
    ["Revenue", formatMoney(visitor.revenueCents, settings.currency)],
  ]

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
          <VisitMeta visit={visit} />
        </h2>
        <p className="font-mono text-xs text-muted-foreground">
          {visit.visitorId}
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[20rem_minmax(0,1fr)]">
        <Card>
          <CardContent>
            <dl className="grid grid-cols-[6rem_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
              {facts.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="truncate">{v}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <VisitTimeline items={timeline} currency={settings.currency} />
          </CardContent>
        </Card>
      </div>
      {others.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium">Other visits by this visitor</h2>
          <VisitsTable
            rows={others}
            page={0}
            hasMore={false}
            hrefFor={() => ""}
            base={base}
            currency={settings.currency}
          />
        </section>
      )}
    </PageShell>
  )
}
