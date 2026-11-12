"use client"

import { useState } from "react"
import {
  ArrowDownIcon,
  FileTextIcon,
  ArrowSquareOutIcon,
} from "@phosphor-icons/react/ssr"
import { Card } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"
import type { PageStat } from "@/lib/analytics/pages"
import { formatDuration, formatNumber, formatPercent } from "../format"
import { useAnalyticsNav } from "../nav-context"
import { NoData } from "../no-data"

type SortKey =
  "views" | "visitors" | "duration" | "scroll" | "entries" | "exitRate"

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "views", label: "Views" },
  { key: "visitors", label: "Visitors" },
  { key: "duration", label: "Avg. time" },
  { key: "scroll", label: "Scroll" },
  { key: "entries", label: "Entries" },
  { key: "exitRate", label: "Exit rate" },
]

const exitRate = (row: PageStat) => (row.views ? row.exits / row.views : 0)

const valueOf = (row: PageStat, key: SortKey) =>
  key === "exitRate" ? exitRate(row) : (row[key] ?? 0)

const cell = (row: PageStat, key: SortKey) => {
  if (key === "duration") return formatDuration(row.duration)
  if (key === "scroll")
    return row.scroll === null ? "—" : `${Math.round(row.scroll)}%`
  if (key === "exitRate") return formatPercent(exitRate(row))
  return formatNumber(row[key])
}

type PagesTableType = { rows: PageStat[]; domain: string }

export const PagesTable = ({ rows, domain }: PagesTableType) => {
  const { update, get } = useAnalyticsNav()
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<SortKey>("views")
  const needle = query.trim().toLowerCase()
  const shown = rows
    .filter((row) => row.page.toLowerCase().includes(needle))
    .sort((a, b) => valueOf(b, sort) - valueOf(a, sort))
  const max = Math.max(1, ...rows.map((r) => r.views))
  const active = get("page")

  return (
    <Card className="gap-3 py-3">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4">
        <h2 className="text-base font-medium">
          {formatNumber(rows.length)} pages
        </h2>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search pages"
          aria-label="Search pages"
          className="h-8 w-full sm:w-64"
        />
      </div>
      {shown.length === 0 ? (
        <div className="px-4 pb-2">
          <NoData
            icon={FileTextIcon}
            title="No pages match"
            description="Try another search, a wider period or fewer filters."
            className="border-0"
          />
        </div>
      ) : (
        <div className="overflow-x-auto px-2">
          <table className="w-full min-w-[44rem] border-separate border-spacing-y-0.5 text-sm">
            <thead>
              <tr className="text-xs font-medium text-muted-foreground">
                <th className="px-2 py-1.5 text-left font-medium">Page</th>
                {COLUMNS.map((c) => (
                  <th
                    key={c.key}
                    className="px-2 py-1.5 text-right font-medium"
                  >
                    <button
                      type="button"
                      onClick={() => setSort(c.key)}
                      aria-pressed={sort === c.key}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-sm hover:text-foreground",
                        sort === c.key && "text-foreground"
                      )}
                    >
                      {c.label}
                      {sort === c.key && (
                        <ArrowDownIcon className="size-3" aria-hidden />
                      )}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((row) => (
                <tr
                  key={row.page}
                  className={cn(
                    "group tabular-nums hover:bg-muted/70",
                    active === row.page && "outline outline-1 outline-primary"
                  )}
                >
                  <td className="relative w-[40%] max-w-0 rounded-l-md px-2 py-1.5">
                    <span
                      aria-hidden
                      className="absolute inset-y-0 left-0 rounded-md bg-dataviz/20"
                      style={{ width: `${(row.views / max) * 100}%` }}
                    />
                    <span className="relative flex min-w-0 items-center gap-2">
                      <button
                        type="button"
                        title={row.page}
                        onClick={() =>
                          update({
                            page: active === row.page ? null : row.page,
                          })
                        }
                        className="truncate text-left hover:underline"
                      >
                        {row.page}
                      </button>
                      {row.page.startsWith("/") && (
                        <a
                          href={`https://${domain}${row.page}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Open ${row.page}`}
                          className="shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground focus-visible:opacity-100"
                        >
                          <ArrowSquareOutIcon
                            className="size-3.5"
                            aria-hidden
                          />
                        </a>
                      )}
                    </span>
                  </td>
                  {COLUMNS.map((c, i) => (
                    <td
                      key={c.key}
                      className={cn(
                        "px-2 py-1.5 text-right",
                        i === COLUMNS.length - 1 && "rounded-r-md"
                      )}
                    >
                      {cell(row, c.key)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
