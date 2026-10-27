import { siteConfig } from "@/lib/seo"

type InstallPromptType = {
  domain: string
  publicId: string
  ingestUrl: string
  botToken: string
}

const docs = () => `${siteConfig.url}/llms-full.txt`

export const installPrompt = ({
  domain,
  publicId,
  ingestUrl,
  botToken,
}: InstallPromptType) => `Install Terra analytics on ${domain} in this codebase. Terra docs for agents: ${docs()}

1. Tracking script
Add this tag to the <head> of every page, once, in the shared layout or document template (for example app/layout.tsx in Next.js, index.html in Vite, the base template elsewhere). Use the framework's own script component if it has one, but keep every attribute.

<script
  defer
  data-website-id="${publicId}"
  data-domain="${domain}"
  src="${ingestUrl}/js/script.js">
</script>

Page views, client-side navigations, outbound clicks and Web Vitals are tracked automatically. Do not add a page view call.

2. Goals
Find the conversions that matter (sign up, start trial, checkout, contact, newsletter) and name them with a data-goal attribute. Every data-goal-* attribute becomes a property:

<button data-goal="signup" data-goal-plan="pro">Sign up</button>

When the conversion happens in code (after a successful form submit, for example), call:

window.terra?.goal("signup", { plan: "pro" })

Use short snake_case goal names and do not track personal data such as emails or names.

3. AI crawler tracking (only if the site has a server: Next.js, Hono, Express or Cloudflare Workers)
Install @terra-analytics/crawl with the project's package manager and add these variables to the local env file and to the deployment environment. TERRA_BOT_TOKEN is a secret: never commit it or expose it to the browser.

TERRA_WEBSITE_ID=${publicId}
TERRA_BOT_TOKEN=${botToken}
TERRA_INGEST_URL=${ingestUrl}

Then wrap the request handler with the matching adapter from the docs (@terra-analytics/crawl/next, /hono, /express or /worker). In Next.js 16 it goes in proxy.ts; compose it with any existing proxy or middleware instead of replacing it.

4. Check
Run the project's lint, typecheck and build. Then tell me which files changed, which goals you added, and remind me to open ${domain} once deployed so Terra receives the first event.`

export const revenuePrompt = ({ domain }: { domain: string }) =>
  `Link Paddle payments on ${domain} to Terra analytics visitors in this codebase, so Terra can credit each sale to the channel, campaign and page that brought the buyer. Terra docs for agents: ${docs()}

The Terra tracking script is already on the site and exposes window.terra.visitorId() in the browser.

1. Find every place a Paddle checkout starts: Paddle.Checkout.open calls, and server code that creates transactions (paddle.transactions.create or the Paddle API).

2. Paddle.js overlay or inline checkout: add the visitor id to customData, merged with any customData already there.

Paddle.Checkout.open({
  items: [{ priceId: "pri_…", quantity: 1 }],
  customData: { terra_visitor_id: window.terra?.visitorId() },
})

3. Server-created transactions: send the visitor id from the browser with the checkout request, then attach it on the server.

customData: { terra_visitor_id: body.visitorId }

4. Keep checkouts working when the script is blocked: window.terra may be undefined, so never throw or block the purchase when the id is missing. Leave existing datafast_visitor_id values in place, Terra reads them too.

5. Run the project's lint, typecheck and build, then list the files you changed. Do not touch Paddle API keys: I connect Paddle in the Terra dashboard myself.`
