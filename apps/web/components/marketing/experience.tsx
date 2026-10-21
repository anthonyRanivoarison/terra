"use client"

import { useCallback, useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { Chapters } from "./chapters"
import { Closing } from "./closing"
import { Faq } from "./faq"
import { Hero } from "./hero"
import { Hud } from "./hud"
import { Install } from "./install"
import { SceneLayer } from "./scene/scene-layer"
import { pointer, resetRig, rig, shots } from "./scene/rig"

gsap.registerPlugin(ScrollTrigger, useGSAP)

type ExperienceType = { signedIn: boolean }

export const Experience = ({ signedIn }: ExperienceType) => {
  const track = useRef<HTMLDivElement>(null)
  const reduced = useRef(false)

  useEffect(() => {
    reduced.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    resetRig(reduced.current)
    const onPointer = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.y = -((event.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener("pointermove", onPointer, { passive: true })
    return () => window.removeEventListener("pointermove", onPointer)
  }, [])

  const handleReady = useCallback(() => {
    if (reduced.current) {
      rig.intro = 1
      return
    }
    gsap.to(rig, { intro: 1, duration: 3.2, ease: "power3.out", delay: 0.1 })
    ScrollTrigger.refresh()
  }, [])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({
            defaults: { ease: "power2.inOut" },
            scrollTrigger: {
              trigger: track.current,
              start: "top top",
              end: "bottom bottom",
              scrub: 1.2,
            },
          })
          .to(rig, { ...shots.traffic, duration: 1 }, 0)
          .to(rig, { arcs: 1, duration: 0.6, ease: "power1.out" }, 0.5)
          .to(rig, { ...shots.trafficDrift, duration: 1.4, ease: "none" }, 1)
          .to(rig, { ...shots.revenue, duration: 1 }, 2.4)
          .to(rig, { sales: 1, duration: 0.6, ease: "power1.out" }, 3)
          .to(rig, { ...shots.revenuePush, duration: 1.2, ease: "none" }, 3.4)
          .to(rig, { ...shots.live, duration: 1 }, 4.6)
          .to(rig, { live: 1, duration: 0.5, ease: "power1.out" }, 5)
          .to(rig, { live: 0, duration: 0.4, ease: "power1.in" }, 6.2)
          .to(rig, { ...shots.ai, duration: 1 }, 6.4)
          .to(rig, { ...shots.aiDrift, duration: 0.6, ease: "none" }, 7.4)
          .set({}, {}, 8)
        return () => {
          resetRig(false)
          rig.intro = 1
        }
      })
      return () => mm.revert()
    },
    { scope: track }
  )

  return (
    <>
      <SceneLayer onReady={handleReady} />
      <Hud signedIn={signedIn} />
      <main
        id="content"
        className="relative z-10 w-full max-w-full overflow-x-clip"
      >
        <div ref={track}>
          <Hero signedIn={signedIn} />
          <Chapters />
        </div>
        <Install />
        <Faq />
        <Closing signedIn={signedIn} />
      </main>
    </>
  )
}
