import Link from "next/link"

import { Section } from "./section"

const groups = [
  {
    title: "Any website",
    body: "A single script tag works on a static page, a CMS or a storefront. Subdomains report to the same site.",
    href: "#setup",
    link: "See the script",
  },
  {
    title: "Your own code",
    body: "A public REST API with scoped keys and an OpenAPI document, plus a typed client for TypeScript.",
    href: "/docs/api",
    link: "Read the API reference",
  },
  {
    title: "Your own servers",
    body: "Terra is open source. Run the dashboard and the collector with Docker and keep the data in your Postgres.",
    href: "/llms.txt",
    link: "Read llms.txt",
  },
]

export const Stack = () => (
  <Section
    id="stack"
    title="Fits the stack you already run."
    lead="Start with the script. Reach for the API or host it yourself when you need to."
  >
    <ul className="grid gap-8 md:grid-cols-3">
      {groups.map((group) => (
        <li key={group.title}>
          <h3 className="font-heading text-xl font-semibold">{group.title}</h3>
          <p className="mt-2 leading-relaxed text-muted-foreground">
            {group.body}
          </p>
          <Link
            href={group.href}
            className="mt-3 inline-flex min-h-11 items-center text-sm whitespace-nowrap text-primary underline-offset-4 hover:underline"
          >
            {group.link}
          </Link>
        </li>
      ))}
    </ul>
  </Section>
)
