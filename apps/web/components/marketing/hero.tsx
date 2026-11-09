"use client"

import { useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { useLenis } from "lenis/react"
import type { Cta } from "./cta"
import { PillLink } from "./pill-link"
import { scrollToId } from "./scroll-to"
import { SplitChars } from "./split-chars"

gsap.registerPlugin(ScrollTrigger, useGSAP)

type HeroType = { cta: Cta; demo: boolean }

export const Hero = ({ cta, demo }: HeroType) => {
  const root = useRef<HTMLElement>(null)
  const lenis = useLenis()

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ delay: 0.35 })
          .from(".split-char", {
            yPercent: 118,
            rotateX: -75,
            opacity: 0,
            transformOrigin: "50% 100%",
            duration: 1.25,
            ease: "expo.out",
            stagger: 0.022,
          })
          .from(
            "[data-hero-fade]",
            { y: 28, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.1 },
            "-=0.85"
          )
          .from(
            "[data-hero-rule]",
            {
              scaleX: 0,
              transformOrigin: "0% 50%",
              duration: 1.4,
              ease: "expo.inOut",
            },
            "-=1.1"
          )
        gsap.to("[data-hero-content]", {
          yPercent: -18,
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom 15%",
            scrub: true,
          },
        })
      })
      return () => mm.revert()
    },
    { scope: root }
  )

  return (
    <section
      ref={root}
      id="top"
      className="relative flex min-h-dvh items-center px-5 pt-28 pb-32 md:px-12"
    >
      <div data-hero-content className="w-full max-w-5xl [perspective:900px]">
        <h1
          aria-label="See who reaches your site."
          className="text-[clamp(3rem,7.6vw,6rem)] leading-[0.92]"
        >
          <SplitChars text="See who reaches" className="marketing-accent" />
          <SplitChars
            text="your site."
            className="marketing-accent text-ring"
          />
        </h1>
        <div
          data-hero-rule
          className="mt-9 h-px w-full max-w-md bg-foreground/25"
        />
        <p
          data-hero-fade
          className="mt-7 max-w-[42ch] text-lg leading-relaxed text-pretty text-foreground/75"
        >
          Every visit, AI assistant and crawler, traced from the first click to
          the sale. Live, private, and set up with one script.
        </p>
        <div data-hero-fade className="mt-10 flex flex-wrap items-center gap-3">
          <PillLink href={cta.href}>{cta.label}</PillLink>
          {demo ? (
            <PillLink href="/demo" variant="ghost">
              See the live demo
            </PillLink>
          ) : (
            <PillLink
              href="#traffic"
              variant="ghost"
              onClick={(event) => {
                event.preventDefault()
                scrollToId("traffic", lenis)
              }}
            >
              Take the tour
            </PillLink>
          )}
        </div>
      </div>
    </section>
  )
}
