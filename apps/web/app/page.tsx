import type { Metadata } from "next"
import { headers } from "next/headers"

import { landingCta } from "@/components/marketing/cta"
import { Landing } from "@/components/marketing/landing"
import { auth, signUpOpen } from "@/lib/auth"
import { demoPath } from "@/lib/demo"
import { metadataFor, siteConfig } from "@/lib/seo"

export const metadata: Metadata = {
  ...metadataFor({
    title: `Terra · ${siteConfig.tagline}`,
    description:
      "Terra shows which channels, pages and countries bring revenue, not just visitors. Free, open source and privacy-friendly analytics with AI crawler tracking.",
    path: "/",
  }),
  title: { absolute: `Terra · ${siteConfig.tagline}` },
}

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() })

  return (
    <Landing
      cta={landingCta(Boolean(session), signUpOpen, siteConfig.github)}
      demo={demoPath !== null}
    />
  )
}
