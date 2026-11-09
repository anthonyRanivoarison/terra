export const TONES = {
  good: {
    stroke: "stroke-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    dot: "bg-emerald-500",
    label: "Good",
  },
  ni: {
    stroke: "stroke-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
    label: "Needs work",
  },
  poor: {
    stroke: "stroke-red-500",
    text: "text-red-600 dark:text-red-400",
    dot: "bg-red-500",
    label: "Poor",
  },
} as const

export const rate = (value: number, good: number, poor: number) =>
  value <= good ? "good" : value <= poor ? "ni" : "poor"

export const showVital = (value: number, unit: string) =>
  unit === "ms"
    ? value >= 1000
      ? `${(value / 1000).toFixed(2)}s`
      : `${Math.round(value)}ms`
    : value.toFixed(2)
