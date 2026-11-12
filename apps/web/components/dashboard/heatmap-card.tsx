import { CalendarDotsIcon } from "@phosphor-icons/react/ssr"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import type { HeatCell } from "@/lib/analytics/insights"
import { formatNumber } from "./format"
import { NoData } from "./no-data"

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const FULL_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]
const HOURS = Array.from({ length: 24 }, (_, h) => h)

const hourLabel = (h: number) => `${String(h).padStart(2, "0")}:00`

function peaks(cells: HeatCell[]) {
  const byDay = new Array(7).fill(0)
  const byHour = new Array(24).fill(0)
  for (const c of cells) {
    byDay[c.day - 1] += c.visitors
    byHour[c.hour] += c.visitors
  }
  const top = cells.reduce(
    (a, b) => (b.visitors > a.visitors ? b : a),
    cells[0]!
  )
  return {
    day: FULL_DAYS[byDay.indexOf(Math.max(...byDay))]!,
    hour: hourLabel(byHour.indexOf(Math.max(...byHour))),
    peak: `${DAYS[top.day - 1]} ${hourLabel(top.hour)}`,
    peakVisitors: top.visitors,
  }
}

type HeatmapCardType = { cells: HeatCell[]; tz: string }

export const HeatmapCard = ({ cells, tz }: HeatmapCardType) => {
  const byKey = new Map(cells.map((c) => [`${c.day}-${c.hour}`, c.visitors]))
  const max = Math.max(1, ...cells.map((c) => c.visitors))
  const stats = cells.length ? peaks(cells) : null

  return (
    <Card className="h-full min-w-0">
      <CardHeader>
        <CardTitle>Traffic by day and hour</CardTitle>
        <CardDescription>Unique visitors, {tz} time</CardDescription>
      </CardHeader>
      <CardContent className="flex min-h-0 flex-1 flex-col gap-5">
        {!stats ? (
          <NoData
            icon={CalendarDotsIcon}
            title="No traffic yet"
            description="Busy days and hours show up once visitors arrive."
          />
        ) : (
          <>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                ["Busiest day", stats.day],
                ["Busiest hour", stats.hour],
                [
                  "Peak slot",
                  `${stats.peak} · ${formatNumber(stats.peakVisitors)}`,
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-col gap-0.5 rounded-lg bg-muted/50 px-3 py-2"
                >
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="truncate text-sm font-medium tabular-nums">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="min-h-0 flex-1 overflow-x-auto">
              <div
                className="grid h-full min-h-56 min-w-[34rem] gap-1 text-[11px] text-muted-foreground"
                style={{
                  gridTemplateColumns: "2.25rem repeat(24, minmax(0, 1fr))",
                  gridTemplateRows: "auto repeat(7, minmax(0.75rem, 1fr))",
                }}
              >
                <span />
                {HOURS.map((h) => (
                  <span key={h} className="text-center tabular-nums">
                    {h % 3 === 0 ? h : ""}
                  </span>
                ))}
                {DAYS.map((day, d) => (
                  <div key={day} className="contents">
                    <span className="self-center">{day}</span>
                    {HOURS.map((h) => {
                      const value = byKey.get(`${d + 1}-${h}`) ?? 0
                      return (
                        <span
                          key={h}
                          title={`${FULL_DAYS[d]} ${hourLabel(h)} · ${value} visitors`}
                          className="rounded-[3px] bg-primary"
                          style={{
                            opacity: value ? 0.12 + (value / max) * 0.88 : 0.06,
                          }}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
              Less
              {[0.06, 0.3, 0.55, 0.8, 1].map((o) => (
                <span
                  key={o}
                  className="size-3 rounded-[3px] bg-primary"
                  style={{ opacity: o }}
                  aria-hidden
                />
              ))}
              More
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
