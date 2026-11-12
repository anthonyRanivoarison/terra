"use client"

import { useState } from "react"
import { RobotIcon, TreeStructureIcon } from "@phosphor-icons/react/ssr"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import type { Quality } from "@/lib/analytics/insights"
import { cn } from "@workspace/ui/lib/utils"
import { DimensionIcon } from "./dimension-icon"
import { Donut } from "./donut"
import { formatNumber, formatPercent } from "./format"
import { NoData } from "./no-data"

type Row = { label: string; count: number }

type BarListType = { rows: Row[]; kind: string }

const BarList = ({ rows, kind }: BarListType) => {
  const max = Math.max(1, ...rows.map((r) => r.count))
  return (
    <ul className="-mx-1 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-1">
      {rows.map((row) => (
        <li
          key={row.label}
          className="relative flex items-center justify-between gap-3 overflow-hidden rounded-md px-2 py-1.5 text-sm"
        >
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-0 rounded-md bg-primary/10"
            style={{ width: `${(row.count / max) * 100}%` }}
          />
          <span className="relative flex min-w-0 items-center gap-2">
            <DimensionIcon kind={kind} value={row.label} />
            <span className="truncate">{row.label}</span>
          </span>
          <span className="relative font-medium tabular-nums">
            {formatNumber(row.count)}
          </span>
        </li>
      ))}
    </ul>
  )
}

type TrafficQualityCardType = Quality

export const TrafficQualityCard = ({
  networks,
  bots,
}: TrafficQualityCardType) => {
  const [tab, setTab] = useState<"bots" | "networks">("bots")
  const total = bots.visits + bots.humans
  const share = total ? bots.visits / total : 0

  return (
    <Card className="h-full xl:absolute xl:inset-0">
      <CardHeader className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <CardTitle>Traffic quality</CardTitle>
          <CardDescription>
            Bots are filtered out of every other number
          </CardDescription>
        </div>
        <div role="tablist" className="flex gap-1 text-sm">
          {(["bots", "networks"] as const).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={cn(
                "rounded-md px-2 py-1 capitalize transition-colors",
                tab === key
                  ? "bg-muted font-medium"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {key}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-5">
        {tab === "bots" &&
          (bots.visits === 0 ? (
            <NoData
              icon={RobotIcon}
              title="No bots spotted"
              description="Crawlers and AI agents show up here."
            />
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-5">
                <Donut
                  label="Bot share of visits"
                  size={88}
                  segments={[
                    {
                      value: bots.humans,
                      className: "stroke-primary",
                      label: "Humans",
                    },
                    {
                      value: bots.visits,
                      className: "stroke-amber-500",
                      label: "Bots",
                    },
                  ]}
                >
                  <span className="text-lg font-semibold tabular-nums">
                    {formatPercent(share)}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    bots
                  </span>
                </Donut>
                <dl className="grid grid-cols-[auto_auto] gap-x-4 gap-y-1 text-sm">
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <span
                      className="size-2 rounded-full bg-primary"
                      aria-hidden
                    />
                    Humans
                  </dt>
                  <dd className="text-right font-medium tabular-nums">
                    {formatNumber(bots.humans)}
                  </dd>
                  <dt className="flex items-center gap-1.5 text-muted-foreground">
                    <span
                      className="size-2 rounded-full bg-amber-500"
                      aria-hidden
                    />
                    Bots
                  </dt>
                  <dd className="text-right font-medium tabular-nums">
                    {formatNumber(bots.visits)}
                  </dd>
                </dl>
              </div>
              <BarList rows={bots.breakdown} kind="bot" />
            </>
          ))}
        {tab === "networks" &&
          (networks.length === 0 ? (
            <NoData
              icon={TreeStructureIcon}
              title="No networks yet"
              description="Internet providers of your visitors appear here."
            />
          ) : (
            <BarList rows={networks} kind="network" />
          ))}
      </CardContent>
    </Card>
  )
}
