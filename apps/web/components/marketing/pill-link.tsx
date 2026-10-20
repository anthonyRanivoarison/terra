import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

type PillLinkType = {
  href: string
  children: ReactNode
  variant?: "primary" | "ghost"
  className?: string
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
}

export const PillLink = ({
  href,
  children,
  variant = "primary",
  className,
  onClick,
}: PillLinkType) =>
  variant === "primary" ? (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group inline-flex h-12 shrink-0 items-center gap-3 rounded-full bg-primary pr-2 pl-6 text-base font-medium whitespace-nowrap text-primary-foreground shadow-[0_10px_30px_-12px] shadow-primary/70 transition-transform duration-300 ease-out outline-none focus-visible:ring-3 focus-visible:ring-ring/60 active:scale-[0.98]",
        className
      )}
    >
      {children}
      <span className="grid size-8 place-items-center rounded-full bg-primary-foreground/20 transition-transform duration-300 group-hover:translate-x-0.5">
        <ArrowRight className="size-4" aria-hidden />
      </span>
    </Link>
  ) : (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "inline-flex h-12 shrink-0 items-center rounded-full px-5 text-base font-medium whitespace-nowrap text-foreground transition-colors outline-none hover:bg-foreground/10 focus-visible:ring-3 focus-visible:ring-ring/60 active:scale-[0.98]",
        className
      )}
    >
      {children}
    </Link>
  )
