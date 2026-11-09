import Link from "next/link"
import { siteConfig } from "@/lib/seo"
import type { Cta } from "./cta"
import { PillLink } from "./pill-link"

const links = [
  { href: "/docs/api", label: "API" },
  { href: "/brand", label: "Brand" },
  { href: "/llms.txt", label: "llms.txt" },
  { href: siteConfig.github, label: "GitHub" },
]

type ClosingType = { cta: Cta }

export const Closing = ({ cta }: ClosingType) => (
  <footer className="relative border-t bg-(--marketing-space) px-5 pt-24 pb-32 md:px-12">
    <div className="mx-auto w-full max-w-6xl">
      <p className="max-w-[14ch] font-heading text-[clamp(2.5rem,6.4vw,5.5rem)] leading-[0.95] font-semibold tracking-[-0.04em] text-balance">
        Nothing reaches you{" "}
        <span className="marketing-accent text-ring">unseen.</span>
      </p>
      <div className="mt-10">
        <PillLink href={cta.href}>{cta.label}</PillLink>
      </div>
      <div className="mt-24 flex flex-col gap-6 border-t pt-6 text-sm text-muted-foreground md:flex-row md:items-start md:justify-between">
        <div className="flex max-w-md flex-col gap-2 leading-relaxed">
          <p>
            Terra is free and open source: the app under AGPL-3.0, the tracker,
            SDK and crawler package under MIT. Figures on this page are demo
            data.
          </p>
          <p>
            Earth textures from the three.js examples, derived from NASA Blue
            Marble imagery.
          </p>
        </div>
        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-1">
            {links.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="inline-flex min-h-11 items-center px-2 whitespace-nowrap transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  </footer>
)
