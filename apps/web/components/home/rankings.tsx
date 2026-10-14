"use client"

import { useState } from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@workspace/ui/lib/utils"

import {
  DEMO_CHANNELS,
  formatCount,
  formatMoney,
} from "@/components/landing/demo-data"

import { Section } from "./section"

type Mode = "visitors" | "revenue"

const modes: { id: Mode; label: string; note: string }[] = [
  {
    id: "visitors",
    label: "Rank by visitors",
    note: "By visitors, X is your second best channel and ChatGPT is fourth.",
  },
  {
    id: "revenue",
    label: "Rank by revenue",
    note: "By revenue, ChatGPT is second and X is second to last. Same visits, a different budget.",
  },
]

export const Rankings = () => {
  const [mode, setMode] = useState<Mode>("visitors")
  const still = useReducedMotion()
  const rows = [...DEMO_CHANNELS].sort((a, b) => b[mode] - a[mode])
  const top = rows[0]![mode]
  const active = modes.find((item) => item.id === mode)!

  return (
    <Section
      id="rankings"
      title="Same traffic, two rankings."
      lead="Flip the switch. The visits do not change, only what you count. This is demo data from a sample store."
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:items-start">
        <div>
          <div
            role="group"
            aria-label="Ranking"
            className="home-well inline-flex rounded-full p-1"
          >
            {modes.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={mode === item.id}
                onClick={() => setMode(item.id)}
                className={cn(
                  "min-h-11 rounded-full px-4 text-sm whitespace-nowrap transition-colors",
                  mode === item.id
                    ? item.id === "revenue"
                      ? "home-revenue-fill text-primary-foreground"
                      : "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p
            aria-live="polite"
            className="mt-6 max-w-[34ch] text-lg leading-relaxed text-pretty"
          >
            {active.note}
          </p>
        </div>
        <ol className="grid gap-2">
          {rows.map((row, index) => (
            <motion.li
              key={row.name}
              layout={!still}
              transition={{ type: "spring", stiffness: 420, damping: 38 }}
              className="grid grid-cols-[1.5rem_6.5rem_minmax(0,1fr)_5rem] items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm"
            >
              <span className="font-mono text-muted-foreground tabular-nums">
                {index + 1}
              </span>
              <span className="truncate font-medium">{row.name}</span>
              <span className="home-well block h-2 overflow-hidden rounded-full">
                <span
                  className={cn(
                    "block h-full origin-left rounded-full transition-transform duration-500 ease-out",
                    mode === "revenue" ? "home-revenue-fill" : "bg-primary"
                  )}
                  style={{ transform: `scaleX(${row[mode] / top})` }}
                />
              </span>
              <span className="text-right font-mono tabular-nums">
                {mode === "revenue"
                  ? formatMoney(row.revenue)
                  : formatCount(row.visitors)}
              </span>
            </motion.li>
          ))}
        </ol>
      </div>
    </Section>
  )
}
