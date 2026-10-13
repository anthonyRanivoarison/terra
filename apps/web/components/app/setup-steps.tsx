import Link from "next/link"
import { cn } from "@workspace/ui/lib/utils"

type SetupStepsType = {
  current: 0 | 1 | 2
  revenueHref?: string
}

const STEPS = ["Add site", "Install script", "Attribute revenue (optional)"]

export const SetupSteps = ({ current, revenueHref }: SetupStepsType) => (
  <ol className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
    {STEPS.map((label, index) => {
      const state =
        index === current ? "current" : index < current ? "done" : "todo"
      const href = index === 2 ? revenueHref : undefined
      const content = (
        <>
          <span
            aria-hidden
            className={cn(
              "size-2 rounded-full",
              state === "todo" ? "bg-muted-foreground/40" : "bg-primary"
            )}
          />
          {label}
        </>
      )
      const className = cn(
        "flex items-center gap-2",
        state === "current" && "font-medium text-primary",
        state === "done" && "text-foreground",
        state === "todo" && "text-muted-foreground"
      )
      return (
        <li key={label} className="flex items-center gap-3">
          {index > 0 && (
            <span aria-hidden className="h-px w-6 bg-border sm:w-10" />
          )}
          {href ? (
            <Link
              href={href}
              className={cn(className, "underline-offset-4 hover:underline")}
            >
              {content}
            </Link>
          ) : (
            <span
              className={className}
              aria-current={state === "current" ? "step" : undefined}
            >
              {content}
            </span>
          )}
        </li>
      )
    })}
  </ol>
)
