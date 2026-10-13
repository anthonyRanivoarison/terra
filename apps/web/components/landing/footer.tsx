import Link from "next/link"

import { Logo } from "@/components/brand/logo"
import { siteConfig } from "@/lib/seo"

const links = [
  { href: "/brand", label: "Brand" },
  { href: "/docs/api", label: "API" },
  { href: "/llms.txt", label: "llms.txt" },
  { href: "/auth/signin", label: "Sign in" },
  { href: siteConfig.github, label: "GitHub" },
]

export const Footer = () => (
  <footer className="border-t border-foreground/10 px-4 py-12 sm:px-6 md:px-10 lg:px-16">
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-col gap-2">
        <Logo className="text-lg" />
        <p className="text-sm text-muted-foreground">{siteConfig.tagline}</p>
      </div>
      <nav aria-label="Footer">
        <ul className="flex flex-wrap gap-x-2 gap-y-1">
          {links.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="inline-flex min-h-11 items-center rounded-md px-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  </footer>
)
