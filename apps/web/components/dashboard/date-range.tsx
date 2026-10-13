"use client"

import { useState } from "react"
import { CalendarDays, ChevronDown } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Calendar } from "@workspace/ui/components/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { cn } from "@workspace/ui/lib/utils"
import { useAnalyticsNav } from "./nav-context"

const PRESETS = [
  { value: "today", label: "Today" },
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "12m", label: "Last 12 months" },
]

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`

const short = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })

type DayRange = { from: Date | undefined; to?: Date | undefined }

type DateRangeType = { range: string; from: string | null; to: string | null }

export const DateRange = ({ range, from, to }: DateRangeType) => {
  const { update } = useAnalyticsNav()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DayRange | undefined>(
    from && to
      ? { from: new Date(`${from}T00:00:00`), to: new Date(`${to}T00:00:00`) }
      : undefined
  )

  const label =
    range === "custom" && from && to
      ? `${short(from)} – ${short(to)}`
      : (PRESETS.find((p) => p.value === range)?.label ?? "Last 7 days")

  const choose = (value: string) => {
    setOpen(false)
    update({ range: value, from: null, to: null })
  }

  const apply = () => {
    if (!draft?.from) return
    setOpen(false)
    update({
      range: "custom",
      from: iso(draft.from),
      to: iso(draft.to ?? draft.from),
    })
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="min-w-40 justify-between gap-2 active:scale-[0.96]"
          />
        }
      >
        <CalendarDays className="size-4 text-muted-foreground" aria-hidden />
        <span className="flex-1 text-left">{label}</span>
        <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-auto p-0">
        <div className="flex flex-col sm:flex-row">
          <ul className="flex flex-row flex-wrap gap-1 border-b p-2 sm:w-40 sm:flex-col sm:border-r sm:border-b-0">
            {PRESETS.map((preset) => (
              <li key={preset.value}>
                <button
                  type="button"
                  onClick={() => choose(preset.value)}
                  className={cn(
                    "w-full rounded-md px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-muted",
                    range === preset.value && "bg-muted font-medium"
                  )}
                >
                  {preset.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2 p-2">
            <Calendar
              mode="range"
              selected={draft}
              onSelect={setDraft}
              disabled={{ after: new Date() }}
              numberOfMonths={1}
            />
            <Button size="sm" onClick={apply} disabled={!draft?.from}>
              Apply range
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
