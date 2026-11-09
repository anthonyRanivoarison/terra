import { describe, expect, it } from "bun:test"
import { allow } from "./limit"

describe("allow", () => {
  it("lets through the first hits of a window", () => {
    expect(allow("a", 2, 60_000)).toBe(true)
    expect(allow("a", 2, 60_000)).toBe(true)
    expect(allow("a", 2, 60_000)).toBe(false)
  })

  it("counts each key on its own", () => {
    expect(allow("b", 1, 60_000)).toBe(true)
    expect(allow("c", 1, 60_000)).toBe(true)
    expect(allow("b", 1, 60_000)).toBe(false)
  })

  it("opens a new window once the previous one ends", async () => {
    expect(allow("d", 1, 5)).toBe(true)
    expect(allow("d", 1, 5)).toBe(false)
    await Bun.sleep(10)
    expect(allow("d", 1, 5)).toBe(true)
  })
})
