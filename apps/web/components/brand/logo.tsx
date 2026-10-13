import { cn } from "@workspace/ui/lib/utils"

type LogoMarkType = {
  className?: string
  title?: string
}

export const LOGO_CIRCLE = { cx: 10, cy: 14, r: 8 }
export const LOGO_LINE = "M5 16.5 9 12.5 12.5 16 20.5 8"
export const LOGO_DOT = { cx: 20.5, cy: 8, r: 1.9 }

export const LogoMark = ({ className, title }: LogoMarkType) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    role={title ? "img" : undefined}
    aria-hidden={title ? undefined : true}
    className={cn("size-6 shrink-0", className)}
  >
    {title ? <title>{title}</title> : null}
    <circle {...LOGO_CIRCLE} />
    <path d={LOGO_LINE} />
    <circle {...LOGO_DOT} fill="currentColor" stroke="none" />
  </svg>
)

type LogoType = {
  className?: string
  markClassName?: string
}

export const Logo = ({ className, markClassName }: LogoType) => (
  <span
    className={cn(
      "inline-flex items-center gap-2 font-heading text-xl font-semibold tracking-tight",
      className
    )}
  >
    <LogoMark className={cn("size-[1.15em]", markClassName)} />
    <span>Terra</span>
  </span>
)
