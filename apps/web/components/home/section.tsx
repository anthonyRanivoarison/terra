import type { ReactNode } from "react"

import { cn } from "@workspace/ui/lib/utils"

type SectionType = {
  id: string
  title: string
  lead: string
  children: ReactNode
  className?: string
}

export const Section = ({
  id,
  title,
  lead,
  children,
  className,
}: SectionType) => (
  <section
    id={id}
    aria-labelledby={`${id}-title`}
    className={cn(
      "scroll-mt-20 px-4 py-20 sm:px-6 md:px-10 md:py-28",
      className
    )}
  >
    <div className="mx-auto w-full max-w-6xl">
      <h2
        id={`${id}-title`}
        className="max-w-[20ch] font-heading text-[clamp(2rem,4vw,3.25rem)] leading-[1.05] font-semibold tracking-[-0.03em] text-balance"
      >
        {title}
      </h2>
      <p className="mt-4 max-w-[56ch] text-base leading-relaxed text-pretty text-muted-foreground md:text-lg">
        {lead}
      </p>
      <div className="mt-12">{children}</div>
    </div>
  </section>
)
