import { GaugeIcon } from "@phosphor-icons/react/ssr"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import type { Vital } from "@/lib/analytics/insights"
import { VITALS, type VitalScores } from "@/lib/analytics/vitals"
import { cn } from "@workspace/ui/lib/utils"
import { Donut } from "./donut"
import { NoData } from "./no-data"
import { VitalsTable } from "./vitals-table"
import { rate, showVital, TONES } from "./vitals-format"

type VitalsCardType = { vitals: Vital[]; scores: VitalScores }

export const VitalsCard = ({ vitals, scores }: VitalsCardType) => {
  const overall = vitals.find((v) => v.page === "All pages")
  return (
    <Card>
      <CardHeader className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <CardTitle>Core Web Vitals</CardTitle>
          <CardDescription>
            Real visitors, 75th percentile in the middle, share of page views
            around it
          </CardDescription>
        </div>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {Object.values(TONES).map((tone) => (
            <li key={tone.label} className="flex items-center gap-1.5">
              <span
                className={cn("size-2 rounded-full", tone.dot)}
                aria-hidden
              />
              {tone.label}
            </li>
          ))}
        </ul>
      </CardHeader>
      <CardContent className="flex flex-col gap-8">
        {!overall ? (
          <NoData
            icon={GaugeIcon}
            title="No Web Vitals yet"
            description="LCP, INP and CLS are sent by real visitors as they browse."
          />
        ) : (
          <>
            <ul className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
              {VITALS.map((metric) => {
                const score = scores[metric.key]
                const p75 = overall[metric.key]
                const total = score.good + score.ni + score.poor
                const tone =
                  p75 === null
                    ? null
                    : TONES[rate(p75, metric.good, metric.poor)]
                return (
                  <li
                    key={metric.key}
                    className="flex flex-col items-center gap-3 text-center"
                  >
                    <Donut
                      label={metric.name}
                      segments={(["good", "ni", "poor"] as const).map((k) => ({
                        value: score[k],
                        className: TONES[k].stroke,
                        label: TONES[k].label,
                      }))}
                    >
                      <span
                        className={cn(
                          "text-xl font-semibold tabular-nums",
                          tone?.text
                        )}
                      >
                        {p75 === null ? "—" : showVital(p75, metric.unit)}
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        {metric.label}
                      </span>
                    </Donut>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">{metric.name}</span>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {total
                          ? `${Math.round((score.good / total) * 100)}% good`
                          : "No samples"}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
            <VitalsTable rows={vitals.filter((v) => v !== overall)} />
          </>
        )}
      </CardContent>
    </Card>
  )
}
