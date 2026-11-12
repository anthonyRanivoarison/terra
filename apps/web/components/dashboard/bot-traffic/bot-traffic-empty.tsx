"use client"

import Link from "next/link"
import {
  BrainIcon,
  EyeSlashIcon,
  ChatTextIcon,
  MagnifyingGlassIcon,
  SparkleIcon,
} from "@phosphor-icons/react/ssr"
import { Button, buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import type { CrawlCategory } from "@/lib/analytics/crawls"
import { SamplePreview } from "../empty/sample-preview"
import { BotTrafficSample } from "./bot-traffic-sample"
import { CATEGORIES } from "./crawler-meta"

const ICONS: Record<CrawlCategory, typeof MagnifyingGlassIcon> = {
  answers: ChatTextIcon,
  indexing: MagnifyingGlassIcon,
  training: BrainIcon,
}

type BotTrafficEmptyType = { setupHref: string; onHide: () => void }

export const BotTrafficEmpty = ({ setupHref, onHide }: BotTrafficEmptyType) => (
  <div className="flex flex-col gap-4">
    <div className="flex gap-1 border-b text-sm font-medium">
      {CATEGORIES.map((c, i) => {
        const Icon = ICONS[c.key]
        return (
          <span
            key={c.key}
            className={cn(
              "-mb-px flex items-center gap-1.5 border-b-2 px-2 pb-2",
              i === 0
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground"
            )}
          >
            <Icon aria-hidden className="size-4" />
            {c.label}
            <span className="text-xs text-muted-foreground tabular-nums">
              0
            </span>
          </span>
        )
      })}
    </div>
    <SamplePreview sample={<BotTrafficSample />}>
      <div className="flex w-full max-w-sm flex-col items-center gap-3 rounded-lg border bg-background/95 p-6 text-center shadow-lg">
        <h3 className="text-base font-semibold">No bot traffic detected yet</h3>
        <p className="text-sm text-balance text-muted-foreground">
          Install the server-side tracker to see when AI assistants, search
          engines, and model training crawlers request your pages.
        </p>
        <div className="flex flex-wrap justify-center gap-2 pt-1">
          <Link href={setupHref} className={buttonVariants({ size: "sm" })}>
            <SparkleIcon aria-hidden />
            Set up bot tracking
          </Link>
          <Button variant="ghost" size="sm" onClick={onHide}>
            <EyeSlashIcon aria-hidden />
            Hide this card
          </Button>
        </div>
      </div>
    </SamplePreview>
  </div>
)
