type Flush<T> = (items: T[]) => Promise<void>

export class Batcher<T> {
  private items: T[] = []
  private timer: ReturnType<typeof setInterval>
  private flushing: Promise<void> | null = null

  constructor(
    private readonly flushFn: Flush<T>,
    private readonly max = 500,
    intervalMs = 1000
  ) {
    this.timer = setInterval(() => void this.flush(), intervalMs)
  }

  push(item: T): void {
    this.items.push(item)
    if (this.items.length >= this.max) void this.flush()
  }

  get size(): number {
    return this.items.length
  }

  async flush(): Promise<void> {
    if (this.flushing) return this.flushing
    if (!this.items.length) return
    const batch = this.items.splice(0, this.items.length)
    this.flushing = this.flushFn(batch)
      .catch((error) => {
        console.error(
          `[ingest] flush of ${batch.length} failed, retrying`,
          error
        )
        this.items.unshift(...batch.slice(-50_000))
      })
      .finally(() => {
        this.flushing = null
      })
    return this.flushing
  }

  async close(): Promise<void> {
    clearInterval(this.timer)
    await this.flush()
    if (this.items.length) await this.flush()
  }
}
