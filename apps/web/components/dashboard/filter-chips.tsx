"use client"

import { X } from "lucide-react"
import { FILTER_NAMES as NAMES } from "./filter-names"
import { dimensionLabel } from "./format"
import { useAnalyticsNav } from "./nav-context"

type FilterChipsType = { filters: Record<string, string> }

export const FilterChips = ({ filters }: FilterChipsType) => {
  const { update } = useAnalyticsNav()
  const entries = Object.entries(filters)
  if (!entries.length) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {entries.map(([key, value]) => (
        <span
          key={key}
          className="inline-flex items-center gap-1.5 rounded-full border bg-card py-1 pr-1 pl-3 text-sm"
        >
          <span className="text-muted-foreground">{NAMES[key] ?? key}</span>
          <span className="max-w-56 truncate font-medium">
            {dimensionLabel(key, value)}
          </span>
          <button
            type="button"
            onClick={() => update({ [key]: null })}
            aria-label={`Remove ${NAMES[key] ?? key} filter`}
            className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        </span>
      ))}
      {entries.length > 1 && (
        <button
          type="button"
          onClick={() =>
            update(Object.fromEntries(entries.map(([key]) => [key, null])))
          }
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Clear all
        </button>
      )}
    </div>
  )
}
