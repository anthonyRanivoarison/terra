import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from "web-vitals"

let pending: Record<string, number> = {}
let listener: (() => void) | null = null

const record = (metric: Metric) => {
  const key = metric.name.toLowerCase()
  pending[key] =
    metric.name === "CLS"
      ? Math.round(metric.value * 1000) / 1000
      : metric.value
  if (document.visibilityState === "hidden") listener?.()
}

export function watchVitals(): void {
  onLCP(record)
  onINP(record)
  onCLS(record)
  onFCP(record)
  onTTFB(record)
}

export function takeVitals(): Record<string, number> | null {
  if (!Object.keys(pending).length) return null
  const out = pending
  pending = {}
  return out
}

export function onLateVital(fn: (() => void) | null): void {
  listener = fn
}
