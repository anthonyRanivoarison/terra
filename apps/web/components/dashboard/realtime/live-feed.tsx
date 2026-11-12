import Link from "next/link"
import {
  EyeIcon,
  CursorClickIcon,
  BroadcastIcon,
} from "@phosphor-icons/react/ssr"
import { formatDistanceToNowStrict } from "date-fns"
import { Card, CardHeader, CardTitle } from "@workspace/ui/components/card"
import type { FeedItem } from "@/lib/analytics/realtime"
import { DimensionIcon } from "../dimension-icon"
import { NoData } from "../no-data"

type LiveFeedType = { feed: FeedItem[]; base: string }

export const LiveFeed = ({ feed, base }: LiveFeedType) => (
  <Card className="h-[28rem] gap-3 overflow-hidden">
    <CardHeader>
      <CardTitle>Live activity</CardTitle>
    </CardHeader>
    {feed.length === 0 && (
      <div className="flex flex-1 px-4 pb-4">
        <NoData
          icon={BroadcastIcon}
          title="Waiting for visitors"
          description="Page views and clicks stream in here as they happen."
        />
      </div>
    )}
    <ol
      className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-4 empty:hidden"
      aria-live="polite"
    >
      {feed.map((item) => {
        const Icon = item.kind === "view" ? EyeIcon : CursorClickIcon
        const row = (
          <>
            <DimensionIcon kind="country" value={item.country ?? ""} />
            <Icon
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <span className="min-w-0 flex-1 truncate">
              <span
                className={item.kind === "event" ? "font-mono text-[13px]" : ""}
              >
                {item.label}
              </span>
              <span className="text-muted-foreground">
                {" "}
                · {[item.browser, item.device].filter(Boolean).join(", ")}
              </span>
            </span>
            <time className="shrink-0 text-xs text-muted-foreground tabular-nums">
              {formatDistanceToNowStrict(new Date(item.at))}
            </time>
          </>
        )
        return (
          <li
            key={`${item.kind}-${item.at}-${item.label}-${item.visitId}`}
            className="animate-in border-b fade-in-0 slide-in-from-top-1 last:border-0 motion-reduce:animate-none"
          >
            {item.visitId ? (
              <Link
                href={`${base}/sessions/${item.visitId}`}
                className="flex items-center gap-2 rounded-md px-1 py-2 text-sm hover:bg-muted/60"
              >
                {row}
              </Link>
            ) : (
              <div className="flex items-center gap-2 px-1 py-2 text-sm">
                {row}
              </div>
            )}
          </li>
        )
      })}
    </ol>
  </Card>
)
