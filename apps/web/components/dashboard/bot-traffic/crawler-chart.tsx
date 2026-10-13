"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@workspace/ui/components/skeleton"

export type { ChartLine } from "./crawler-chart-view"

export const CrawlerChart = dynamic(
  () => import("./crawler-chart-view").then((m) => m.CrawlerChart),
  { ssr: false, loading: () => <Skeleton className="h-56 w-full rounded-lg" /> }
)
