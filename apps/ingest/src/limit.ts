const windows = new Map<string, { start: number; hits: number }>()

export function allow(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const current = windows.get(key)
  if (!current || now - current.start >= windowMs) {
    windows.set(key, { start: now, hits: 1 })
    if (windows.size > 50_000) {
      for (const [k, w] of windows) {
        if (now - w.start >= windowMs) windows.delete(k)
      }
    }
    return true
  }
  current.hits += 1
  return current.hits <= max
}
