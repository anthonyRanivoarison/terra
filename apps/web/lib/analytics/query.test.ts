import { describe, expect, it } from "bun:test"
import { QueryBuilder } from "./query"

const SITE = "6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b"
const WINDOW = {
  from: "2026-10-01T00:00:00.000Z",
  to: "2026-10-08T00:00:00.000Z",
}

describe("QueryBuilder", () => {
  it("binds the site first and every filter value as a parameter", () => {
    const b = new QueryBuilder(SITE)
    const text = b.visits(WINDOW, {
      country: "FR' OR 1=1 --",
      page: "/pricing",
      event: "cta_click",
    })
    expect(text).not.toContain("OR 1=1")
    expect(text).toContain("v.site_id = $1::uuid")
    expect(text).toContain("v.country = $4")
    expect(text).toContain("s.site_id = $1::uuid")
    expect(text).toContain("e.site_id = $1::uuid")
    expect(b.params).toEqual([
      SITE,
      WINDOW.from,
      WINDOW.to,
      "FR' OR 1=1 --",
      "/pricing",
      "cta_click",
    ])
  })

  it("only uses whitelisted columns", () => {
    const b = new QueryBuilder(SITE)
    const text = b.visits(WINDOW, { ["is_bot = false; --" as "country"]: "x" })
    expect(text).not.toContain("is_bot = false; --")
    expect(b.params).toHaveLength(3)
  })

  it("scopes views and their visit subquery to the site", () => {
    const b = new QueryBuilder(SITE)
    const text = b.views(WINDOW, { page: "/", hostname: "a.example.com" })
    expect(text.match(/site_id = \$1::uuid/g)).toHaveLength(2)
    expect(text).toContain("v.hostname = ")
  })

  it("refuses to build without a site uuid", () => {
    expect(() => new QueryBuilder("")).toThrow()
    expect(() => new QueryBuilder("1 OR 1=1")).toThrow()
  })
})
