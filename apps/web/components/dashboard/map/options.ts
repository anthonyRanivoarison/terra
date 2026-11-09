import type { GeoPoint } from "@/lib/analytics/insights"
import type { MetricRow } from "@/lib/analytics/metrics"
import { countryName } from "@/lib/country"

const PALETTE = {
  light: {
    land: "#eceef2",
    border: "#ffffff",
    hover: "#dde0e8",
    ramp: ["#dfe3fb", "#8f9cf0", "#4c5bd4"],
    dot: "#5b6ae0",
    ripple: "rgba(91, 106, 224, 0.35)",
  },
  dark: {
    land: "#2a2b30",
    border: "#1b1b1d",
    hover: "#36373d",
    ramp: ["#2c3361", "#6f7fe0", "#c7cefa"],
    dot: "#a5b0f6",
    ripple: "rgba(165, 176, 246, 0.35)",
  },
}

export const BOUNDS: [number, number][] = [
  [-168, 78],
  [190, -56],
]

export const INITIAL_ZOOM = 1.45
export const INITIAL_CENTER: [number, number] = [12, 28]

type TooltipParam = {
  seriesType: string
  name: string
  value: number | number[] | undefined
  data?: { city?: string; country?: string }
}

const row = (title: string, visitors: number, color: string) =>
  `<div style="display:flex;flex-direction:column;gap:2px">
    <span style="font-weight:600">${title}</span>
    <span style="display:flex;align-items:center;gap:6px;opacity:.75">
      <span style="width:6px;height:6px;border-radius:9999px;background:${color}"></span>
      ${visitors.toLocaleString("en-US")} ${visitors === 1 ? "visitor" : "visitors"}
    </span>
  </div>`

type MapOptionInput = {
  countries: MetricRow[]
  points: GeoPoint[]
  dark: boolean
  reduceMotion: boolean
}

export const buildMapOption = ({
  countries,
  points,
  dark,
  reduceMotion,
}: MapOptionInput) => {
  const colors = dark ? PALETTE.dark : PALETTE.light
  const max = Math.max(1, ...countries.map((c) => c.visitors))
  const maxPoint = Math.max(1, ...points.map((p) => p.visitors))

  return {
    animation: !reduceMotion,
    animationDurationUpdate: 300,
    tooltip: {
      trigger: "item",
      confine: true,
      borderWidth: 0,
      padding: [8, 10],
      backgroundColor: "rgba(0,0,0,0)",
      extraCssText:
        "background:var(--popover);color:var(--popover-foreground);border-radius:6px;box-shadow:0 0 0 1px oklch(0 0 0 / 0.08),0 4px 12px -2px oklch(0 0 0 / 0.16);font:12px/1.4 var(--font-sans), system-ui;",
      formatter: (raw: unknown) => {
        const p = raw as TooltipParam
        if (p.seriesType !== "map") {
          const value = p.value as number[]
          const place = [p.data?.city, countryName(p.data?.country ?? "")]
            .filter(Boolean)
            .join(", ")
          return row(place || "Unknown", value[2] ?? 0, colors.dot)
        }
        const visitors =
          typeof p.value === "number" && !Number.isNaN(p.value) ? p.value : 0
        return row(countryName(p.name), visitors, colors.ramp[1]!)
      },
    },
    visualMap: {
      show: false,
      min: 0,
      max,
      seriesIndex: 0,
      inRange: { color: colors.ramp },
    },
    geo: {
      map: "world",
      nameProperty: "iso",
      roam: true,
      boundingCoords: BOUNDS,
      layoutCenter: ["50%", "50%"],
      layoutSize: "100%",
      zoom: INITIAL_ZOOM,
      center: INITIAL_CENTER,
      scaleLimit: { min: 1, max: 10 },
      itemStyle: {
        areaColor: colors.land,
        borderColor: colors.border,
        borderWidth: 0.8,
      },
      emphasis: {
        label: { show: false },
        itemStyle: { areaColor: colors.hover },
      },
      select: { disabled: true },
      regions: [
        {
          name: "AQ",
          silent: true,
          itemStyle: { areaColor: "transparent", borderColor: "transparent" },
        },
      ],
    },
    series: [
      {
        type: "map",
        geoIndex: 0,
        data: countries.map((c) => ({ name: c.label, value: c.visitors })),
      },
      {
        type: reduceMotion ? "scatter" : "effectScatter",
        coordinateSystem: "geo",
        rippleEffect: { brushType: "stroke", scale: 2.6, period: 5 },
        showEffectOn: "render",
        data: points.map((p) => ({
          name: p.city || p.country,
          city: p.city,
          country: p.country,
          value: [p.longitude, p.latitude, p.visitors],
        })),
        symbolSize: (value: number[]) =>
          5 + Math.sqrt(value[2]! / maxPoint) * 9,
        itemStyle: {
          color: colors.dot,
          shadowBlur: 8,
          shadowColor: colors.ripple,
        },
        emphasis: { scale: 1.4 },
        zlevel: 1,
      },
    ],
  }
}
