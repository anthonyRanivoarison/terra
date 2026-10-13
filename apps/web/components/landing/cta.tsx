import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

export const Cta = () => (
  <section
    aria-labelledby="cta-title"
    className="landing-cta relative overflow-hidden px-4 py-24 text-white sm:px-6 md:px-10 md:py-32 lg:px-16"
  >
    <div className="mx-auto w-full max-w-6xl">
      <h2
        id="cta-title"
        className="max-w-[16ch] font-heading text-[clamp(2.5rem,5.6vw,4.75rem)] leading-[1] font-semibold tracking-[-0.035em] text-balance"
      >
        Put your budget where the revenue is.
      </h2>
      <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-pretty text-white/80">
        Create a free account, add your site and see visits by channel today.
        Connect your payments and revenue by channel follows with the first
        order.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/auth/signup"
          className={cn(
            buttonVariants({ size: "lg" }),
            "h-12 rounded-full bg-white px-6 text-[0.95rem] text-[#0b1b3f] hover:bg-white/90 focus-visible:ring-white/60"
          )}
        >
          Create a free account
          <ArrowRight data-icon="inline-end" />
        </Link>
        <Link
          href="/docs/api"
          className={cn(
            buttonVariants({ size: "lg", variant: "outline" }),
            "h-12 rounded-full border-white/30 bg-transparent px-6 text-[0.95rem] text-white hover:bg-white/10 hover:text-white focus-visible:ring-white/60"
          )}
        >
          Read the API docs
        </Link>
      </div>
    </div>
  </section>
)
