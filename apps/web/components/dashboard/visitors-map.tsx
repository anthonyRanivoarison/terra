"use client"

import { useEffect, useRef, useState } from "react"
import {
  MinusIcon,
  PlusIcon,
  ArrowCounterClockwiseIcon,
} from "@phosphor-icons/react/ssr"
import { useTheme } from "next-themes"
import { Skeleton } from "@workspace/ui/components/skeleton"
import type { GeoPoint } from "@/lib/analytics/insights"
import type { MetricRow } from "@/lib/analytics/metrics"
import { cn } from "@workspace/ui/lib/utils"
import { buildMapOption, INITIAL_ZOOM } from "./map/options"
import { echarts, loadWorld } from "./map/world"

type VisitorsMapType = {
  countries: MetricRow[]
  points: GeoPoint[]
  className?: string
}

const control =
  "flex size-7 items-center justify-center text-muted-foreground transition-[color,background-color] duration-150 hover:bg-muted hover:text-foreground active:scale-[0.96]"

export const VisitorsMap = ({
  countries,
  points,
  className,
}: VisitorsMapType) => {
  const ref = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)
  const zoomRef = useRef(INITIAL_ZOOM)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const { resolvedTheme } = useTheme()
  const dark = resolvedTheme === "dark"

  useEffect(() => {
    let cancelled = false
    loadWorld().then(
      () => !cancelled && setReady(true),
      () => !cancelled && setFailed(true)
    )
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!ready || !el) return
    const chart = echarts.init(el, null, { renderer: "canvas" })
    chartRef.current = chart
    chart.on("georoam", () => {
      const geo = (chart.getOption().geo as { zoom?: number }[])[0]
      zoomRef.current = geo?.zoom ?? INITIAL_ZOOM
    })
    const observer = new ResizeObserver(() => chart.resize())
    observer.observe(el)
    return () => {
      observer.disconnect()
      chart.dispose()
      chartRef.current = null
    }
  }, [ready])

  const draw = () => {
    const chart = chartRef.current
    if (!chart) return
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    zoomRef.current = INITIAL_ZOOM
    chart.setOption(buildMapOption({ countries, points, dark, reduceMotion }), {
      notMerge: true,
    })
  }

  useEffect(draw, [ready, dark, countries, points])

  const zoom = (factor: number) => {
    const next = Math.min(10, Math.max(1, zoomRef.current * factor))
    zoomRef.current = next
    chartRef.current?.setOption({ geo: [{ zoom: next }] })
  }

  if (failed) {
    return (
      <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
        Couldn&apos;t load the map.
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative size-full overflow-hidden rounded-lg bg-muted/40 [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:14px_14px]",
        className
      )}
    >
      {!ready && <Skeleton className="absolute inset-0 rounded-lg" />}
      <div
        ref={ref}
        role="img"
        aria-label={`World map of visitors across ${countries.length} countries`}
        className="size-full"
      />
      <div className="absolute right-3 bottom-3 flex flex-col overflow-hidden rounded-md border bg-card">
        <button
          type="button"
          onClick={() => zoom(1.5)}
          aria-label="Zoom in"
          className={control}
        >
          <PlusIcon className="size-3.5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => zoom(1 / 1.5)}
          aria-label="Zoom out"
          className={cn(control, "border-t")}
        >
          <MinusIcon className="size-3.5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={draw}
          aria-label="Reset view"
          className={cn(control, "border-t")}
        >
          <ArrowCounterClockwiseIcon className="size-3.5" aria-hidden />
        </button>
      </div>
      <div className="absolute bottom-3 left-3 flex items-center gap-2 rounded-md border bg-card/80 px-2.5 py-1.5 text-[11px] text-muted-foreground backdrop-blur-sm">
        Fewer
        <span
          aria-hidden="true"
          className="h-1.5 w-20 rounded-full bg-linear-to-r from-dataviz/15 via-dataviz/60 to-dataviz"
        />
        More visitors
      </div>
    </div>
  )
}
