import { beforeAll, describe, expect, it } from "bun:test"

let demo: typeof import("./demo")

beforeAll(async () => {
  process.env.DEMO_SITE_IDS = "ws_demo, ws_shop"
  demo = await import("./demo")
})

describe("demo access", () => {
  it("only matches the configured sites", () => {
    expect(demo.isDemoSite("ws_demo")).toBe(true)
    expect(demo.isDemoSite("ws_shop")).toBe(true)
    expect(demo.isDemoSite("ws_other")).toBe(false)
    expect(demo.isDemoSite("")).toBe(false)
  })

  it("opens the dashboard but not settings or tracking", () => {
    expect(demo.isDemoPath("/sites/ws_demo/dashboard")).toBe(true)
    expect(demo.isDemoPath("/sites/ws_demo/dashboard/sessions/abc")).toBe(true)
    expect(demo.isDemoPath("/sites/ws_shop/dashboard/pages")).toBe(true)
    expect(demo.isDemoPath("/sites/ws_demo")).toBe(false)
    expect(demo.isDemoPath("/sites/ws_demo/settings/revenue")).toBe(false)
    expect(demo.isDemoPath("/sites/ws_demo/dashboardx")).toBe(false)
    expect(demo.isDemoPath("/sites/ws_other/dashboard")).toBe(false)
  })
})
