import Link from "next/link"
import { PlusIcon } from "@phosphor-icons/react/ssr"

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
    a: "Yes. Terra ships with Docker files for the dashboard, the collector and Postgres.",
  },
  {
    q: "Is there an API?",
    a: "Yes. A public REST API with scoped keys covers stats, breakdowns, time series, visits and events, with an OpenAPI document and a typed TypeScript client.",
  },
]

export const Faq = () => (
  <section
    id="faq"
    aria-labelledby="faq-title"
    className="scroll-mt-20 px-5 pb-32 md:px-12"
  >
    <div className="marketing-panel mx-auto grid w-full max-w-6xl gap-12 rounded-[1.75rem] p-6 md:grid-cols-[1fr_1.5fr] md:p-10">
      <div className="md:sticky md:top-28 md:self-start">
        <h2
          id="faq-title"
          className="max-w-[12ch] font-heading text-[clamp(2.2rem,4.5vw,3.5rem)] leading-[1.02] font-semibold tracking-[-0.04em] text-balance"
        >
          Before you paste the script.
        </h2>
        <p className="mt-4 max-w-[34ch] leading-relaxed text-muted-foreground">
          Short answers here. The{" "}
          <Link
            href="/docs/api"
            className="text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground"
          >
            API reference
          </Link>{" "}
          has the long ones.
        </p>
      </div>
      <div className="border-t">
        {questions.map((item) => (
          <details key={item.q} className="group border-b">
            <summary className="flex min-h-16 cursor-pointer list-none items-center gap-5 py-4 [&::-webkit-details-marker]:hidden">
              <span className="flex-1 text-[1.05rem] font-medium">
                {item.q}
              </span>
              <PlusIcon
                aria-hidden
                className="size-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-open:rotate-45"
              />
            </summary>
            <p className="max-w-[60ch] pb-6 leading-relaxed text-pretty text-muted-foreground">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </div>
  </section>
)
