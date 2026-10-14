import Link from "next/link"
import { ArrowDown, ArrowRight } from "lucide-react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { Contours } from "./contours"

type HeroType = {
  signedIn: boolean
}

export const Hero = ({ signedIn }: HeroType) => (
  <section
    aria-labelledby="hero-title"
    className="home-ground relative flex min-h-[calc(100svh-4rem)] items-end overflow-hidden"
  >
    <Contours />
    <div className="relative w-full px-4 pt-40 pb-14 sm:px-6 md:px-10 md:pb-20">
      <div className="mx-auto w-full max-w-6xl">
        <h1
          id="hero-title"
          className="max-w-[13ch] font-heading text-[clamp(2.75rem,7.4vw,6.5rem)] leading-[0.96] font-semibold tracking-[-0.04em] text-balance"
        >
          Your traffic has a shape. Find the{" "}
          <span className="home-revenue">peaks</span>.
        </h1>
        <div className="mt-8 grid gap-8 md:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] md:items-end">
          <p className="max-w-[48ch] text-lg leading-relaxed text-pretty text-muted-foreground">
            Terra ties every visit to the money it brings, by channel, page,
            campaign and country. The amber summits on this map are where the
            revenue is.
          </p>
          <div className="flex flex-col gap-4 md:items-end">
            <div className="flex flex-wrap gap-3">
              <Link
                href={signedIn ? "/sites/new" : "/auth/signup"}
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-12 px-6 text-[0.95rem] whitespace-nowrap"
                )}
              >
                Add your website
                <ArrowRight data-icon="inline-end" />
              </Link>
              <a
                href="#rankings"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "h-12 px-6 text-[0.95rem] whitespace-nowrap"
                )}
              >
                Try it on demo data
                <ArrowDown data-icon="inline-end" />
              </a>
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              Free to start. Move your cursor to raise a hill.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
)
