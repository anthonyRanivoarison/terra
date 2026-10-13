import type { ReactNode } from "react"
import { cn } from "@workspace/ui/lib/utils"

type SamplePreviewType = {
  sample: ReactNode
  children: ReactNode
  className?: string
}

export const SamplePreview = ({
  sample,
  children,
  className,
}: SamplePreviewType) => (
  <div className={cn("relative isolate", className)}>
    <div
      aria-hidden="true"
      inert
      className="pointer-events-none opacity-40 blur-[2px] select-none"
    >
      {sample}
    </div>
    <div className="absolute inset-0 z-10 flex items-center justify-center p-4">
      {children}
    </div>
  </div>
)
