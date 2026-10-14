"use client"

import type { GeoPoint } from "@/lib/analytics/insights"
import type { MetricRow } from "@/lib/analytics/metrics"
import { LazyVisitorsMap } from "../map/lazy-map"

type LocationMapType = { countries: MetricRow[]; points: GeoPoint[] }

export const LocationMap = ({ countries, points }: LocationMapType) => (
  <div className="absolute inset-x-2 inset-y-0">
    <LazyVisitorsMap countries={countries} points={points} />
  </div>
)
