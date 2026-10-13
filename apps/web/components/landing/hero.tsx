"use client"

import { useRef } from "react"
import Link from "next/link"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { useLenis } from "lenis/react"
import { ArrowDown, ArrowRight } from "lucide-react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { scrollToId } from "./scroll-to"
import { SplitChars } from "./split-chars"

gsap.registerPlugin(ScrollTrigger, useGSAP)

export const Hero = () => {
  const root = useRef<HTMLElement>(null)
  const lenis = useLenis()

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ delay: 0.2 })
          .from(".split-char", {
            yPercent: 110,
            opacity: 0,
            duration: 1.1,
            ease: "expo.out",
            stagger: 0.018,
          })
          .from(
            "[data-hero-fade]",
            {
              y: 20,
              opacity: 0,
              duration: 0.9,
              ease: "expo.out",
              stagger: 0.08,
            },
            "-=0.8"
          )
        gsap.to("[data-hero-content]", {
          yPercent: -12,
          opacity: 0,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom 20%",
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
      aria-labelledby="hero-title"
      className="relative flex min-h-[100svh] items-start px-4 pt-28 pb-24 sm:px-6 md:items-center md:px-10 md:pt-24 lg:px-16"
    >
      <div
        data-hero-content
        className="landing-veil relative w-full max-w-[40rem]"
      >
        <h1
          id="hero-title"
          className="font-heading text-[clamp(2.5rem,6.2vw,5.5rem)] leading-[0.98] font-semibold tracking-[-0.035em] text-balance text-foreground"
        >
          <SplitChars
            lines={[
              "Know which channels",
              "bring revenue,",
              "not just visitors.",
            ]}
            accent="revenue,"
          />
        </h1>
        <p
          data-hero-fade
          className="mt-6 max-w-[46ch] text-lg leading-relaxed text-pretty text-muted-foreground md:text-xl"
        >
          Terra ties every visit to the revenue it brings, by channel, page,
          campaign and country. Put your budget into what sells, not into what
          only sends traffic.
        </p>
        <div data-hero-fade className="mt-9 flex flex-wrap items-center gap-3">
          <Link
            href="/auth/signup"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-12 rounded-full px-6 text-[0.95rem]"
            )}
          >
            Create a free account
            <ArrowRight data-icon="inline-end" />
          </Link>
          <a
            href="#demo"
            onClick={(event) => {
              event.preventDefault()
              scrollToId("demo", lenis)
            }}
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "h-12 rounded-full bg-background/70 px-6 text-[0.95rem]"
            )}
          >
            See the live demo
            <ArrowDown data-icon="inline-end" />
          </a>
        </div>
        <p data-hero-fade className="mt-5 text-sm text-muted-foreground">
          Free to start. One script, about a minute to set up.
        </p>
      </div>
    </section>
  )
}
