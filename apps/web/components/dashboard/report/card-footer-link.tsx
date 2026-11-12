"use client"

import Link from "next/link"
import { ArrowRightIcon } from "@phosphor-icons/react/ssr"
import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { useSiteNav } from "@/components/shell/use-site-nav"

type CardFooterLinkType = { label: string; path: string }

export const CardFooterLink = ({ label, path }: CardFooterLinkType) => {
  const { root, keep } = useSiteNav()
  return (
    <Link
      href={keep(`${root}${path}`)}
      className={cn(
        buttonVariants({ variant: "ghost", size: "xs" }),
        "tracking-wide text-muted-foreground uppercase"
      )}
    >
      {label}
      <ArrowRightIcon data-icon="inline-end" aria-hidden />
    </Link>
  )
}
