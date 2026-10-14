"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

const feed = [
  { bot: "GPTBot", path: "/pricing" },
  { bot: "Googlebot", path: "/" },
  { bot: "ClaudeBot", path: "/docs/install" },
  { bot: "Googlebot", path: "/blog/pricing-guide" },
  { bot: "PerplexityBot", path: "/changelog" },
  { bot: "GPTBot", path: "/blog/pricing-guide" },
  { bot: "ClaudeBot", path: "/pricing" },
  { bot: "Googlebot", path: "/docs/api" },
]

const VISIBLE = 5

export const CrawlLog = () => {
  const still = useReducedMotion()
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (still) return
    const id = setInterval(() => setTick((value) => value + 1), 1600)
    return () => clearInterval(id)
  }, [still])

  const lines = Array.from({ length: VISIBLE }, (_, offset) => {
    const id = tick + VISIBLE - 1 - offset
    return { id, ...feed[id % feed.length]! }
  })

  return (
    <div className="home-well rounded-2xl p-5">
      <p className="font-mono text-xs text-muted-foreground">
        Server log, demo data
      </p>
      <ul aria-hidden className="mt-4 grid gap-2 font-mono text-sm">
        <AnimatePresence initial={false} mode="popLayout">
          {lines.map((line) => (
            <motion.li
              key={line.id}
              layout={!still}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-[7.5rem_minmax(0,1fr)_auto] items-center gap-3"
            >
              <span className="truncate text-primary">{line.bot}</span>
              <span className="truncate text-muted-foreground">
                GET {line.path}
              </span>
              <span className="home-up whitespace-nowrap">verified</span>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}
