"use client"

import { CircleHelp } from "lucide-react"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@workspace/ui/components/hover-card"
import { cn } from "@workspace/ui/lib/utils"

const HINTS: Record<string, { title: string; body: string; how: string }> = {
  visitors: {
    title: "Visitors",
    body: "Unique people who came to the site. One browser on one device counts once.",
    how: "Distinct first-party visitor ids, bots excluded.",
  },
  visits: {
    title: "Visits",
    body: "Sessions on the site. A visit ends after 30 minutes without any activity.",
    how: "One person coming back in the evening counts as two visits.",
  },
  views: {
    title: "Views",
    body: "Pages loaded, including navigations inside the app without a full reload.",
    how: "Every page view from human visitors.",
  },
  bounceRate: {
    title: "Bounce rate",
    body: "Share of visits that saw a single page and did nothing else. Lower is better.",
    how: "Visits with one view and no click or event ÷ all visits.",
  },
  visitDuration: {
    title: "Visit duration",
    body: "Average time people spend on the site per visit.",
    how: "Time between first and last activity, for visits that did not bounce.",
  },
  revenueCents: {
    title: "Revenue",
    body: "Money made in the period, net of refunds and chargebacks.",
    how: "Purchase events from your payment provider, refunds subtracted.",
  },
  conversionRate: {
    title: "Conversion",
    body: "Share of visitors who made a purchase.",
    how: "Visitors with a purchase ÷ all visitors.",
  },
}

type InfoHintType = {
  title: string
  body: string
  how: string
  reveal?: boolean
}

export const InfoHint = ({
  title,
  body,
  how,
  reveal = false,
}: InfoHintType) => (
  <HoverCard>
    <HoverCardTrigger
      delay={150}
      render={
        <button
          type="button"
          aria-label={`What is ${title.toLowerCase()}?`}
          className={cn(
            "-m-1 cursor-help rounded-full p-1 text-muted-foreground transition-[opacity,color] duration-150 hover:text-foreground data-[popup-open]:text-foreground",
            reveal &&
              "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[popup-open]:opacity-100"
          )}
        />
      }
    >
      <CircleHelp className="size-3.5" strokeWidth={2} aria-hidden />
    </HoverCardTrigger>
    <HoverCardContent side="bottom" align="start" className="w-72">
      <div className="flex flex-col gap-2 text-sm">
        <p className="font-medium">{title}</p>
        <p className="text-muted-foreground">{body}</p>
        <p className="border-t pt-2 text-xs text-muted-foreground">{how}</p>
      </div>
    </HoverCardContent>
  </HoverCard>
)

type MetricHintType = { metric: string }

export const MetricHint = ({ metric }: MetricHintType) => {
  const hint = HINTS[metric]
  if (!hint) return null
  return (
    <InfoHint
      {...hint}
      how={`${hint.how} The badge compares with the previous period of the same length.`}
      reveal
    />
  )
}
