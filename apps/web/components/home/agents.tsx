import { DEMO_CRAWLERS, formatCount } from "@/components/landing/demo-data"

import { CrawlLog } from "./crawl-log"
import { Section } from "./section"

const adapters = ["Next.js", "Hono", "Express", "Cloudflare Workers"]

export const Agents = () => (
  <Section
    id="ai"
    title="Some of your readers are not people."
    lead="Crawlers from ChatGPT, Claude, Perplexity and Google never run JavaScript, so a browser script cannot see them. Terra reports them from your server and checks each one against the IP ranges its operator publishes."
  >
    <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start">
      <CrawlLog />
      <div>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
          {DEMO_CRAWLERS.map((crawler) => (
            <div key={crawler.name}>
              <dt className="font-mono text-xs text-muted-foreground">
                {crawler.name}
              </dt>
              <dd className="mt-1 font-mono text-2xl tabular-nums">
                {formatCount(crawler.reads)}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 leading-relaxed text-muted-foreground">
          One middleware on your server. The report is sent in the background
          and never delays your response.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {adapters.map((adapter) => (
            <li
              key={adapter}
              className="home-well rounded-full px-3 py-1.5 font-mono text-xs whitespace-nowrap"
            >
              {adapter}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </Section>
)
