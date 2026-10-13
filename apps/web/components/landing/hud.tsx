"use client"

import { useEffect, useState } from "react"

import { cn } from "@workspace/ui/lib/utils"

import { channelName, mulberry32, type ChannelId } from "./data"
import { Ticker } from "./ticker"

const count = (value: number) => Math.round(value).toLocaleString("en-US")
const money = (value: number) => `$${count(value)}`
const BASKETS = [29, 49, 89, 129, 249]
const WEIGHTS: ChannelId[] = [
  "google",
  "google",
  "chatgpt",
  "chatgpt",
  "newsletter",
  "x",
]

const initial = {
  online: 214,
  revenue: 3482,
  byChannel: { google: 1420, chatgpt: 1180, newsletter: 640, x: 242 } as Record<
    ChannelId,
    number
  >,
  sale: 0,
}

const topChannel = (byChannel: Record<ChannelId, number>) =>
  (Object.entries(byChannel) as [ChannelId, number][]).sort(
    (a, b) => b[1] - a[1]
  )[0]![0]

type HudType = {
  reduced: boolean
}

export const Hud = ({ reduced }: HudType) => {
  const [state, setState] = useState(initial)
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    if (reduced) return
    const random = mulberry32(42)
    const id = setInterval(() => {
      setState((current) => {
        const online = Math.min(
          320,
          Math.max(160, current.online + Math.round((random() - 0.42) * 12))
        )
        if (random() > 0.3) return { ...current, online, sale: 0 }
        const amount = BASKETS[Math.floor(random() * BASKETS.length)]!
        const channel = WEIGHTS[Math.floor(random() * WEIGHTS.length)]!
        return {
          online,
          revenue: current.revenue + amount,
          byChannel: {
            ...current.byChannel,
            [channel]: current.byChannel[channel] + amount,
          },
          sale: amount,
        }
      })
    }, 2600)
    return () => clearInterval(id)
  }, [reduced])

  useEffect(() => {
    const zone = document.getElementById("scene-zone")
    if (!zone) return
    const observer = new IntersectionObserver(
      ([entry]) => setHidden(!(entry?.isIntersecting ?? true)),
      { rootMargin: "-100% 0px 0px 0px" }
    )
    observer.observe(zone)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-20 transition-opacity duration-500",
        hidden && "opacity-0"
      )}
    >
      <div className="mx-auto flex w-full max-w-[90rem] items-end justify-between gap-4 px-4 pb-4 sm:px-6 md:px-10 md:pb-7 lg:px-16">
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="landing-live-dot" />
          Live · demo data
        </span>
        <dl className="flex items-end gap-5 md:gap-9">
          <div className="flex flex-col items-end gap-0.5">
            <dt className="text-xs text-muted-foreground">Visitors online</dt>
            <dd className="font-mono text-sm text-foreground tabular-nums md:text-base">
              <Ticker value={state.online} format={count} />
            </dd>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <dt className="text-xs text-muted-foreground">Revenue today</dt>
            <dd className="relative font-mono text-sm text-foreground tabular-nums md:text-base">
              {state.sale > 0 ? (
                <span
                  key={state.revenue}
                  className="landing-sale absolute -top-5 right-0 text-xs"
                >
                  +${state.sale}
                </span>
              ) : null}
              <Ticker value={state.revenue} format={money} />
            </dd>
          </div>
          <div className="hidden flex-col items-end gap-0.5 sm:flex">
            <dt className="text-xs text-muted-foreground">Top channel</dt>
            <dd className="font-mono text-sm text-foreground md:text-base">
              {channelName(topChannel(state.byChannel))}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
