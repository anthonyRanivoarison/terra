import { describe, expect, it } from "bun:test"
import { EMPTY_OVERVIEW } from "./overview"
import { addOverview, mergeRows } from "./with-imported"

describe("addOverview", () => {
  const base = {
    ...EMPTY_OVERVIEW,
    visitors: 100,
    visits: 120,
    views: 300,
    bounceRate: 0.5,
    visitDuration: 60,
    conversionRate: 0.1,
  }

  it("adds counts and weights rates by visits", () => {
    const merged = addOverview(base, {
      visitors: 100,
      visits: 80,
      views: 200,
      bounces: 20,
      duration: 6000,
    })
    expect(merged).toMatchObject({ visitors: 200, visits: 200, views: 500 })
    expect(merged.bounceRate).toBeCloseTo(0.4)
    expect(merged.visitDuration).toBe(80)
    expect(merged.conversionRate).toBeCloseTo(0.05)
  })

  it("leaves the overview alone without imported data", () => {
    const none = { visitors: 0, visits: 0, views: 0, bounces: 0, duration: 0 }
    expect(addOverview(base, none)).toBe(base)
  })
})

describe("mergeRows", () => {
  it("sums matching labels, sorts and cuts to the limit", () => {
    const rows = mergeRows(
      [
        { label: "google.com", value: 5, visitors: 5 },
        { label: "x.com", value: 4, visitors: 4 },
      ],
      [
        { label: "x.com", value: 10, visitors: 10 },
        { label: "bing.com", value: 1, visitors: 1 },
      ],
      2
    )
    expect(rows.map((r) => [r.label, r.value])).toEqual([
      ["x.com", 14],
      ["google.com", 5],
    ])
  })
})
