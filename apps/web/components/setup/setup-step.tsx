import type { ReactNode } from "react"

type SetupStepType = {
  index: number
  title: string
  description?: ReactNode
  id?: string
  children?: ReactNode
}

export const SetupStep = ({
  index,
  title,
  description,
  id,
  children,
}: SetupStepType) => (
  <li id={id} className="grid scroll-mt-20 grid-cols-[2rem_1fr] gap-x-2">
    <span
      aria-hidden
      className="pt-px font-mono text-xs leading-5 text-muted-foreground tabular-nums"
    >
      {String(index).padStart(2, "0")}
    </span>
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-col gap-1">
        <h4 className="text-sm leading-5 font-medium">{title}</h4>
        {description && (
          <p className="text-sm text-pretty text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  </li>
)

export const SetupSteps = ({ children }: { children: ReactNode }) => (
  <ol className="flex flex-col gap-7">{children}</ol>
)
