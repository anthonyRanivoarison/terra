import { Snippet } from "@/components/landing/snippet"

import { Section } from "./section"

const steps = [
  {
    title: "Add your site",
    body: "Enter your domain. Terra creates the site and its website ID.",
  },
  {
    title: "Paste one script",
    body: "One tag in the head of every page. Page views, outbound clicks and Web Vitals follow, subdomains included.",
  },
  {
    title: "Connect your payments",
    body: "Link Paddle and each purchase is matched to the visit that started it. Past orders are backfilled.",
  },
]

export const Steps = () => (
  <Section
    id="setup"
    title="One tag, about a minute."
    lead="No tag manager and no event plan to write first. Your first visits reach the dashboard within seconds."
  >
    <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start">
      <Snippet />
      <ol className="grid gap-6">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3"
          >
            <span
              aria-hidden
              className="font-mono text-sm leading-7 text-primary tabular-nums"
            >
              {index + 1}
            </span>
            <div>
              <h3 className="font-heading text-lg font-semibold">
                {step.title}
              </h3>
              <p className="mt-1 leading-relaxed text-muted-foreground">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  </Section>
)
