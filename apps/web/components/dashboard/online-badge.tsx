"use client"

import Link from "next/link"
import { usePoll } from "@/hooks/use-poll"
import { useAnalyticsNav } from "./nav-context"

export const OnlineBadge = () => {
  const { base, siteId } = useAnalyticsNav()
  const { online } = usePoll<{ online: number | null }>(
    `/api/sites/${siteId}/realtime`,
    10_000,
    { online: null }
  )

  return (
    <Link
      href={`${base}/realtime`}
      className="inline-flex h-8 items-center gap-2 rounded-md px-2 text-sm font-medium transition-colors hover:bg-muted"
    >
      <span className="relative flex size-2" aria-hidden="true">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-60 motion-reduce:hidden" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
      </span>
      <span className="tabular-nums">{online ?? "–"}</span>
      <span className="text-muted-foreground">online</span>
    </Link>
  )
}
