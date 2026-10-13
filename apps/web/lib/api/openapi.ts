import { RATE_LIMIT } from "@/lib/api/rate-limit"
import { parameters, responses } from "@/lib/api/openapi-params"
import { readPaths } from "@/lib/api/openapi-paths"
import { schemas } from "@/lib/api/openapi-schemas"
import { writePaths } from "@/lib/api/openapi-write"

export const openapi = {
  openapi: "3.1.0",
  info: {
    title: "Terra API",
    version: "1.0.0",
    description: [
      "Read your analytics and send server-side goals and payments.",
      "",
      "Create a key in **Settings → API keys** and send it as `Authorization: Bearer tk_live_…`.",
      `Each key may send ${RATE_LIMIT} requests per minute; the \`RateLimit-*\` headers show what is left.`,
      'Errors always look like `{ "error": { "code": "…", "message": "…" } }`.',
    ].join("\n"),
  },
  servers: [{ url: "/api/v1" }],
  tags: [
    { name: "Sites" },
    { name: "Analytics", description: "Requires the `read:stats` scope." },
    { name: "Ingestion", description: "Server-side goals and revenue." },
  ],
  security: [{ apiKey: [] }],
  paths: { ...readPaths, ...writePaths },
  components: {
    securitySchemes: {
      apiKey: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "tk_live_<40 base62 characters>",
        description: "Scopes: `read:stats`, `write:events`, `write:payments`.",
      },
    },
    parameters,
    responses,
    schemas,
  },
}
