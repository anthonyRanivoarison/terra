import { describe, expect, it } from "bun:test"
import { Batcher } from "./batcher"

describe("Batcher", () => {
  it("flushes when the batch is full", async () => {
    const flushed: number[][] = []
    const batcher = new Batcher<number>(
      async (items) => void flushed.push(items),
      2,
      60_000
    )
    batcher.push(1)
    batcher.push(2)
    await batcher.close()
    expect(flushed).toEqual([[1, 2]])
  })

  it("keeps the items of a failed flush for the next one", async () => {
    let calls = 0
    const flushed: number[][] = []
    const batcher = new Batcher<number>(
      async (items) => {
        calls += 1
        if (calls === 1) throw new Error("db down")
        flushed.push(items)
      },
      10,
      60_000
    )
    const error = console.error
    console.error = () => {}
    batcher.push(1)
    await batcher.flush()
    console.error = error
    expect(batcher.size).toBe(1)
    await batcher.close()
    expect(flushed).toEqual([[1]])
  })
})
