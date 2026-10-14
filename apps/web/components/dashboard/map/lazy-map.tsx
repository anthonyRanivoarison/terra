"use client"

import dynamic from "next/dynamic"
import { Skeleton } from "@workspace/ui/components/skeleton"

export const LazyVisitorsMap = dynamic(
  () => import("../visitors-map").then((m) => m.VisitorsMap),
  { ssr: false, loading: () => <Skeleton className="size-full rounded-md" /> }
)
