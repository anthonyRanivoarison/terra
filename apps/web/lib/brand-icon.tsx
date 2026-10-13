import Apple from "@thesvg/react/apple"
import Arc from "@thesvg/react/arc"
import Github from "@thesvg/react/github"
import Medium from "@thesvg/react/medium"
import Openai from "@thesvg/react/openai"
import Threads from "@thesvg/react/threads"
import Vercel from "@thesvg/react/vercel"
import X from "@thesvg/react/x"
import type { ComponentType, SVGProps } from "react"

type Icon = ComponentType<SVGProps<SVGSVGElement>>
type VariantIcon = ComponentType<SVGProps<SVGSVGElement> & { variant?: string }>

const MONO = new Map<unknown, string>([
  [Openai, "light"],
  [Apple, "mono"],
  [Github, "mono"],
  [Vercel, "mono"],
  [Threads, "mono"],
  [X, "mono"],
  [Medium, "mono"],
  [Arc, "mono"],
])

export const renderBrandIcon = (Icon: Icon, className: string) => {
  const Tag = Icon as VariantIcon
  return (
    <Tag className={className} aria-hidden="true" variant={MONO.get(Icon)} />
  )
}
