"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { Logo } from "@/components/brand/logo"

type SiteHeaderType = {
  signedIn: boolean
}

export const SiteHeader = ({ signedIn }: SiteHeaderType) => {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-30 border-b transition-[background-color,border-color] duration-300",
        scrolled
          ? "border-border/80 bg-background/95"
          : "border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[90rem] items-center justify-between gap-3 px-4 sm:px-6 md:h-[4.5rem] md:px-10 lg:px-16">
        <Link
          href="/"
          aria-label="Terra home"
          className="flex min-h-11 items-center rounded-md text-foreground"
        >
          <Logo />
        </Link>
        <nav aria-label="Account" className="flex items-center gap-1 sm:gap-2">
          {signedIn ? (
            <Link
              href="/sites"
              className={cn(
                buttonVariants({ size: "lg" }),
                "rounded-full px-5"
              )}
            >
              Open dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className={cn(
                  buttonVariants({ size: "lg", variant: "ghost" }),
                  "rounded-full px-3 sm:px-4"
                )}
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "rounded-full px-4 sm:px-5"
                )}
              >
                Create account
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
