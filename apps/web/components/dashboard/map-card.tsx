"use client"

import dynamic from "next/dynamic"
import { Earth } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import type { GeoPoint } from "@/lib/analytics/insights"
import type { MetricRow } from "@/lib/analytics/metrics"
import { countryName } from "@/lib/country"
import { DimensionIcon } from "./dimension-icon"
import { formatNumber, formatPercent } from "./format"
import { NoData } from "./no-data"

const VisitorsMap = dynamic(
  () => import("./visitors-map").then((m) => m.VisitorsMap),
  { ssr: false, loading: () => <Skeleton className="size-full rounded-lg" /> }
)

type MapCardType = { countries: MetricRow[]; points: GeoPoint[] }

export const MapCard = ({ countries, points }: MapCardType) => {
  const total = countries.reduce((sum, c) => sum + c.visitors, 0)
  const cities = new Set(points.map((p) => `${p.city}|${p.country}`)).size
  const stats = [
    ["Countries", formatNumber(countries.length)],
    ["Cities", formatNumber(cities)],
    [
      "Top country",
      countries[0] ? formatPercent(countries[0].visitors / total) : "—",
    ],
  ]

  return (
    <Card className="lg:h-[34rem]">
      <CardHeader>
        <CardTitle>Where visitors come from</CardTitle>
        <CardDescription>
          Drag to pan, scroll or use the buttons to zoom
        </CardDescription>
      </CardHeader>
      <CardContent className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        {countries.length === 0 ? (
          <NoData
            icon={Earth}
            title="No locations yet"
            description="Countries and cities appear as soon as someone visits."
            className="lg:col-span-2"
          />
        ) : (
          <>
            <div className="h-80 min-h-0 sm:h-96 lg:h-full">
              <VisitorsMap countries={countries} points={points} />
            </div>
            <div className="flex min-h-0 flex-col gap-5">
              <dl className="grid grid-cols-3 gap-2">
                {stats.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex flex-col gap-0.5 rounded-lg bg-muted/50 px-3 py-2"
                  >
                    <dt className="text-[11px] text-muted-foreground">
                      {label}
                    </dt>
                    <dd className="text-sm font-semibold tabular-nums">
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
              <ul className="-mx-1 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-1">
                {countries.slice(0, 8).map((c) => (
                  <li key={c.label} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex min-w-0 items-center gap-2">
                        <DimensionIcon kind="country" value={c.label} />
                        <span className="truncate">{countryName(c.label)}</span>
                      </span>
                      <span className="tabular-nums">
                        <span className="font-medium">
                          {formatNumber(c.visitors)}
                        </span>
                        <span className="ml-1.5 text-xs text-muted-foreground">
                          {formatPercent(c.visitors / total)}
                        </span>
                      </span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{
                          width: `${(c.visitors / countries[0]!.visitors) * 100}%`,
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
