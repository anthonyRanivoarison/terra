import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import type { VisitDetail as Detail } from "@/lib/analytics/sessions"
import { formatDuration, formatMoney } from "../format"
import { VisitTimeline } from "./visit-timeline"
import { VisitsTable } from "./visits-table"

type VisitDetailType = { detail: Detail; base: string; currency: string }

export const VisitDetail = ({ detail, base, currency }: VisitDetailType) => {
  const { visit, visitor, timeline, others } = detail
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
    ["Revenue", formatMoney(visitor.revenueCents, currency)],
  ]

  return (
    <div className="@container flex flex-col gap-4">
      <div className="grid gap-4 @4xl:grid-cols-[20rem_minmax(0,1fr)]">
        <Card>
          <CardContent>
            <dl className="grid grid-cols-[6rem_minmax(0,1fr)] gap-x-3 gap-y-2 text-sm">
              {facts.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="truncate" title={v}>
                    {v}
                  </dd>
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
            <VisitTimeline items={timeline} currency={currency} />
          </CardContent>
        </Card>
      </div>
      {others.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-medium">Other visits by this visitor</h3>
          <VisitsTable
            rows={others}
            page={0}
            hasMore={false}
            hrefFor={() => ""}
            base={base}
            currency={currency}
          />
        </section>
      )}
    </div>
  )
}
