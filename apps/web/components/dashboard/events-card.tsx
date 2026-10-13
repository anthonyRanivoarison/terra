"use client"

import { useState } from "react"
import { ChevronRight } from "lucide-react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card"
import type { EventStat } from "@/lib/analytics/metrics"
import { cn } from "@workspace/ui/lib/utils"
import { formatNumber } from "./format"
import { useAnalyticsNav } from "./nav-context"
import { GoalsEmpty } from "./events/goals-empty"

const AUTO = new Set(["click", "outbound_click", "pageview", "page_view"])

type EventsCardType = { events: EventStat[] }

export const EventsCard = ({ events }: EventsCardType) => {
  const [open, setOpen] = useState<string | null>(null)
  const { update, get, siteId } = useAnalyticsNav()
  const empty = !events.some((e) => !AUTO.has(e.label))
  const max = Math.max(1, ...events.map((e) => e.value))

  return (
    <Card className="h-[29rem] gap-3 overflow-hidden">
      <CardHeader>
        <CardTitle>Events</CardTitle>
        <CardDescription>
          Clicks, outbound links and custom events
        </CardDescription>
      </CardHeader>
      {empty && <GoalsEmpty publicId={siteId} />}
      <ul className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-4 pb-4 empty:hidden">
        {(empty ? [] : events).map((event) => {
          const expanded = open === event.label
          const filtered = get("event") === event.label
          return (
            <li key={event.label} className="flex flex-col">
              <div className="relative flex items-center gap-1 overflow-hidden rounded-md text-sm">
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-0 rounded-md bg-primary/10"
                  style={{ width: `${(event.value / max) * 100}%` }}
                />
                <button
                  type="button"
                  aria-expanded={expanded}
                  disabled={!event.props.length}
                  onClick={() => setOpen(expanded ? null : event.label)}
                  aria-label={`Show properties of ${event.label}`}
                  className="relative rounded p-1.5 text-muted-foreground enabled:hover:text-foreground disabled:opacity-30"
                >
                  <ChevronRight
                    className={cn(
                      "size-3.5 transition-transform",
                      expanded && "rotate-90"
                    )}
                    aria-hidden
                  />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    update({ event: filtered ? null : event.label })
                  }
                  className={cn(
                    "relative flex flex-1 items-center justify-between gap-3 rounded-md py-1.5 pr-2 text-left hover:bg-muted/60",
                    filtered && "ring-1 ring-primary"
                  )}
                >
                  <span className="truncate font-mono text-[13px]">
                    {event.label}
                  </span>
                  <span className="font-medium tabular-nums">
                    {formatNumber(event.value)}
                  </span>
                </button>
              </div>
              {expanded && (
                <ul className="mt-1 mb-2 ml-8 flex flex-col gap-0.5 border-l pl-3 text-xs">
                  {event.props.slice(0, 12).map((p) => (
                    <li
                      key={`${p.key}=${p.value}`}
                      className="flex justify-between gap-3 py-0.5"
                    >
                      <span className="min-w-0 truncate">
                        <span className="text-muted-foreground">{p.key}</span>{" "}
                        {p.value}
                      </span>
                      <span className="tabular-nums">
                        {formatNumber(p.count)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
