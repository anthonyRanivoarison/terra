import { UserRound } from "lucide-react"
import { Card, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { DimensionIcon } from "../dimension-icon"
import { dimensionLabel, formatNumber } from "../format"
import { InfoHint } from "../metric-hint"
import { NoData } from "../no-data"

type RankListType = {
  title: string
  rows: { label: string; visitors: number }[]
  kind: string
  hint: { body: string; how: string }
}

export const RankList = ({ title, rows, kind, hint }: RankListType) => {
  const max = Math.max(1, ...rows.map((r) => r.visitors))
  return (
    <Card className="h-[24rem] gap-4 overflow-hidden">
      <CardHeader className="flex items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2">
          {title}
          <InfoHint title={title} {...hint} />
        </CardTitle>
        <span className="text-xs font-medium text-muted-foreground">
          Visitors
        </span>
      </CardHeader>
      {rows.length === 0 ? (
        <div className="flex flex-1 px-6 pb-6">
          <NoData
            icon={UserRound}
            title="Nobody right now"
            description="This fills up as soon as someone lands on the site."
          />
        </div>
      ) : (
        <ul className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-4 pb-4">
          {rows.map((r) => (
            <li
              key={r.label}
              className="relative flex items-center justify-between gap-3 overflow-hidden rounded-md px-2 py-2 text-sm"
            >
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 rounded-md bg-primary/10 transition-[width] duration-500 ease-out"
                style={{ width: `${(r.visitors / max) * 100}%` }}
              />
              <span className="relative flex min-w-0 items-center gap-2.5">
                <DimensionIcon kind={kind} value={r.label} />
                <span className="truncate">
                  {dimensionLabel(kind, r.label)}
                </span>
              </span>
              <span className="relative font-medium tabular-nums">
                {formatNumber(r.visitors)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
