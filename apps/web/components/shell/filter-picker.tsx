"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { ChevronLeft, ListFilter } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { Spinner } from "@workspace/ui/components/spinner"
import { DimensionIcon } from "@/components/dashboard/dimension-icon"
import { FILTER_NAMES } from "@/components/dashboard/filter-names"
import { dimensionLabel, formatNumber } from "@/components/dashboard/format"
import { useAnalyticsNav } from "@/components/dashboard/nav-context"

const GROUPS = [
  { label: "Pages", keys: ["page", "entry", "exit", "hostname"] },
  {
    label: "Sources",
    keys: ["channel", "referrer", "utm_source", "utm_medium", "utm_campaign"],
  },
  { label: "Location", keys: ["country", "region", "city"] },
  {
    label: "Environment",
    keys: ["device", "browser", "os", "language", "screen"],
  },
  { label: "Behavior", keys: ["event"] },
]

type Value = { label: string; value: number }

export const FilterPicker = () => {
  const search = useSearchParams()
  const { siteId, update } = useAnalyticsNav()
  const [open, setOpen] = useState(false)
  const [dim, setDim] = useState<string | null>(null)
  const [values, setValues] = useState<Value[] | null>(null)
  const [query, setQuery] = useState("")

  const choose = (key: string) => {
    setDim(key)
    setValues(null)
    setQuery("")
    const next = new URLSearchParams(search.toString())
    next.delete(key)
    next.set("dim", key)
    fetch(`/api/sites/${siteId}/values?${next}`)
      .then((r) => (r.ok ? r.json() : { values: [] }))
      .then((body: { values: Value[] }) => setValues(body.values))
      .catch(() => setValues([]))
  }

  const apply = (value: string) => {
    if (dim) update({ [dim]: value })
    setOpen(false)
  }

  const needle = query.trim().toLowerCase()
  const shown = (values ?? []).filter(
    (v) =>
      v.label &&
      dimensionLabel(dim ?? "", v.label)
        .toLowerCase()
        .includes(needle)
  )

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setDim(null)
      }}
    >
      <PopoverTrigger render={<Button variant="outline" size="sm" />}>
        <ListFilter aria-hidden />
        Filter
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 gap-0 p-0">
        {dim === null ? (
          <div className="flex max-h-96 flex-col gap-2 overflow-y-auto p-2">
            {GROUPS.map((group) => (
              <div key={group.label} className="flex flex-col">
                <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                  {group.label}
                </p>
                {group.keys.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => choose(key)}
                    className="rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted"
                  >
                    {FILTER_NAMES[key]}
                  </button>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="flex items-center gap-1 border-b p-2">
              <Button
                variant="ghost"
                size="icon-xs"
                aria-label="Back to dimensions"
                onClick={() => setDim(null)}
              >
                <ChevronLeft aria-hidden />
              </Button>
              <span className="text-sm font-medium">{FILTER_NAMES[dim]}</span>
            </div>
            <div className="p-2">
              <Input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${FILTER_NAMES[dim]?.toLowerCase()}`}
                aria-label={`Search ${FILTER_NAMES[dim]?.toLowerCase()}`}
                className="h-8"
              />
            </div>
            <ul className="flex max-h-72 flex-col overflow-y-auto px-2 pb-2">
              {values === null && (
                <li className="flex justify-center py-6">
                  <Spinner />
                </li>
              )}
              {values !== null && shown.length === 0 && (
                <li className="py-6 text-center text-sm text-muted-foreground">
                  No values in this period
                </li>
              )}
              {shown.map((v) => (
                <li key={v.label}>
                  <button
                    type="button"
                    onClick={() => apply(v.label)}
                    className="flex w-full items-center justify-between gap-3 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <DimensionIcon kind={dim} value={v.label} />
                      <span className="truncate">
                        {dimensionLabel(dim, v.label)}
                      </span>
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {formatNumber(v.value)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
