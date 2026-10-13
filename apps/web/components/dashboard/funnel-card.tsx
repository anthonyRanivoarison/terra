"use client"

import { Filter } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import type { Funnel } from "@/lib/analytics/funnel"
import { formatMoney } from "./format"
import { NoData } from "./no-data"

const FUNNEL_STEPS: {
  key: keyof Omit<Funnel, "revenueCents">
  label: string
}[] = [
  { key: "visitors", label: "Visitors" },
  { key: "engaged", label: "Engaged" },
  { key: "goals", label: "Completed a goal" },
  { key: "purchases", label: "Bought" },
]

type FunnelCardType = { funnel: Funnel; currency: string }

export const FunnelCard = ({ funnel, currency }: FunnelCardType) => {
  const top = Math.max(funnel.visitors, 1)
  const revenue = formatMoney(funnel.revenueCents, currency)
  const overall =
    funnel.visitors > 0 ? (funnel.purchases / funnel.visitors) * 100 : 0

  return (
    <Card className="h-[29rem]">
      <CardHeader>
        <CardTitle>Conversion funnel</CardTitle>
        <CardDescription>
          {funnel.purchases} {funnel.purchases === 1 ? "sale" : "sales"} ·{" "}
          {revenue} · {overall.toFixed(overall < 1 ? 2 : 1)}% of visitors bought
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        {funnel.visitors === 0 ? (
          <NoData
            icon={Filter}
            title="No visitors yet"
            description="Visitors, engaged visits, goals and sales line up here."
          />
        ) : (
          <ol className="flex flex-col gap-4">
            {FUNNEL_STEPS.map((step, i) => {
              const value = funnel[step.key]
              const previous = i > 0 ? funnel[FUNNEL_STEPS[i - 1]!.key] : null
              const rate = previous ? (value / previous) * 100 : null
              return (
                <li key={step.key} className="flex flex-col gap-1.5">
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="font-medium">{step.label}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {value.toLocaleString()}
                      {rate !== null
                        ? ` · ${rate.toFixed(rate < 10 ? 1 : 0)}%`
                        : ""}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${Math.max((value / top) * 100, value ? 1 : 0)}%`,
                      }}
                    />
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  )
}
