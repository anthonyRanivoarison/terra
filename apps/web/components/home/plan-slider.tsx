"use client"

import { useState } from "react"
import Link from "next/link"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { formatCount } from "@/components/landing/demo-data"

type PlanSliderType = {
  plans: { id: string; name: string; quota: number }[]
}

const STEPS = 60

export const PlanSlider = ({ plans }: PlanSliderType) => {
  const [step, setStep] = useState(24)
  const floor = 1000
  const ceiling = plans[plans.length - 1]!.quota
  const raw = floor * Math.pow(ceiling / floor, step / STEPS)
  const events = Math.round(raw / 1000) * 1000
  const match = plans.find((plan) => events <= plan.quota) ?? plans.at(-1)!

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-center">
      <div>
        <label htmlFor="events" className="text-sm text-muted-foreground">
          Events you send each month
        </label>
        <p className="mt-2 font-mono text-[clamp(2.5rem,7vw,5rem)] leading-none tabular-nums">
          {formatCount(events)}
        </p>
        <input
          id="events"
          type="range"
          min={0}
          max={STEPS}
          value={step}
          onChange={(event) => setStep(Number(event.target.value))}
          aria-valuetext={`${formatCount(events)} events, ${match.name} plan`}
          className="home-range mt-8 w-full"
        />
      </div>
      <div>
        <ul className="grid gap-2">
          {plans.map((plan) => (
            <li
              key={plan.id}
              className={cn(
                "flex items-baseline justify-between gap-4 rounded-xl border px-4 py-3 transition-colors duration-200",
                plan.id === match.id
                  ? "border-primary bg-card"
                  : "border-border text-muted-foreground"
              )}
            >
              <span className="font-heading text-lg font-semibold">
                {plan.name}
              </span>
              <span className="font-mono text-sm tabular-nums">
                up to {formatCount(plan.quota)}
              </span>
            </li>
          ))}
        </ul>
        <Link
          href="/auth/signup"
          className={cn(
            buttonVariants({ size: "lg" }),
            "mt-6 h-12 w-full whitespace-nowrap"
          )}
        >
          Start with {match.name}
        </Link>
        <p className="mt-3 text-sm text-muted-foreground">
          Every plan has every feature. Prices are shown at checkout.
        </p>
      </div>
    </div>
  )
}
