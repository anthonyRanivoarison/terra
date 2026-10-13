"use client"

import { useEffect, useState } from "react"

export function useMinute(): Date | null {
  const [now, setNow] = useState<Date | null>(null)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined
    const tick = () => setNow(new Date())
    tick()
    const timeout = setTimeout(
      () => {
        tick()
        interval = setInterval(tick, 60_000)
      },
      60_000 - (Date.now() % 60_000)
    )
    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [])
  return now
}
