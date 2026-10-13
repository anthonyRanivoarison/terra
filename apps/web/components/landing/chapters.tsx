"use client"

import { useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

import { cn } from "@workspace/ui/lib/utils"

import { CHAPTERS } from "./data"

gsap.registerPlugin(ScrollTrigger, useGSAP)

export const Chapters = () => {
  const root = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-chapter]").forEach((section) => {
          const lines = section.querySelectorAll("[data-line]")
          gsap
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
              { opacity: 0, y: 48 },
              {
                opacity: 1,
                y: 0,
                stagger: 0.04,
                duration: 0.16,
                ease: "expo.out",
              },
              0
            )
            .to(
              lines,
              {
                opacity: 0,
                y: -32,
                stagger: 0.03,
                duration: 0.12,
                ease: "power2.in",
              },
              0.86
            )
        })
      })
      return () => mm.revert()
    },
    { scope: root }
  )

  return (
    <div ref={root}>
      {CHAPTERS.map((chapter) => (
        <section
          key={chapter.id}
          id={chapter.id}
          data-chapter
          aria-labelledby={`${chapter.id}-title`}
          className="relative h-[200vh] motion-reduce:h-auto"
        >
          <div
            className={cn(
              "sticky top-0 flex h-[100svh] items-start px-4 pt-24 motion-reduce:static motion-reduce:h-auto motion-reduce:py-28 sm:px-6 md:items-center md:px-10 md:pt-0 lg:px-16",
              chapter.side === "end" ? "md:justify-end" : "md:justify-start"
            )}
          >
            <article className="landing-veil relative w-full max-w-[28rem] lg:max-w-[30rem]">
              <h2
                data-line
                id={`${chapter.id}-title`}
                className="font-heading text-[clamp(2rem,4vw,3.25rem)] leading-[1.04] font-semibold tracking-[-0.03em] text-balance"
              >
                {chapter.title}
              </h2>
              <p
                data-line
                className="mt-5 max-w-[56ch] text-base leading-relaxed text-pretty text-muted-foreground md:text-lg"
              >
                {chapter.body}
              </p>
              <dl
                data-line
                className="mt-7 grid grid-cols-2 gap-5 border-t border-foreground/10 pt-5"
              >
                {chapter.facts.map((fact) => (
                  <div key={fact.label}>
                    <dt className="text-sm text-muted-foreground">
                      {fact.label}
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-foreground md:text-base">
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </article>
          </div>
        </section>
      ))}
    </div>
  )
}
