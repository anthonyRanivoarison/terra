import type { Metadata } from "next"
import { headers } from "next/headers"

import { Home as Landing } from "@/components/home/home"
import { auth } from "@/lib/auth"
import { metadataFor, siteConfig } from "@/lib/seo"
import "@/components/home/home.css"

export const metadata: Metadata = {
  ...metadataFor({
    title: `Terra · ${siteConfig.tagline}`,
    description:
      "Terra shows which channels, pages and countries bring revenue, not just visitors. Privacy-friendly analytics with AI crawler tracking. One script, free to start.",
    path: "/",
  }),
  title: { absolute: `Terra · ${siteConfig.tagline}` },
}

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() })

  return <Landing signedIn={Boolean(session)} />
}
