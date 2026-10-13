"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export const useSiteLive = (publicId: string) => {
  const router = useRouter()
  const [live, setLive] = useState(false)

  useEffect(() => {
    let stopped = false
    const check = async () => {
      try {
        const res = await fetch(`/api/sites/${publicId}/status`, {
          cache: "no-store",
        })
        if (!res.ok || stopped) return
        const body = (await res.json()) as { live?: boolean }
        if (!body.live) return
        stopped = true
        clearInterval(timer)
        setLive(true)
        router.refresh()
      } catch {}
    }
    const timer = setInterval(check, 5000)
    return () => {
      stopped = true
      clearInterval(timer)
    }
  }, [publicId, router])

  return live
}
