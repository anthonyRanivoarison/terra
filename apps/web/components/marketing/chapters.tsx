"use client"

import { useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { cn } from "@workspace/ui/lib/utils"
import { ChapterVisual } from "./chapter-visual"
import { chapters } from "./data"

gsap.registerPlugin(ScrollTrigger, useGSAP)

const placement: Record<string, string> = {
  traffic: "items-end justify-start pb-24 md:items-center md:pb-0",
  revenue: "items-end justify-end pb-24 md:items-center md:pb-0",
  live: "items-end justify-start pb-24 md:items-center md:pb-0",
  ai: "items-end justify-start pb-24 md:items-end md:pb-28",
}

export const Chapters = () => {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-chapter]").forEach((section) => {
          const lines = section.querySelectorAll("[data-line]")
          const bars = section.querySelectorAll("[data-bar]")
          const tl = gsap
            .timeline({
              scrollTrigger: {
                trigger: section,
                start: "top top",
                end: "bottom bottom",
                scrub: 0.6,
              },
            })
            .fromTo(
              lines,
              { opacity: 0, y: 56, filter: "blur(8px)" },
              {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                stagger: 0.06,
                duration: 0.25,
                ease: "power3.out",
              },
              0
            )
            .to(
              lines,
              {
                opacity: 0,
                y: -40,
                filter: "blur(6px)",
                stagger: 0.03,
                duration: 0.2,
                ease: "power2.in",
              },
              0.8
            )
          if (bars.length)
            tl.from(
              bars,
              { scaleX: 0, stagger: 0.05, duration: 0.3, ease: "power3.out" },
              0.12
            )
          tl.fromTo(
            section.querySelector("[data-giant]"),
            { xPercent: 10 },
            { xPercent: -26, duration: 1, ease: "none" },
            0
          )
        })
      })
      return () => mm.revert()
    },
    { scope: root }
  )

  return (
    <div ref={root}>
      {chapters.map((chapter) => (
        <section
          key={chapter.id}
          id={chapter.id}
          data-chapter
          aria-labelledby={`${chapter.id}-title`}
          className="relative h-[200vh] motion-reduce:h-auto"
        >
          <div
            className={cn(
              "sticky top-0 flex h-dvh overflow-hidden px-5 motion-reduce:static motion-reduce:h-auto motion-reduce:py-28 md:px-12",
              placement[chapter.id]
            )}
          >
            <span
              data-giant
              aria-hidden
              className="marketing-accent pointer-events-none absolute bottom-[5vh] left-0 text-[24vw] leading-none tracking-[-0.03em] whitespace-nowrap text-foreground/[0.05] select-none"
            >
              {chapter.name}
            </span>
            <article className="marketing-panel relative w-full max-w-[30rem] rounded-[1.75rem] p-6 md:p-8">
              <h2
                data-line
                id={`${chapter.id}-title`}
                className="font-heading text-[clamp(1.9rem,3.4vw,3rem)] leading-[1.02] font-semibold tracking-[-0.035em] text-balance"
              >
                {chapter.title}
              </h2>
              <p
                data-line
                className="mt-4 leading-relaxed text-pretty text-muted-foreground"
              >
                {chapter.body}
              </p>
              <div data-line className="mt-6">
                <ChapterVisual id={chapter.id} />
              </div>
            </article>
          </div>
        </section>
      ))}
    </div>
  )
}
