"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@workspace/ui/components/skeleton"

export const MainChartSkeleton = () => (
  <Skeleton className="h-[22rem] rounded-lg" />
)

export const MainChart = dynamic(
  () => import("./main-chart-view").then((m) => m.MainChart),
  { ssr: false, loading: MainChartSkeleton }
)
