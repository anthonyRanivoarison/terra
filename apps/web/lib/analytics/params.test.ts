import { describe, expect, it } from "bun:test"
import { parseParams, zonedMidnight } from "./params"

const NOW = Date.parse("2026-10-07T15:20:30Z")

describe("parseParams", () => {
  it("defaults to the last 7 days by day, compared to the week before", () => {
    const p = parseParams({}, NOW, "UTC")
    expect(p.range).toBe("7d")
    expect(p.granularity).toBe("day")
    expect(p.current).toEqual({
      from: "2026-10-01T00:00:00.000Z",
      to: "2026-10-07T15:25:00.000Z",
    })
    expect(p.previous.to).toBe(p.current.from)
    expect(p.compare).toBeNull()
    expect(p.tz).toBe("UTC")
  })

  it("starts today at local midnight", () => {
    const p = parseParams({ range: "today" }, NOW, "Europe/Paris")
    expect(p.current.from).toBe("2026-10-06T22:00:00.000Z")
    expect(p.granularity).toBe("hour")
  })

  it("falls back to UTC for an unknown timezone", () => {
    expect(parseParams({}, NOW, "Mars/Olympus").tz).toBe("UTC")
  })

  it("handles custom ranges and picks a granularity", () => {
    const p = parseParams(
      { range: "custom", from: "2026-01-01", to: "2026-06-30" },
      NOW,
      "UTC"
    )
    expect(p.range).toBe("custom")
    expect(p.granularity).toBe("month")
    expect(p.current.to).toBe("2026-07-01T00:00:00.000Z")
  })

  it("rejects malformed or reversed custom ranges", () => {
    expect(
      parseParams({ range: "custom", from: "x", to: "y" }, NOW).range
    ).toBe("7d")
    expect(
      parseParams(
        { range: "custom", from: "2026-02-01", to: "2026-01-01" },
        NOW
      ).range
    ).toBe("7d")
  })

  it("compares with the same period last year", () => {
    const p = parseParams({ range: "30d", compare: "year" }, NOW, "UTC")
    expect(p.compare).toBe("year")
    expect(Date.parse(p.current.from) - Date.parse(p.previous.from)).toBe(
      365 * 86_400_000
    )
  })

  it("keeps only known filters", () => {
    const p = parseParams(
      {
        country: "FR",
        hostname: "docs.example.com",
        hack: "1; DROP",
        page: ["/a", "/b"],
      },
      NOW
    )
    expect(p.filters).toEqual({
      country: "FR",
      hostname: "docs.example.com",
      page: "/a",
    })
  })

  it("computes midnight in UTC", () => {
    expect(zonedMidnight("2026-10-07", "UTC")).toBe(
      Date.parse("2026-10-07T00:00:00Z")
    )
  })
})
