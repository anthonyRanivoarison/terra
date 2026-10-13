"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@workspace/ui/components/skeleton"

export const TrafficChart = dynamic(
  () => import("./traffic-chart-view").then((m) => m.TrafficChart),
  { ssr: false, loading: () => <Skeleton className="h-[20.5rem] rounded-xl" /> }
)
