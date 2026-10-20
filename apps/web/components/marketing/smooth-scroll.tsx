"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { ReactLenis, type LenisRef } from "lenis/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

type SmoothScrollType = { children: ReactNode }

export const SmoothScroll = ({ children }: SmoothScrollType) => {
  const lenisRef = useRef<LenisRef>(null)
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setEnabled(!media.matches)
    sync()
    media.addEventListener("change", sync)
    return () => media.removeEventListener("change", sync)
  }, [])

  useEffect(() => {
    if (!enabled) return
    const lenis = lenisRef.current?.lenis
    const update = (time: number) => lenisRef.current?.lenis?.raf(time * 1000)
    lenis?.on("scroll", ScrollTrigger.update)
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)
    return () => {
      lenis?.off("scroll", ScrollTrigger.update)
      gsap.ticker.remove(update)
    }
  }, [enabled])

  return (
    <>
      {enabled && (
        <ReactLenis
          root
          ref={lenisRef}
          options={{ autoRaf: false, lerp: 0.085 }}
        />
      )}
      {children}
    </>
  )
}
