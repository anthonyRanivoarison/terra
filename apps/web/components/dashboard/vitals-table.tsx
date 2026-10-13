import type { Vital } from "@/lib/analytics/insights"
import { VITALS } from "@/lib/analytics/vitals"
import { cn } from "@workspace/ui/lib/utils"
import { rate, showVital, TONES } from "./vitals-format"

type VitalsTableType = { rows: Vital[] }

export const VitalsTable = ({ rows }: VitalsTableType) => {
  if (!rows.length) return null
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[34rem] text-sm">
        <caption className="sr-only">Core Web Vitals per page</caption>
        <thead className="text-xs text-muted-foreground">
          <tr className="border-b">
            <th className="py-2 text-left font-medium">Page</th>
            {VITALS.map((m) => (
              <th key={m.key} className="py-2 text-right font-medium">
                {m.label}
              </th>
            ))}
            <th className="py-2 text-right font-medium">Views</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.page} className="border-b last:border-0">
              <td className="max-w-56 truncate py-2">{row.page}</td>
              {VITALS.map((m) => {
                const value = row[m.key]
                return (
                  <td
                    key={m.key}
                    className={cn(
                      "py-2 text-right tabular-nums",
                      value !== null && TONES[rate(value, m.good, m.poor)].text
                    )}
                  >
                    {value === null ? "—" : showVital(value, m.unit)}
                  </td>
                )
              })}
              <td className="py-2 text-right text-muted-foreground tabular-nums">
                {row.views}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
