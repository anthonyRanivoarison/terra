"use client"

import { useState } from "react"

import { cn } from "@workspace/ui/lib/utils"

import { Section } from "./section"

type Touch = "first" | "last"

const stops = [
  { day: "Day 1", source: "ChatGPT", page: "/blog/pricing-guide" },
  { day: "Day 1", source: "Same visit", page: "/pricing" },
  { day: "Day 3", source: "Newsletter", page: "/changelog" },
  { day: "Day 4", source: "Google", page: "/checkout" },
]

const credit: Record<Touch, { index: number; text: string }> = {
  first: {
    index: 0,
    text: "First touch credits ChatGPT, the answer that introduced the store.",
  },
  last: {
    index: 3,
    text: "Last touch credits Google, the search right before checkout.",
  },
}

export const Journey = () => {
  const [touch, setTouch] = useState<Touch>("first")

  return (
    <Section
      id="journey"
      title="Trace one sale back to its first click."
      lead="An example order of $249, read backwards. Terra keeps both ends of the story, so you can credit the channel that started it or the one that closed it."
    >
      <div
        role="group"
        aria-label="Attribution"
        className="home-well inline-flex rounded-full p-1"
      >
        {(["first", "last"] as const).map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={touch === id}
            onClick={() => setTouch(id)}
            className={cn(
              "min-h-11 rounded-full px-4 text-sm whitespace-nowrap transition-colors",
              touch === id
                ? "home-revenue-fill text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {id === "first" ? "First touch" : "Last touch"}
          </button>
        ))}
      </div>
      <ol className="mt-10 grid gap-0 md:grid-cols-5">
        {stops.map((stop, index) => {
          const credited = credit[touch].index === index
          return (
            <li
              key={stop.page}
              className="relative border-l border-border pb-8 pl-6 md:border-t md:border-l-0 md:pt-6 md:pr-4 md:pb-0 md:pl-0"
            >
              <span
                aria-hidden
                className={cn(
                  "absolute top-1 -left-[5px] size-2.5 rounded-full transition-colors duration-300 md:-top-[5px] md:left-0",
                  credited ? "home-revenue-fill" : "bg-border"
                )}
              />
              <p className="font-mono text-xs text-muted-foreground">
                {stop.day}
              </p>
              <p
                className={cn(
                  "mt-1 font-heading text-xl font-semibold transition-colors duration-300",
                  credited && "home-revenue"
                )}
              >
                {stop.source}
              </p>
              <p className="mt-1 truncate font-mono text-sm text-muted-foreground">
                {stop.page}
              </p>
            </li>
          )
        })}
        <li className="relative border-l border-border pl-6 md:border-t md:border-l-0 md:pt-6 md:pl-0">
          <span
            aria-hidden
            className="home-revenue-fill absolute top-1 -left-[5px] size-2.5 rounded-full md:-top-[5px] md:left-0"
          />
          <p className="font-mono text-xs text-muted-foreground">Day 4</p>
          <p className="home-revenue mt-1 font-mono text-3xl tabular-nums">
            $249
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Order paid</p>
        </li>
      </ol>
      <p aria-live="polite" className="mt-8 max-w-[52ch] text-lg text-pretty">
        {credit[touch].text}
      </p>
    </Section>
  )
}
