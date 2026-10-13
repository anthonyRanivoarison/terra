import Link from "next/link"
import { formatDistanceToNowStrict } from "date-fns"
import { Users } from "lucide-react"
import { Card } from "@workspace/ui/components/card"
import type { VisitRow } from "@/lib/analytics/sessions"
import { formatDuration, formatMoney } from "../format"
import { NoData } from "../no-data"
import { VisitMeta } from "./visit-meta"

type VisitsTableType = {
  rows: VisitRow[]
  page: number
  hasMore: boolean
  hrefFor: (page: number) => string
  base: string
  currency: string
}

export const VisitsTable = ({
  rows,
  page,
  hasMore,
  hrefFor,
  base,
  currency,
}: VisitsTableType) => (
  <Card className="gap-0 overflow-hidden py-0">
    {rows.length === 0 && (
      <NoData
        icon={Users}
        title="No sessions found"
        description="No visit matches this date range and these filters."
        className="m-4 min-h-64 w-auto"
      />
    )}
    <ul className="divide-y empty:hidden">
      {rows.map((v) => (
        <li key={v.id}>
          <Link
            href={`${base}/sessions/${v.id}`}
            className="grid gap-1 px-4 py-3 text-sm transition-colors hover:bg-muted/50 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_7rem] md:items-center md:gap-4"
          >
            <VisitMeta visit={v} />
            <span className="truncate text-muted-foreground">
              {v.referrer ?? v.channel}
              {v.utmCampaign ? ` · ${v.utmCampaign}` : ""}
            </span>
            <span className="truncate">
              {v.entryPage}
              <span className="text-muted-foreground">
                {" "}
                · {v.views} {v.views === 1 ? "view" : "views"} ·{" "}
                {formatDuration(v.durationS)}
              </span>
            </span>
            <span className="flex items-center gap-2 text-muted-foreground md:justify-end">
              {v.revenueCents !== 0 && (
                <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-xs font-medium text-emerald-700">
                  {formatMoney(v.revenueCents, currency)}
                </span>
              )}
              <time className="tabular-nums">
                {formatDistanceToNowStrict(new Date(v.startedAt), {
                  addSuffix: true,
                })}
              </time>
            </span>
          </Link>
        </li>
      ))}
    </ul>
    {(page > 0 || hasMore) && (
      <nav
        className="flex justify-between border-t px-4 py-3 text-sm"
        aria-label="Pagination"
      >
        {page > 0 ? (
          <Link
            href={hrefFor(page - 1)}
            className="font-medium hover:underline"
          >
            ← Newer
          </Link>
        ) : (
          <span />
        )}
        {hasMore && (
          <Link
            href={hrefFor(page + 1)}
            className="font-medium hover:underline"
          >
            Older →
          </Link>
        )}
      </nav>
    )}
  </Card>
)
