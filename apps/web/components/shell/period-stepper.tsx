"use client"

import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react/ssr"
import { Button } from "@workspace/ui/components/button"
import { ButtonGroup } from "@workspace/ui/components/button-group"
import { useAnalyticsNav } from "@/components/dashboard/nav-context"
import type { AnalyticsParams } from "@/lib/analytics/params"
import { shiftPeriod } from "@/lib/analytics/period"

type PeriodStepperType = { params: Pick<AnalyticsParams, "current" | "tz"> }

export const PeriodStepper = ({ params }: PeriodStepperType) => {
  const { update } = useAnalyticsNav()
  const previous = shiftPeriod(params, -1)
  const next = shiftPeriod(params, 1)
  const go = (period: { from: string; to: string } | null) =>
    period && update({ range: "custom", ...period })

  return (
    <ButtonGroup aria-label="Change period">
      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Previous period"
        disabled={!previous}
        onClick={() => go(previous)}
      >
        <CaretLeftIcon aria-hidden />
      </Button>
      <Button
        variant="outline"
        size="icon-sm"
        aria-label="Next period"
        disabled={!next}
        onClick={() => go(next)}
      >
        <CaretRightIcon aria-hidden />
      </Button>
    </ButtonGroup>
  )
}
