import { describe, expect, test } from "bun:test"
import { traits, visitorName } from "./identity"

describe("visitor identity", () => {
  test("same id gives the same name and traits", () => {
    expect(visitorName("v_123")).toBe(visitorName("v_123"))
    expect(traits("v_123")).toEqual(traits("v_123"))
  })

  test("different ids spread across names", () => {
    const names = new Set(
      Array.from({ length: 200 }, (_, i) => visitorName(`v_${i}`))
    )
    expect(names.size).toBeGreaterThan(100)
  })
})
