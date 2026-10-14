import type { ReactNode } from "react"
import { cn } from "@workspace/ui/lib/utils"

type PageShellType = { children: ReactNode; className?: string }

export const PageShell = ({ children, className }: PageShellType) => (
  <div
    className={cn(
      "mx-auto flex w-full max-w-[1200px] flex-col gap-3 p-3 md:p-4",
      className
    )}
  >
    {children}
  </div>
)
