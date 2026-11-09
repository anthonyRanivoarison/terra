import { localDate, shiftDate, type AnalyticsParams } from "./params"

type Period = { from: string; to: string }
type Scope = Pick<AnalyticsParams, "current" | "tz">

const DAY = 86_400_000

const daysBetween = (a: string, b: string) =>
  Math.round(
    (Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY
  )

export function periodBounds({ current, tz }: Scope): Period {
  return {
    from: localDate(Date.parse(current.from), tz),
    to: localDate(Date.parse(current.to) - 1, tz),
  }
}

export function shiftPeriod(
  scope: Scope,
  direction: -1 | 1,
  now = Date.now()
): Period | null {
  const { from, to } = periodBounds(scope)
  const span = (daysBetween(from, to) + 1) * direction
  const today = localDate(now, scope.tz)
  const next = { from: shiftDate(from, span), to: shiftDate(to, span) }
  if (next.from > today) return null
  return { from: next.from, to: next.to > today ? today : next.to }
}
