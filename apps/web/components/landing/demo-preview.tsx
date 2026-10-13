"use client"

import { useRef } from "react"
import Link from "next/link"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { ArrowRight } from "lucide-react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { DemoChannels } from "./demo-channels"
import { DemoChart } from "./demo-chart"
import { TOTALS, formatCount, formatMoney, formatRate } from "./demo-data"

gsap.registerPlugin(ScrollTrigger, useGSAP)

const kpis = [
  { label: "Visitors", value: formatCount(TOTALS.visitors), delta: "+12.4%" },
  { label: "Revenue", value: formatMoney(TOTALS.revenue), delta: "+18.9%" },
  {
    label: "Conversion",
    value: `${((TOTALS.orders / TOTALS.visitors) * 100).toFixed(2)}%`,
    delta: "+0.3 pts",
  },
  {
    label: "Revenue per visitor",
    value: formatRate(TOTALS.revenue / TOTALS.visitors),
    delta: "+5.8%",
  },
]

export const DemoPreview = () => {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: "[data-frame]",
            start: "top 75%",
            once: true,
          },
        })
        tl.from("[data-frame]", {
          y: 40,
          opacity: 0,
          duration: 1.1,
          ease: "expo.out",
        })
          .from(
            "[data-bar]",
            {
              scaleY: 0,
              transformOrigin: "50% 100%",
              duration: 0.9,
              ease: "expo.out",
              stagger: 0.03,
            },
            0.25
          )
          .from(
            "[data-share]",
            { scaleX: 0, duration: 1, ease: "expo.out", stagger: 0.05 },
            0.35
          )
      })
      return () => mm.revert()
    },
    { scope: root }
  )

  return (
    <section
      ref={root}
      id="demo"
      aria-labelledby="demo-title"
      className="landing-demo relative scroll-mt-16 px-4 py-24 sm:px-6 md:px-10 md:py-32 lg:px-16"
    >
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2
              id="demo-title"
              className="font-heading text-[clamp(2.25rem,4.6vw,3.75rem)] leading-[1.02] font-semibold tracking-[-0.03em] text-balance"
            >
              Your Monday report, already written.
            </h2>
            <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-pretty text-muted-foreground md:text-lg">
              A store with demo data. X sends more visitors than ChatGPT, yet
              ChatGPT brings four times the revenue. That is the line Terra puts
              in front of you.
            </p>
          </div>
          <Link
            href="/auth/signup"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 shrink-0 self-start rounded-full px-6 md:self-auto"
            )}
          >
            Create a free account
            <ArrowRight data-icon="inline-end" />
          </Link>
        </div>

        <div
          data-frame
          className="mt-12 overflow-hidden rounded-2xl border border-foreground/10 bg-background shadow-[0_1px_2px_oklch(0.27_0.08_266/0.06),0_24px_60px_-24px_oklch(0.27_0.08_266/0.18)]"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-foreground/10 px-4 py-3 md:px-6">
            <span className="flex min-w-0 items-center gap-2.5 text-sm font-medium">
              <span
                aria-hidden
                className="size-4 shrink-0 rounded bg-[#0b1b3f]"
              />
              <span className="truncate">yourstore.com</span>
            </span>
            <span className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="landing-live-dot" />
                <span className="font-mono text-foreground tabular-nums">
                  37
                </span>{" "}
                online
              </span>
              <span className="hidden sm:inline">Last 14 days</span>
              <span className="rounded-full border border-foreground/15 px-2 py-0.5">
                Demo data
              </span>
            </span>
          </div>

          <dl className="grid grid-cols-2 border-b border-foreground/10 lg:grid-cols-4">
            {kpis.map((kpi, index) => (
              <div
                key={kpi.label}
                className={cn(
                  "px-4 py-4 md:px-6 md:py-5",
                  index % 2 === 1 && "border-l border-foreground/10",
                  index > 1 && "border-t border-foreground/10 lg:border-t-0",
                  index === 2 && "lg:border-l"
                )}
              >
                <dt className="text-xs text-muted-foreground md:text-sm">
                  {kpi.label}
                </dt>
                <dd className="mt-1 flex flex-wrap items-baseline gap-x-2">
                  <span className="font-mono text-xl text-foreground tabular-nums md:text-2xl">
                    {kpi.value}
                  </span>
                  <span className="font-mono text-xs text-[oklch(0.5_0.13_155)]">
                    {kpi.delta}
                  </span>
                </dd>
              </div>
            ))}
          </dl>

          <div className="grid lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <div className="border-b border-foreground/10 p-4 md:p-6 lg:border-r lg:border-b-0">
              <DemoChart />
            </div>
            <div className="p-4 md:p-6">
              <DemoChannels />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
