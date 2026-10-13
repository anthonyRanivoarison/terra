"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

import { Chapters } from "./chapters"
import { Cta } from "./cta"
import { DemoPreview } from "./demo-preview"
import { Footer } from "./footer"
import { Hero } from "./hero"
import { Hud } from "./hud"
import { pointer, resetRig, rig, shotsFor } from "./rig"
import { SceneLayer } from "./scene-layer"
import { Setup } from "./setup"
import { SiteHeader } from "./site-header"

gsap.registerPlugin(ScrollTrigger, useGSAP)

type ExperienceType = {
  signedIn: boolean
}

export const Experience = ({ signedIn }: ExperienceType) => {
  const track = useRef<HTMLDivElement>(null)
  const loaded = useRef(false)
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduced(media.matches)
    sync()
    media.addEventListener("change", sync)
    const onPointer = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.y = -((event.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener("pointermove", onPointer, { passive: true })
    return () => {
      media.removeEventListener("change", sync)
      window.removeEventListener("pointermove", onPointer)
    }
  }, [])

  const handleReady = useCallback(() => {
    loaded.current = true
    if (rig.motion === 0) {
      rig.intro = 1
      return
    }
    gsap.to(rig, { intro: 1, duration: 2.6, ease: "expo.out", delay: 0.1 })
    ScrollTrigger.refresh()
  }, [])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(
        {
          motion: "(prefers-reduced-motion: no-preference)",
          compact: "(max-width: 767px)",
        },
        (context) => {
          const { motion, compact } = context.conditions as Record<
            string,
            boolean
          >
          resetRig(!motion, Boolean(compact))
          if (loaded.current) rig.intro = 1
          if (!motion) return
          const shots = shotsFor(Boolean(compact))
          gsap
            .timeline({
              defaults: { ease: "power2.inOut" },
              scrollTrigger: {
                trigger: track.current,
                start: "top top",
                end: "bottom bottom",
                scrub: 1,
              },
            })
            .to(rig, { ...shots.sources, duration: 1 }, 0)
            .to(rig, { labels: 1, duration: 0.4, ease: "power1.out" }, 0.6)
            .to(rig, { spin: 0.2, duration: 1, ease: "none" }, 1)
            .to(rig, { labels: 0, duration: 0.35 }, 1.85)
            .to(rig, { ...shots.revenue, duration: 0.9 }, 2.1)
            .to(rig, { revenue: 1, duration: 0.5 }, 2.5)
            .to(rig, { spin: 0.4, duration: 1, ease: "none" }, 3)
            .to(rig, { revenue: 0.25, duration: 0.5 }, 3.9)
            .to(rig, { ...shots.ai, duration: 0.9 }, 4.1)
            .to(rig, { ai: 1, duration: 0.6, ease: "power1.out" }, 4.4)
            .to(rig, { spin: 0.6, duration: 1, ease: "none" }, 5)
          gsap.to(rig, {
            recede: 1,
            ease: "power2.inOut",
            scrollTrigger: {
              trigger: "#setup",
              start: "top bottom",
              end: "top 15%",
              scrub: 1,
            },
          })
        }
      )
      return () => mm.revert()
    },
    { scope: track }
  )

  return (
    <div className="landing relative min-h-[100svh]">
      <a
        href="#content"
        className="fixed top-3 left-3 z-40 -translate-y-20 rounded-md bg-foreground px-4 py-3 text-sm text-background focus-visible:translate-y-0"
      >
        Skip to content
      </a>
      <SceneLayer reduced={reduced} onReady={handleReady} />
      <SiteHeader signedIn={signedIn} />
      <Hud reduced={reduced} />
      <main
        id="content"
        className="relative z-10 w-full max-w-full overflow-x-clip"
      >
        <div id="scene-zone">
          <div ref={track}>
            <Hero />
            <Chapters />
          </div>
          <Setup />
        </div>
        <DemoPreview />
        <Cta />
      </main>
      <div className="relative z-10 bg-background">
        <Footer />
      </div>
    </div>
  )
}
