import { cn } from "@workspace/ui/lib/utils"
import { ORBIT, ORBIT_SMALL, WORDMARK } from "./logo-paths"

type Artwork = { viewBox: string; paths: string[] }

type ShapeType = {
  art: Artwork
  className?: string
  title?: string
}

const Shape = ({ art, className, title }: ShapeType) => (
  <svg
    viewBox={art.viewBox}
    fill="currentColor"
    role={title ? "img" : undefined}
    aria-hidden={title ? undefined : true}
    className={cn("shrink-0", className)}
  >
    {title ? <title>{title}</title> : null}
    {art.paths.map((d) => (
      <path key={d} d={d} />
    ))}
  </svg>
)

type LogoMarkType = {
  className?: string
  title?: string
  small?: boolean
}

export const LogoMark = ({ className, title, small = false }: LogoMarkType) => (
  <Shape
    art={small ? ORBIT_SMALL : ORBIT}
    title={title}
    className={cn("size-6 text-logo", className)}
  />
)

type LogoType = {
  className?: string
  markClassName?: string
}

export const Logo = ({ className, markClassName }: LogoType) => (
  <span
    className={cn("inline-flex items-center gap-[0.35em] text-xl", className)}
  >
    <LogoMark className={cn("h-[1.25em] w-auto", markClassName)} />
    <Shape art={WORDMARK} className="h-[0.95em] w-auto" />
    <span className="sr-only">Terra</span>
  </span>
)
