import { errors, ok, queryParams, siteIdParam } from "@/lib/api/openapi-params"

const read = (
  summary: string,
  operationId: string,
  schema: string,
  extra: object[] = [],
  description?: string
) => ({
  get: {
    summary,
    description,
    operationId,
    tags: ["Analytics"],
    security: [{ apiKey: ["read:stats"] }],
    parameters: [siteIdParam, ...extra],
    responses: {
      ...ok(schema),
      ...errors(
        "BadRequest",
        "Unauthorized",
        "Forbidden",
        "NotFound",
        "RateLimited"
      ),
    },
  },
})

export const readPaths = {
  "/sites": {
    get: {
      summary: "List sites",
      operationId: "listSites",
      tags: ["Sites"],
      security: [{ apiKey: ["read:stats"] }],
      responses: {
        "200": {
          description: "Every site in the key's organization.",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  data: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Site" },
                  },
                },
              },
            },
          },
        },
        ...errors("Unauthorized", "Forbidden", "RateLimited"),
      },
    },
  },
  "/sites/{siteId}": {
    get: {
      ...read("Get a site", "getSite", "Site").get,
      tags: ["Sites"],
    },
  },
  "/sites/{siteId}/stats": read(
    "Aggregate stats",
    "getStats",
    "Stats",
    queryParams,
    "Visitors, visits, views, bounce rate, duration and revenue for the period, plus the comparison period."
  ),
  "/sites/{siteId}/timeseries": read(
    "Time series",
    "getTimeseries",
    "Timeseries",
    queryParams,
    "Buckets by hour, day or month depending on the period length."
  ),
  "/sites/{siteId}/breakdown": read("Breakdown", "getBreakdown", "Breakdown", [
    {
      name: "section",
      in: "query",
      description:
        "`pages`, `sources`, `environment` and `location` return an object of tabs; `events` returns a list of custom events with their props.",
      schema: {
        type: "string",
        enum: ["pages", "sources", "environment", "location", "events"],
        default: "pages",
      },
    },
    ...queryParams,
  ]),
  "/sites/{siteId}/realtime": read(
    "Realtime",
    "getRealtime",
    "Realtime",
    [],
    "Visitors online now and the last 30 minutes of activity."
  ),
  "/sites/{siteId}/visits": read("List visits", "listVisits", "VisitPage", [
    {
      name: "pageNumber",
      in: "query",
      description:
        "1-based page number; pages hold 25 visits. (`page` is the page path filter.)",
      schema: { type: "integer", minimum: 1, default: 1 },
    },
    ...queryParams,
  ]),
  "/sites/{siteId}/visits/{visitId}": read(
    "Get a visit",
    "getVisit",
    "VisitDetail",
    [
      {
        name: "visitId",
        in: "path",
        required: true,
        schema: { type: "string", format: "uuid" },
      },
    ],
    "A visit with its timeline, the visitor's totals and their other visits."
  ),
}
