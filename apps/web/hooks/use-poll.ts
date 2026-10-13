"use client"

import { useEffect, useState } from "react"

export function usePoll<T>(url: string, intervalMs: number, initial: T): T {
  const [data, setData] = useState<T>(initial)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    let controller: AbortController | null = null
    let stopped = false

    const tick = async () => {
      if (document.visibilityState === "visible") {
        controller = new AbortController()
        try {
          const res = await fetch(url, {
            cache: "no-store",
            signal: controller.signal,
          })
          if (res.ok && !stopped) setData((await res.json()) as T)
        } catch {}
      }
      if (!stopped) timer = setTimeout(tick, intervalMs)
    }
    const onVisible = () => {
      if (document.visibilityState !== "visible") return
      clearTimeout(timer)
      void tick()
    }

    void tick()
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      stopped = true
      clearTimeout(timer)
      controller?.abort()
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [url, intervalMs])

  return data
}
