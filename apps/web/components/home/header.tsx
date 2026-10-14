import Link from "next/link"

import { buttonVariants } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { Logo } from "@/components/brand/logo"

type HeaderType = {
  signedIn: boolean
}

const links = [
  { href: "#rankings", label: "Demo" },
  { href: "#ai", label: "AI crawlers" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
]

export const Header = ({ signedIn }: HeaderType) => (
  <header className="sticky top-0 z-30 border-b border-border bg-background">
    <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6 md:px-10">
      <Link
        href="/"
        aria-label="Terra home"
        className="flex min-h-11 items-center rounded-md"
      >
        <Logo />
      </Link>
      <nav aria-label="Sections" className="hidden md:block">
        <ul className="flex items-center gap-1">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="inline-flex min-h-11 items-center rounded-md px-3 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <nav aria-label="Account" className="flex items-center gap-1">
        {signedIn ? (
          <Link
            href="/sites"
            className={cn(buttonVariants({ size: "lg" }), "whitespace-nowrap")}
          >
            Open dashboard
          </Link>
        ) : (
          <>
            <Link
              href="/auth/signin"
              className={cn(
                buttonVariants({ size: "lg", variant: "ghost" }),
                "whitespace-nowrap"
              )}
            >
              Sign in
            </Link>
            <Link
              href="/auth/signup"
              className={cn(
                buttonVariants({ size: "lg" }),
                "whitespace-nowrap"
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
