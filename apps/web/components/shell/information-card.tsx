"use client"

import { useState, useSyncExternalStore } from "react"
import Image from "next/image"
import Link from "next/link"
import { XIcon } from "@phosphor-icons/react/ssr"
import { cn } from "@workspace/ui/lib/utils"
import { ANNOUNCEMENTS } from "./announcements"

const KEY = "terra:announcements:dismissed"
const HEIGHT = 112
const PEEK = 10
const GAP = 8
const listeners = new Set<() => void>()

const read = () => {
  try {
    return window.localStorage.getItem(KEY) ?? "[]"
  } catch {
    return "[]"
  }
}

const write = (ids: string[]) => {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(ids))
  } catch {}
  listeners.forEach((listener) => listener())
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const parse = (raw: string | null): string[] => {
  try {
    const value = JSON.parse(raw ?? "[]")
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export const InformationCard = () => {
  const raw = useSyncExternalStore(subscribe, read, () => null)
  const [expanded, setExpanded] = useState(false)
  if (raw === null) return null
  const dismissed = parse(raw)
  const visible = ANNOUNCEMENTS.filter((a) => !dismissed.includes(a.id))
  const count = visible.length
  if (count === 0) return null
  const height = expanded
    ? count * HEIGHT + (count - 1) * GAP
    : HEIGHT + (count - 1) * PEEK

  return (
    <section
      aria-label="Announcements"
      className="relative transition-[height] duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-data-[collapsible=icon]:hidden motion-reduce:transition-none"
      style={{ height }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node))
          setExpanded(false)
      }}
    >
      <ol className="contents">
        {visible.map((item, i) => {
          const y = expanded ? -i * (HEIGHT + GAP) : -i * PEEK
          const scale = expanded ? 1 : 1 - i * 0.05
          return (
            <li
              key={item.id}
              className="group/card absolute inset-x-0 bottom-0 origin-top transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] motion-reduce:transition-none"
              style={{
                height: HEIGHT,
                zIndex: count - i,
                transform: `translateY(${y}px) scale(${scale})`,
              }}
            >
              <Link
                href={item.href}
                {...(item.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                tabIndex={i === 0 || expanded ? undefined : -1}
                aria-label={`${item.kind}: ${item.title}`}
                className="relative block size-full overflow-hidden rounded-lg bg-muted shadow-[0_1px_2px_oklch(0_0_0/0.06),0_4px_12px_-4px_oklch(0_0_0/0.12)] outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
              >
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="240px"
                  className="object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-1 bg-linear-to-t from-sidebar via-sidebar/80 to-transparent px-2.5 pt-8 pr-8 pb-2">
                  <span className="rounded-sm bg-primary/10 px-1.5 py-px text-[10px] leading-4 font-medium text-primary">
                    {item.kind}
                  </span>
                  <span className="w-full truncate text-sm leading-5 font-medium text-sidebar-foreground">
                    {item.title}
                  </span>
                </div>
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-lg outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10"
                />
              </Link>
              <button
                type="button"
                aria-label={`Dismiss: ${item.title}`}
                tabIndex={i === 0 || expanded ? undefined : -1}
                onClick={() => write([...dismissed, item.id])}
                className={cn(
                  "absolute top-1.5 right-1.5 z-10 flex size-6 items-center justify-center rounded-full bg-sidebar/85 text-sidebar-foreground/80 opacity-0 shadow-sm backdrop-blur-sm transition-[opacity,color,scale] duration-150 outline-none group-hover/card:opacity-100 hover:text-sidebar-foreground focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-sidebar-ring active:scale-[0.96] pointer-coarse:opacity-100"
                )}
              >
                <XIcon aria-hidden className="size-3.5" />
              </button>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
