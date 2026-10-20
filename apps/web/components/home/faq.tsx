import { ChevronDown } from "lucide-react"

import { Section } from "./section"

const questions = [
  {
    q: "How does Terra know which visit led to a sale?",
    a: "You connect Paddle to a site. Each purchase is then matched to the visit that started it, and you can compare first touch with last touch by channel, page and country.",
  },
  {
    q: "How can it see AI crawlers if they do not run JavaScript?",
    a: "A small server-side package reports their requests from your own server. There are adapters for Next.js, Hono, Express and Cloudflare Workers, and each crawler is verified against the IP ranges its operator publishes.",
  },
  {
    q: "Do subdomains need their own site?",
    a: "No. Subdomains such as blog, shop and app report to the same site with nothing extra to configure.",
  },
  {
    q: "Is Terra really free?",
    a: "Yes. There are no plans and no paid tiers. The app is open source under AGPL-3.0, and the tracker, SDK and crawler package are MIT.",
  },
  {
    q: "Can I host Terra myself?",
    a: "Yes. Terra is open source and ships with Docker files for the dashboard, the collector and Postgres.",
  },
  {
    q: "Is there an API?",
    a: "Yes. A public REST API with scoped keys covers stats, breakdowns, time series, visits and events, with an OpenAPI document and a typed TypeScript client.",
  },
]

export const Faq = () => (
  <Section
    id="faq"
    title="Questions before you paste the script."
    lead="Short answers. The API reference has the long ones."
  >
    <div className="max-w-3xl">
      {questions.map((item) => (
        <details key={item.q} className="group border-b border-border">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 font-medium [&::-webkit-details-marker]:hidden">
            {item.q}
            <ChevronDown
              data-chevron
              aria-hidden
              className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
            />
          </summary>
          <p className="max-w-[62ch] pb-5 leading-relaxed text-muted-foreground">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  </Section>
)
