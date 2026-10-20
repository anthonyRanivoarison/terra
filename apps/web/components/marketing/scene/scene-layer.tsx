"use client"

import { useCallback, useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { cn } from "@workspace/ui/lib/utils"

const Scene = dynamic(() => import("./scene").then((m) => m.Scene), {
  ssr: false,
})

type SceneLayerType = { onReady: () => void }

export const SceneLayer = ({ onReady }: SceneLayerType) => {
  const [visible, setVisible] = useState(true)
  const [compact, setCompact] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden)
    const media = window.matchMedia("(max-width: 767px)")
    const onMedia = () => setCompact(media.matches)
    onVisibility()
    onMedia()
    document.addEventListener("visibilitychange", onVisibility)
    media.addEventListener("change", onMedia)
    return () => {
      document.removeEventListener("visibilitychange", onVisibility)
      media.removeEventListener("change", onMedia)
    }
  }, [])

  const handleReady = useCallback(() => {
    setReady(true)
    onReady()
  }, [onReady])

  return (
    <div
      aria-hidden
      className={cn(
        "fixed inset-0 z-0 bg-(--marketing-space) transition-opacity duration-[1600ms] ease-out",
        ready ? "opacity-100" : "opacity-0"
      )}
    >
      <Scene active={visible} compact={compact} onReady={handleReady} />
    </div>
  )
}
