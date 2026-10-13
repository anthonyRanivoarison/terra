"use client"

import dynamic from "next/dynamic"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { usePoll } from "@/hooks/use-poll"
import type { Realtime } from "@/lib/analytics/realtime"
import { formatNumber } from "../format"
import { useAnalyticsNav } from "../nav-context"
import { LiveFeed } from "./live-feed"
import { MinuteBars } from "./minute-bars"
import { RankList } from "./rank-list"

const VisitorsMap = dynamic(
  () => import("../visitors-map").then((m) => m.VisitorsMap),
  { ssr: false, loading: () => <Skeleton className="size-full rounded-lg" /> }
)

type RealtimeViewType = { initial: Realtime }

export const RealtimeView = ({ initial }: RealtimeViewType) => {
  const { siteId, base } = useAnalyticsNav()
  const data = usePoll<Realtime>(
    `/api/sites/${siteId}/realtime?full=1`,
    5_000,
    initial
  )
  const stats = [
    { label: "Online now", value: data.online },
    { label: "Visitors, 30 min", value: data.visitors30m },
    { label: "Views, 30 min", value: data.views30m },
  ]
  const points = data.points.map((p) => ({ ...p, city: "", country: "" }))

  return (
    <div className="flex flex-col gap-4">
      <Card className="gap-0 py-0">
        <dl className="grid grid-cols-3">
          {stats.map((s, i) => (
            <div key={s.label} className={i ? "border-l p-5" : "p-5"}>
              <dt className="text-sm text-muted-foreground">{s.label}</dt>
              <dd className="text-3xl font-semibold tracking-tight tabular-nums">
                {formatNumber(s.value)}
              </dd>
            </div>
          ))}
        </dl>
      </Card>
      <MinuteBars minutes={data.minutes} />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <Card className="h-[28rem]">
          <CardHeader>
            <CardTitle>Active in the last 30 minutes</CardTitle>
          </CardHeader>
          <CardContent className="min-h-0 flex-1">
            <VisitorsMap
              countries={data.countries.map((c) => ({
                ...c,
                value: c.visitors,
              }))}
              points={points}
            />
          </CardContent>
        </Card>
        <LiveFeed feed={data.feed} base={base} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 [&>*:last-child]:md:col-span-2 [&>*:last-child]:xl:col-span-1">
        <RankList
          title="Active pages"
          rows={data.pages}
          kind="page"
          hint={{
            body: "Pages open in a visible tab right now.",
            how: "A page counts while its tab sends a heartbeat, every 15 seconds.",
          }}
        />
        <RankList
          title="Sources"
          rows={data.referrers}
          kind="referrer"
          hint={{
            body: "Where people active in the last 30 minutes came from.",
            how: "Referring site of the visit, or its channel when there is none.",
          }}
        />
        <RankList
          title="Countries"
          rows={data.countries}
          kind="country"
          hint={{
            body: "Countries of people active in the last 30 minutes.",
            how: "Located from the IP address when the page view arrives.",
          }}
        />
      </div>
    </div>
  )
}
