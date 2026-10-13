"use client"

import { EChartsLineChart } from "@/components/evilcharts/charts/echarts-line-chart"
import type { ChartConfig } from "@/components/evilcharts/ui/echarts-chart"
import { bucketLabel, formatNumber } from "../format"
import { PALETTE } from "./palette"

export type ChartLine = { key: string; label: string; values: number[] }

type CrawlerChartType = {
  buckets: string[]
  lines: ChartLine[]
  granularity: string
  className?: string
  colorOffset?: number
}

const slug = (key: string) => `c_${key.replace(/[^a-z0-9]/gi, "_")}`

export const CrawlerChart = ({
  buckets,
  lines,
  granularity,
  className,
  colorOffset = 0,
}: CrawlerChartType) => {
  const config: ChartConfig = {}
  lines.forEach((line, i) => {
    const color = PALETTE[(i + colorOffset) % PALETTE.length]!
    config[slug(line.key)] = {
      label: line.label,
      colors: { light: [color.light], dark: [color.dark] },
    }
  })
  const data = buckets.map((bucket, i) => {
    const row: Record<string, string | number> = {
      label: bucketLabel(bucket, granularity),
    }
    for (const line of lines) row[slug(line.key)] = line.values[i] ?? 0
    return row
  })
  return (
    <EChartsLineChart
      data={data}
      config={config}
      xDataKey="label"
      curveType="monotone"
      animation={false}
      enableHoverHighlight
      className={className ?? "h-56 w-full"}
    >
      {lines.map((line) => (
        <EChartsLineChart.Line
          key={line.key}
          dataKey={slug(line.key)}
          strokeWidth={2}
        />
      ))}
      <EChartsLineChart.Grid />
      <EChartsLineChart.XAxis />
      <EChartsLineChart.YAxis tickFormatter={(v) => formatNumber(v)} />
      <EChartsLineChart.Tooltip />
    </EChartsLineChart>
  )
}
