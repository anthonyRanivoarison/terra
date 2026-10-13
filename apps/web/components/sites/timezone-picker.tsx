"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import { Check, ChevronsUpDown, Search } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { cn } from "@workspace/ui/lib/utils"
import { useMinute } from "@/hooks/use-minute"
import {
  browserTimezone,
  listTimezones,
  timeIn,
  timezoneLabel,
} from "@/lib/timezones"

type TimezonePickerType = {
  id: string
  name: string
  describedBy?: string
}

type ZoneTimeType = { zone: string; now: Date | null }

const ZoneTime = ({ zone, now }: ZoneTimeType) =>
  now ? (
    <span className="shrink-0 text-xs text-muted-foreground">
      where time is {timeIn(zone, now)}
    </span>
  ) : null

export const TimezonePicker = ({
  id,
  name,
  describedBy,
}: TimezonePickerType) => {
  const listId = useId()
  const now = useMinute()
  const zones = useMemo(() => listTimezones(), [])
  const [value, setValue] = useState("UTC")
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [active, setActive] = useState(0)
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => setValue(browserTimezone()), [])

  const matches = useMemo(() => {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
    return zones.filter((zone) => {
      const text = `${zone} ${timezoneLabel(zone)}`.toLowerCase()
      return terms.every((term) => text.includes(term))
    })
  }, [zones, query])

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" })
  }, [active, open])

  const openChange = (next: boolean) => {
    setOpen(next)
    setQuery("")
    setActive(Math.max(0, zones.indexOf(value)))
  }

  const choose = (zone: string) => {
    setValue(zone)
    setOpen(false)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const last = matches.length - 1
    const moves: Record<string, number> = {
      ArrowDown: Math.min(active + 1, last),
      ArrowUp: Math.max(active - 1, 0),
      PageDown: Math.min(active + 8, last),
      PageUp: Math.max(active - 8, 0),
      Home: 0,
      End: last,
    }
    if (event.key in moves) {
      event.preventDefault()
      setActive(moves[event.key]!)
    } else if (event.key === "Enter") {
      event.preventDefault()
      const zone = matches[active]
      if (zone) choose(zone)
    }
  }

  return (
    <Popover open={open} onOpenChange={openChange}>
      <input type="hidden" name={name} value={value} />
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            aria-describedby={describedBy}
            className="h-10 w-full justify-between gap-3 px-3 font-normal"
          />
        }
      >
        <span className="truncate">{timezoneLabel(value)}</span>
        <span className="flex items-center gap-2">
          <ZoneTime zone={value} now={now} />
          <ChevronsUpDown className="text-muted-foreground" aria-hidden />
        </span>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--anchor-width) min-w-72 gap-0 p-0"
      >
        <div className="flex items-center gap-2 border-b px-3">
          <Search className="size-4 text-muted-foreground" aria-hidden />
          <input
            role="combobox"
            aria-label="Search timezones"
            aria-expanded
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={
              matches[active] ? `${listId}-${active}` : undefined
            }
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setActive(0)
            }}
            onKeyDown={onKeyDown}
            placeholder="Search a city or region"
            className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-label="Timezones"
          className="max-h-72 overflow-y-auto p-1"
        >
          {matches.length === 0 && (
            <li className="px-2 py-6 text-center text-sm text-muted-foreground">
              No timezone found.
            </li>
          )}
          {matches.map((zone, index) => (
            <li
              key={zone}
              id={`${listId}-${index}`}
              data-index={index}
              role="option"
              aria-selected={zone === value}
              onMouseMove={() => setActive(index)}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => choose(zone)}
              className={cn(
                "flex cursor-default items-center gap-2 rounded-md px-2 py-1.5 text-sm",
                index === active && "bg-accent text-accent-foreground"
              )}
            >
              <Check
                aria-hidden
                className={cn("size-4", zone !== value && "invisible")}
              />
              <span className="min-w-0 flex-1 truncate">
                {timezoneLabel(zone)}
              </span>
              <ZoneTime zone={zone} now={now} />
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
