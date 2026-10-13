# @terra-analytics/sdk

Typed client for the Terra analytics API. Zero runtime
dependencies, works in Node 18+, Bun, Deno, Cloudflare Workers and browsers.

```bash
bun add @terra-analytics/sdk
# or: npm install @terra-analytics/sdk
```

## Setup

Create a key in **Settings → API keys** and pick its scopes:

| Scope            | Grants                                              |
| ---------------- | --------------------------------------------------- |
| `read:stats`     | `sites`, `stats`, `timeseries`, `breakdown`, visits |
| `write:events`   | `track` (server-side goals)                         |
| `write:payments` | `payment` (purchases and refunds)                   |

```ts
import { Terra } from "@terra-analytics/sdk"

const terra = new Terra({
  apiKey: process.env.TERRA_API_KEY!,
  baseUrl: "https://analytics.example.com",
})
```

`baseUrl` is the URL of your Terra instance. In a browser it defaults to the
current origin. Keep keys on the server: anyone with a key can read your stats.

## Reading analytics

Sites are addressed by their public id (`ws_…`).

```ts
const [site] = await terra.sites()

const { current, previous } = await terra.stats(site.id, {
  range: "30d",
  compare: "prev",
  filters: { country: "FR" },
})
console.log(current.visitors, current.revenueCents, previous?.visitors)

const series = await terra.timeseries(site.id, {
  from: "2026-01-01",
  to: new Date(),
})

const pages = await terra.breakdown(site.id, "pages", { range: "7d" })
console.log(pages.page, pages.entry)

const goals = await terra.breakdown(site.id, "events")
const live = await terra.realtime(site.id)

const { rows, hasMore } = await terra.visits(site.id, { page: 1 })
const detail = await terra.visit(site.id, rows[0]!.id)
```

Ranges: `today`, `24h`, `7d` (default), `30d`, `90d`, `12m`, or `from` + `to`
(dates, inclusive, in the site's timezone). Filters: `page`, `hostname`,
`entry`, `exit`, `referrer`, `channel`, `utm_source`, `utm_medium`,
`utm_campaign`, `country`, `region`, `city`, `device`, `browser`, `os`,
`language`, `screen`, `event`.

## Sending goals

```ts
await terra.track(site.id, {
  name: "signup",
  visitorId: req.cookies._terra_v,
  props: { plan: "pro" },
  url: "https://example.com/pricing",
})
```

Read the visitor id from the `_terra_v` cookie, or call `terra.visitorId()` in
the browser and pass it to your server. Names match `^[a-z0-9_:-]{1,64}$`, with at most 10 props. The goal joins the
visitor's latest visit when it was active in the last 30 minutes. The SDK sends
a random `id` with each goal, so retries never double count; pass your own `id`
to deduplicate across processes.

## Recording revenue

```ts
await terra.payment(site.id, {
  id: session.payment_intent,
  provider: "stripe",
  visitorId: session.metadata.terra_visitor_id,
  amount: session.amount_total,
  currency: session.currency,
})

await terra.payment(site.id, { ...payment, refunded: true })
```

`amount` is in minor units (cents). Payments are idempotent on
`provider` + `id`: sending the same payment twice returns the first record with
`duplicate: true`. Refunds are stored as negative revenue.

## Errors and retries

Every failure throws a `TerraError` with `status`, `code` and `message`.

```ts
import { TerraError } from "@terra-analytics/sdk"

try {
  await terra.stats("ws_unknown")
} catch (error) {
  if (error instanceof TerraError && error.code === "not_found") {
    // …
  }
}
```

Codes: `unauthorized`, `forbidden`, `not_found`, `invalid_request`,
`invalid_query`, `rate_limited`, `internal_error`, plus `network_error` and
`timeout` (status `0`) from the client.

Network errors, timeouts, `408`, `429` and `5xx` are retried up to twice with
exponential backoff, honouring `Retry-After`. Each key may send 600 requests per
minute.

## Options

| Option       | Default        | Description                 |
| ------------ | -------------- | --------------------------- |
| `apiKey`     | required       | `tk_live_…` key             |
| `baseUrl`    | current origin | URL of your Terra instance  |
| `fetch`      | global `fetch` | Custom fetch implementation |
| `maxRetries` | `2`            | `0` to `2`                  |
| `timeoutMs`  | `30000`        | Per-attempt timeout         |

Every method also accepts `{ signal }` as its last argument to cancel a
request.

## Development

```bash
bun test
bun run build   # dist/index.js (ESM), dist/index.cjs (CJS), dist/*.d.ts
```
