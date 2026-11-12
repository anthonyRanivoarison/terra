"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@workspace/ui/components/skeleton"

export const MainChartSkeleton = () => (
  <Skeleton className="mx-3 mb-3 h-[300px] rounded-lg" />
)

export const MainChart = dynamic(
  () => import("./main-chart-view").then((m) => m.MainChart),
  { ssr: false, loading: MainChartSkeleton }
)
