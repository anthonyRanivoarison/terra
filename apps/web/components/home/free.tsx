import Link from "next/link"

import { siteConfig } from "@/lib/seo"

import { Section } from "./section"

const facts = [
  {
    title: "No plans, no card",
    body: "Every feature is available to everyone: revenue attribution, AI crawlers, the API and realtime.",
  },
  {
    title: "Host it yourself",
    body: "Run the dashboard, the collector and Postgres with the Docker files in the repository.",
  },
  {
    title: "Open source",
    body: "The app is AGPL-3.0. The tracker, the SDK and the crawler package are MIT, so they fit any codebase.",
  },
]

export const Free = () => (
  <Section
    id="free"
    title="Free for everyone, for good."
    lead="Terra is a community tool. Use it, fork it and shape it to your own needs."
  >
    <ul className="grid gap-8 md:grid-cols-3">
      {facts.map((fact) => (
        <li key={fact.title}>
          <h3 className="font-heading text-xl font-semibold">{fact.title}</h3>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            {fact.body}
          </p>
        </li>
      ))}
    </ul>
    <Link
      href={siteConfig.github}
      className="mt-8 inline-flex min-h-11 items-center text-sm text-primary underline-offset-4 hover:underline"
    >
      Read the code on GitHub
    </Link>
  </Section>
)
