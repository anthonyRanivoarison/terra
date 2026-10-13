import {
  inputSchemas,
  int,
  nstr,
  num,
  obj,
  str,
  time,
} from "@/lib/api/openapi-inputs"

const list = (items: object) => ({ type: "array", items })
const row = obj({ label: str, value: num, visitors: num })
const labelled = list(obj({ label: str, visitors: num }))

const overview = obj({
  visitors: num,
  visits: num,
  views: num,
  bounceRate: { ...num, description: "Share of visits, 0 to 1." },
  visitDuration: { ...num, description: "Average visit duration in seconds." },
  revenueCents: { ...num, description: "Net revenue in minor units." },
  purchases: num,
  conversionRate: num,
})

const point = obj({
  bucket: { ...str, description: "Bucket start in the site timezone." },
  visitors: num,
  views: num,
  revenueCents: num,
})

const visit = obj({
  id: { type: "string", format: "uuid" },
  visitorId: str,
  startedAt: time,
  durationS: int,
  views: int,
  interactions: int,
  isNew: { type: "boolean" },
  hostname: nstr,
  entryPage: str,
  exitPage: str,
  channel: str,
  referrer: nstr,
  utmCampaign: nstr,
  country: nstr,
  region: nstr,
  city: nstr,
  device: nstr,
  browser: nstr,
  os: nstr,
  language: nstr,
  screen: nstr,
  revenueCents: num,
})

export const schemas = {
  ...inputSchemas,
  Site: obj({
    id: { ...str, example: "ws_8fK2mQ9xLp3vT7aB" },
    name: str,
    domain: str,
    timezone: str,
    currency: str,
    live: {
      type: "boolean",
      description: "True once the first event arrived.",
    },
    createdAt: time,
  }),
  Overview: overview,
  Stats: obj({
    current: overview,
    previous: { oneOf: [overview, { type: "null" }] },
  }),
  Timeseries: obj({
    current: list(point),
    previous: { oneOf: [list(point), { type: "null" }] },
  }),
  Breakdown: {
    oneOf: [
      {
        type: "object",
        description: "Tabs of the section, each a list of rows.",
        additionalProperties: list(row),
      },
      list({
        allOf: [
          row,
          obj({ props: list(obj({ key: str, value: str, count: num })) }),
        ],
      }),
    ],
  },
  Realtime: obj({
    online: int,
    visitors30m: int,
    views30m: int,
    minutes: list(obj({ minute: str, views: int })),
    pages: labelled,
    countries: labelled,
    referrers: labelled,
    feed: list(
      obj({
        kind: { type: "string", enum: ["view", "event"] },
        at: time,
        label: str,
        visitId: nstr,
        country: nstr,
        city: nstr,
        device: nstr,
        browser: nstr,
      })
    ),
    points: list(obj({ latitude: num, longitude: num, visitors: int })),
  }),
  Visit: visit,
  VisitPage: obj({ rows: list(visit), hasMore: { type: "boolean" } }),
  VisitDetail: obj({
    visit,
    visitor: obj({ visits: int, firstSeen: time, revenueCents: num }),
    timeline: list(
      obj({
        kind: { type: "string", enum: ["view", "event"] },
        at: time,
        label: str,
        detail: nstr,
        durationS: { type: ["integer", "null"] },
        scrollPct: { type: ["integer", "null"] },
        amountCents: { type: ["integer", "null"] },
      })
    ),
    others: list(visit),
  }),
}
