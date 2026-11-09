import { describe, expect, it } from "bun:test"
import { parseParams } from "./params"
import { periodBounds, shiftPeriod } from "./period"

const NOW = Date.parse("2026-10-14T12:00:00Z")

describe("periods", () => {
  it("reads local bounds of a preset", () => {
    const params = parseParams({ range: "7d" }, NOW, "Europe/Paris")
    expect(periodBounds(params)).toEqual({
      from: "2026-10-08",
      to: "2026-10-14",
    })
  })

  it("steps back by the length of the window", () => {
    const params = parseParams({ range: "7d" }, NOW, "UTC")
    expect(shiftPeriod(params, -1, NOW)).toEqual({
      from: "2026-10-01",
      to: "2026-10-07",
    })
  })

  it("cannot step past today", () => {
    const params = parseParams({ range: "7d" }, NOW, "UTC")
    expect(shiftPeriod(params, 1, NOW)).toBeNull()
  })

  it("steps forward from a past custom range and clamps to today", () => {
    const params = parseParams(
      { range: "custom", from: "2026-10-05", to: "2026-10-11" },
      NOW,
      "UTC"
    )
    expect(shiftPeriod(params, 1, NOW)).toEqual({
      from: "2026-10-12",
      to: "2026-10-14",
    })
  })
})
