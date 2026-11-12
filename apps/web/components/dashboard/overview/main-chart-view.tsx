"use client"

import { ChartLineIcon } from "@phosphor-icons/react/ssr"
import { Card } from "@workspace/ui/components/card"
import { EChartsAreaChart } from "@/components/evilcharts/charts/echarts-area-chart"
import type { ChartConfig } from "@/components/evilcharts/ui/echarts-chart"
import type { Series, SeriesPoint } from "@/lib/analytics/series"
import { bucketLabel } from "../format"
import { NoData } from "../no-data"
import { useSelectedStat, type StatKey } from "./stats"

type MainChartType = { series: Series; granularity: string; currency: string }

const scale = (key: StatKey, point: SeriesPoint | undefined) => {
  const value = point?.[key] ?? 0
  if (key === "revenueCents") return Math.round(value) / 100
  if (key === "conversionRate" || key === "bounceRate")
    return Math.round(value * 1000) / 10
  return value
}

const unit = (key: StatKey, currency: string) =>
  key === "revenueCents"
    ? ` (${currency})`
    : key === "conversionRate" || key === "bounceRate"
      ? " (%)"
      : ""

export const MainChart = ({ series, granularity, currency }: MainChartType) => {
  const { stat } = useSelectedStat()
  const compare = series.previous !== null
  const label = `${stat.label}${unit(stat.key, currency)}`
  const config = {
    current: {
      label,
      colors: { light: ["var(--dataviz)"], dark: ["var(--dataviz)"] },
    },
    previous: {
      label: `${label}, before`,
      colors: { light: ["var(--chart-5)"], dark: ["var(--chart-5)"] },
    },
  } satisfies ChartConfig

  const data = series.current.map((point, i) => ({
    label: bucketLabel(point.bucket, granularity),
    current: scale(stat.key, point),
    previous: scale(stat.key, series.previous?.[i]),
  }))
  const empty = !series.current.some((p) => p.views > 0)

  return (
    <Card className="gap-3 py-4">
      <div className="flex items-center justify-between gap-2 px-4">
        <h2 className="text-base font-medium">{stat.label}</h2>
        {compare && !empty && (
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span className="h-px w-4 border-t border-dashed border-current" />
            Previous period
          </span>
        )}
      </div>
      {empty ? (
        <div className="flex h-[300px] px-4">
          <NoData
            icon={ChartLineIcon}
            title="No traffic in this period"
            description="Pick a wider date range or remove a filter."
          />
        </div>
      ) : (
        <EChartsAreaChart
          data={data}
          config={config}
          xDataKey="label"
          curveType="linear"
          animation={false}
          className="h-[300px] w-full px-2"
        >
          {compare && (
            <EChartsAreaChart.Area
              dataKey="previous"
              variant="none"
              strokeVariant="dashed"
              strokeWidth={1.5}
            />
          )}
          <EChartsAreaChart.Area
            dataKey="current"
            variant="gradient"
            strokeWidth={2}
            enableBufferLine
          />
          <EChartsAreaChart.Grid />
          <EChartsAreaChart.XAxis />
          <EChartsAreaChart.YAxis />
          <EChartsAreaChart.Tooltip />
        </EChartsAreaChart>
      )}
    </Card>
  )
}
