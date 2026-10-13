"use client"

import { EChartsBarChart } from "@/components/evilcharts/charts/echarts-bar-chart"
import type { ChartConfig } from "@/components/evilcharts/ui/echarts-chart"
import { Card, CardContent } from "@workspace/ui/components/card"
import type { Series } from "@/lib/analytics/series"
import { ChartColumn } from "lucide-react"
import { bucketLabel, SERIES } from "./format"
import { NoData } from "./no-data"

type TrafficChartType = { series: Series; granularity: string }

export const TrafficChart = ({ series, granularity }: TrafficChartType) => {
  const compare = series.previous !== null
  const config = {
    views: {
      label: "Views",
      colors: { light: [SERIES.blue.light], dark: [SERIES.blue.dark] },
    },
    visitors: {
      label: "Visitors",
      colors: { light: [SERIES.orange.light], dark: [SERIES.orange.dark] },
    },
    previous: {
      label: "Visitors (before)",
      colors: { light: [SERIES.other.light], dark: [SERIES.other.dark] },
    },
  } satisfies ChartConfig

  const data = series.current.map((point, i) => ({
    label: bucketLabel(point.bucket, granularity),
    views: point.views,
    visitors: point.visitors,
    previous: series.previous?.[i]?.visitors ?? 0,
  }))

  if (!series.current.some((p) => p.views > 0)) {
    return (
      <Card className="h-[20.5rem] py-4">
        <CardContent className="flex flex-1 px-4">
          <NoData
            icon={ChartColumn}
            title="No traffic in this period"
            description="Pick a wider date range or remove a filter."
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="py-4">
      <CardContent className="px-4">
        <EChartsBarChart
          data={data}
          config={config}
          xDataKey="label"
          barRadius={4}
          animation={false}
          className="h-72 w-full"
        >
          <EChartsBarChart.Bar dataKey="views" />
          <EChartsBarChart.Bar dataKey="visitors" />
          {compare && (
            <EChartsBarChart.Bar dataKey="previous" variant="hatched" />
          )}
          <EChartsBarChart.Grid />
          <EChartsBarChart.XAxis />
          <EChartsBarChart.YAxis />
          <EChartsBarChart.Tooltip />
          <EChartsBarChart.Legend
            variant="circle"
            align="left"
            verticalAlign="top"
          />
        </EChartsBarChart>
      </CardContent>
    </Card>
  )
}
