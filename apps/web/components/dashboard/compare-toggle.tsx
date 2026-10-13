"use client"

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@workspace/ui/components/toggle-group"
import { useAnalyticsNav } from "./nav-context"

type CompareToggleType = { compare: string | null }

export const CompareToggle = ({ compare }: CompareToggleType) => {
  const { update } = useAnalyticsNav()
  return (
    <ToggleGroup
      variant="outline"
      size="sm"
      spacing={0}
      value={[compare ?? "off"]}
      onValueChange={(value) => {
        const next = value[0]
        if (next) update({ compare: next === "off" ? null : next })
      }}
      aria-label="Compare with"
    >
      <ToggleGroupItem value="off">No compare</ToggleGroupItem>
      <ToggleGroupItem value="prev">Previous</ToggleGroupItem>
      <ToggleGroupItem value="year">Last year</ToggleGroupItem>
    </ToggleGroup>
  )
}
