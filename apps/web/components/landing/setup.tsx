import type { ReactNode } from "react"

import { Snippet } from "./snippet"

const steps: { title: string; body: string; extra?: ReactNode }[] = [
  {
    title: "Add your site",
    body: "Enter your domain. Terra creates the site and its website ID.",
  },
  {
    title: "Paste one script",
    body: "Put this tag in the head of every page. Page views, navigations, outbound clicks and Web Vitals are tracked from there.",
    extra: <Snippet />,
  },
  {
    title: "Subdomains follow on their own",
    body: "blog, shop and app subdomains report to the same site. Nothing else to configure.",
  },
]

export const Setup = () => (
  <section
    id="setup"
    aria-labelledby="setup-title"
    className="landing-setup relative px-4 pt-32 pb-28 sm:px-6 md:px-10 md:pt-44 md:pb-36 lg:px-16"
  >
    <div className="mx-auto grid w-full max-w-6xl gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
      <div className="lg:sticky lg:top-32 lg:self-start">
        <h2
          id="setup-title"
          className="font-heading text-[clamp(2.25rem,4.6vw,3.75rem)] leading-[1.02] font-semibold tracking-[-0.03em] text-balance"
        >
          Live in about a minute.
        </h2>
        <p className="mt-5 max-w-[44ch] text-base leading-relaxed text-pretty text-muted-foreground md:text-lg">
          Three steps, one tag, no tag manager. Your first visits reach the
          dashboard within seconds.
        </p>
      </div>
      <ol className="flex flex-col">
        {steps.map((step, index) => (
          <li
            key={step.title}
            className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 border-t border-foreground/10 py-8 first:border-t-0 first:pt-0 md:grid-cols-[3rem_minmax(0,1fr)]"
          >
            <span
              aria-hidden
              className="flex size-10 items-center justify-center rounded-full border border-primary/30 font-mono text-sm text-primary md:size-12"
            >
              {index + 1}
            </span>
            <div className="min-w-0">
              <h3 className="font-heading text-xl font-semibold tracking-[-0.015em] md:text-2xl">
                {step.title}
              </h3>
              <p className="mt-2 max-w-[60ch] leading-relaxed text-muted-foreground">
                {step.body}
              </p>
              {step.extra}
            </div>
          </li>
        ))}
      </ol>
    </div>
  </section>
)
