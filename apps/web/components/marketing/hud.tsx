"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"
import { useLenis } from "lenis/react"
import { cn } from "@workspace/ui/lib/utils"
import { Logo } from "@/components/brand/logo"
import type { Cta } from "./cta"
import { chapters } from "./data"
import { readouts, tally } from "./scene/rig"
import { scrollToId } from "./scroll-to"

gsap.registerPlugin(ScrollTrigger, useGSAP)

type HudType = { cta: Cta }

export const Hud = ({ cta }: HudType) => {
  const lenis = useLenis()
  const [active, setActive] = useState<string | null>(null)
  const visits = useRef<HTMLSpanElement>(null)
  const ai = useRef<HTMLSpanElement>(null)
  const bar = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    readouts.visits = visits.current
    readouts.ai = ai.current
    return () => {
      readouts.visits = null
      readouts.ai = null
    }
  }, [])

  useGSAP(() => {
    const triggers = chapters.map((chapter) =>
      ScrollTrigger.create({
        trigger: `#${chapter.id}`,
        start: "top center",
        end: "bottom center",
        onToggle: (self) => self.isActive && setActive(chapter.id),
        onLeaveBack: () => chapter.id === chapters[0]!.id && setActive(null),
      })
    )
    const progress = ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        if (bar.current)
          bar.current.style.transform = `scaleX(${self.progress})`
      },
    })
    return () => {
      triggers.forEach((t) => t.kill())
      progress.kill()
    }
  })

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-40 flex items-start justify-between px-5 pt-5 md:px-8 md:pt-7">
        <a
          href="#top"
          onClick={(event) => {
            event.preventDefault()
            scrollToId("top", lenis)
          }}
          aria-label="Terra, back to top"
          className="pointer-events-auto flex min-h-11 items-center rounded-full pr-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Logo className="text-lg" markClassName="text-primary" />
        </a>
        <div className="pointer-events-auto flex items-start gap-8">
          <nav aria-label="Chapters" className="hidden md:block">
            <ol className="flex flex-col items-end gap-1 text-sm">
              {chapters.map((chapter) => (
                <li key={chapter.id}>
                  <button
                    type="button"
                    onClick={() => scrollToId(chapter.id, lenis)}
                    aria-current={active === chapter.id ? "step" : undefined}
                    className={cn(
                      "flex items-center gap-3 py-0.5 transition-colors duration-500 outline-none focus-visible:text-foreground",
                      active === chapter.id
                        ? "text-foreground"
                        : "text-foreground/45 hover:text-foreground/80"
                    )}
                  >
                    {chapter.name}
                    <span
                      aria-hidden
                      className={cn(
                        "h-px w-8 origin-right transition-[scale,background-color] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
                        active === chapter.id
                          ? "bg-primary"
                          : "scale-x-25 bg-foreground/30"
                      )}
                    />
                  </button>
                </li>
              ))}
            </ol>
          </nav>
          <Link
            href={cta.href}
            className="flex h-11 items-center rounded-full border border-foreground/20 bg-background/40 px-5 text-sm font-medium whitespace-nowrap backdrop-blur-md transition-colors hover:border-foreground/50 active:scale-[0.97]"
          >
            {cta.short}
          </Link>
        </div>
      </header>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex items-end justify-between px-5 pb-5 text-xs text-foreground/60 md:px-8 md:pb-7"
      >
        <div className="flex gap-8">
          <div className="flex flex-col gap-0.5">
            <span>Visits tracked, demo</span>
            <span className="marketing-accent text-2xl text-foreground tabular-nums">
              <span ref={visits}>{tally.visits.toLocaleString("en-US")}</span>
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span>From AI assistants</span>
            <span className="marketing-accent text-2xl text-foreground tabular-nums">
              <span ref={ai}>{tally.ai.toLocaleString("en-US")}</span>
            </span>
          </div>
        </div>
        <span
          aria-hidden
          className="hidden h-px w-44 origin-left scale-x-0 bg-primary md:block"
          ref={bar}
        />
      </div>
    </>
  )
}
