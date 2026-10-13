"use client"

import { useState } from "react"
import { CircleDollarSign } from "lucide-react"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group"
import type {
  Attribution,
  AttributionTab,
  Model,
} from "@/lib/analytics/revenue"
import { cn } from "@workspace/ui/lib/utils"
import { DimensionIcon } from "./dimension-icon"
import { dimensionLabel, formatMoney } from "./format"
import { NoData } from "./no-data"

const TABS: { key: AttributionTab; label: string; dimension: string }[] = [
  { key: "channel", label: "Channels", dimension: "channel" },
  { key: "referrer", label: "Referrers", dimension: "referrer" },
  { key: "campaign", label: "Campaigns", dimension: "utm_campaign" },
  { key: "country", label: "Countries", dimension: "country" },
  { key: "entry", label: "Entry pages", dimension: "entry" },
]

type RevenueCardType = { attribution: Attribution; currency: string }

export const RevenueCard = ({ attribution, currency }: RevenueCardType) => {
  const [model, setModel] = useState<Model>("last")
  const [tab, setTab] = useState<AttributionTab>("channel")
  const rows = attribution[model][tab]
  const max = Math.max(1, ...rows.map((r) => Math.abs(r.revenueCents)))
  const dimension = TABS.find((t) => t.key === tab)!.dimension

  return (
    <Card className="h-[29rem] gap-3 overflow-hidden">
      <CardHeader className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <CardTitle>Revenue attribution</CardTitle>
          <CardDescription>Net of refunds, by {model} touch</CardDescription>
        </div>
        <ToggleGroup
          variant="outline"
          size="sm"
          spacing={0}
          value={[model]}
          onValueChange={(v) => v[0] && setModel(v[0] as Model)}
          aria-label="Attribution model"
        >
          <ToggleGroupItem value="first">First touch</ToggleGroupItem>
          <ToggleGroupItem value="last">Last touch</ToggleGroupItem>
        </ToggleGroup>
      </CardHeader>
      <div role="tablist" className="flex flex-wrap gap-1 px-6 text-sm">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={t.key === tab}
            onClick={() => setTab(t.key)}
            className={cn(
              "rounded-md px-2 py-1 transition-colors",
              t.key === tab
                ? "bg-muted font-medium"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {rows.length === 0 && (
        <div className="flex flex-1 px-4 pb-4">
          <NoData
            icon={CircleDollarSign}
            title="No sales yet"
            description="Revenue appears here once a purchase comes through your payment provider."
          />
        </div>
      )}
      <ul className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-4 pb-4 empty:hidden">
        {rows.map((row) => {
          return (
            <li
              key={row.label}
              className="relative flex items-center justify-between gap-3 overflow-hidden rounded-md px-2 py-1.5 text-sm"
            >
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 rounded-md bg-emerald-500/10"
                style={{
                  width: `${(Math.abs(row.revenueCents) / max) * 100}%`,
                }}
              />
              <span className="relative flex min-w-0 items-center gap-2">
                <DimensionIcon kind={dimension} value={row.label} />
                <span className="truncate">
                  {row.label ? dimensionLabel(dimension, row.label) : "Unknown"}
                </span>
              </span>
              <span className="relative flex items-baseline gap-2 tabular-nums">
                <span className="text-xs text-muted-foreground">
                  {row.purchases} {row.purchases === 1 ? "sale" : "sales"}
                </span>
                <span className="font-medium">
                  {formatMoney(row.revenueCents, currency)}
                </span>
              </span>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
