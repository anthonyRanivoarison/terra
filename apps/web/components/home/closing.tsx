import Link from "next/link"
import { ArrowRight } from "lucide-react"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

type ClosingType = {
  signedIn: boolean
}

export const Closing = ({ signedIn }: ClosingType) => (
  <section
    aria-labelledby="closing-title"
    className="px-4 pb-24 sm:px-6 md:px-10 md:pb-32"
  >
    <div className="mx-auto w-full max-w-6xl rounded-3xl border border-border bg-card p-8 text-center md:p-16">
      <h2
        id="closing-title"
        className="mx-auto max-w-[18ch] font-heading text-[clamp(2rem,4.6vw,3.75rem)] leading-[1.03] font-semibold tracking-[-0.035em] text-balance"
      >
        Put your budget where the revenue is.
      </h2>
      <p className="mx-auto mt-5 max-w-[48ch] text-lg leading-relaxed text-pretty text-muted-foreground">
        Add your site and see visits by channel today. Revenue by channel
        follows with your first order.
      </p>
      <Link
        href={signedIn ? "/sites/new" : "/auth/signup"}
        className={cn(
          buttonVariants({ size: "lg" }),
          "mt-8 h-12 px-6 text-[0.95rem] whitespace-nowrap"
        )}
      >
        Add your website
        <ArrowRight data-icon="inline-end" />
      </Link>
    </div>
  </section>
)
