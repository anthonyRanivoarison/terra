"use client"

import { useCallback, useEffect, useState } from "react"
import dynamic from "next/dynamic"

import { cn } from "@workspace/ui/lib/utils"

import { SceneLabels } from "./scene-labels"

const GlobeScene = dynamic(() => import("./scene"), { ssr: false })

type SceneLayerType = {
  reduced: boolean
  onReady: () => void
}

const idle = (callback: () => void) => {
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(callback, { timeout: 1200 })
    return () => window.cancelIdleCallback(id)
  }
  const id = setTimeout(callback, 300)
  return () => clearTimeout(id)
}

export const SceneLayer = ({ reduced, onReady }: SceneLayerType) => {
  const [load, setLoad] = useState(false)
  const [visible, setVisible] = useState(true)
  const [inZone, setInZone] = useState(true)
  const [compact, setCompact] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => idle(() => setLoad(true)), [])

  useEffect(() => {
    const onVisibility = () => setVisible(!document.hidden)
    const media = window.matchMedia("(max-width: 767px)")
    const onMedia = () => setCompact(media.matches)
    onVisibility()
    onMedia()
    document.addEventListener("visibilitychange", onVisibility)
    media.addEventListener("change", onMedia)
    const zone = document.getElementById("scene-zone")
    const observer = new IntersectionObserver(([entry]) =>
      setInZone(entry?.isIntersecting ?? true)
    )
    if (zone) observer.observe(zone)
    return () => {
      document.removeEventListener("visibilitychange", onVisibility)
      media.removeEventListener("change", onMedia)
      observer.disconnect()
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
        "landing-poster fixed inset-0 z-0 transition-opacity duration-700",
        !inZone && "opacity-0"
      )}
    >
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-[1400ms] ease-out motion-reduce:duration-0",
          ready ? "opacity-100" : "opacity-0"
        )}
      >
        {load ? (
          <GlobeScene
            active={visible && inZone}
            compact={compact}
            reduced={reduced}
            onReady={handleReady}
          />
        ) : null}
        <SceneLabels />
      </div>
    </div>
  )
}
