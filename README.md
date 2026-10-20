# Terra

Free, open source web analytics for many sites. Add a site, paste one script tag, and see traffic, pages, sources, goals, revenue and AI crawlers. No plans, no paywall: every feature is available to everyone, on the hosted dashboard or on your own server.

```html
<script
  defer
  data-website-id="ws_..."
  data-domain="example.com"
  src="https://ingest.example.com/js/script.js"
></script>
```

## Features

- Overview with a stat strip, a chart per metric, period comparison and filters on every dimension
- Pages, sources, channels, UTM campaigns, devices, browsers, countries, regions and cities
- Realtime visitors, sessions with a full timeline, events and goals with their properties
- Revenue attribution from Paddle, first or last touch, with refunds subtracted
- AI crawlers (ChatGPT, Claude, Perplexity, Google) verified against their published IP ranges
- Core Web Vitals per page, light and dark themes
- Public REST API with scoped keys, an OpenAPI document and a typed TypeScript client

## Local quickstart

Requires [Bun](https://bun.sh) 1.4 and Postgres 17 (Docker or a local install).

```bash
docker compose -f infra/docker-compose.yml up -d
cp .env.example .env
bun install
bun run db:migrate
bun run db:seed
bun run --cwd packages/tracker build
bun run dev
```

Set `BETTER_AUTH_SECRET` and `ENCRYPTION_KEY` in `.env` first (`openssl rand -base64 32`). The dashboard runs on http://localhost:3000 and the ingest server on http://localhost:4000. `bun run db:seed` loads a demo site with a year of realistic traffic; its accounts are in `apps/web/scripts/seed-demo.ts`.

## Layout

- `apps/web`: Next.js dashboard, auth and public API
- `apps/ingest`: tracking script and event ingestion
- `packages/*`: shared core logic, database, tracker, SDK, crawler reporting and UI

See [AGENTS.md](AGENTS.md) for conventions and commands, and [CONTRIBUTING.md](CONTRIBUTING.md) to send a change.

## Self-hosting

Terra runs for free on an Oracle Cloud Always Free ARM VM behind a Cloudflare Tunnel, with nightly backups to Cloudflare R2. Follow [infra/README.md](infra/README.md).

## License

- The app (`apps/*`, `packages/core`, `packages/db`, `packages/ui`) is licensed under the [GNU AGPL v3](LICENSE). You can use, modify and host it freely; if you offer a modified version as a network service, share your changes under the same license.
- The tracker, the SDK and the crawler package (`packages/tracker`, `packages/sdk`, `packages/crawl`) are [MIT](packages/sdk/LICENSE), so they can be used in any codebase.

This product includes GeoLite2 data created by MaxMind, available from [maxmind.com](https://www.maxmind.com). Network names, when enabled, use [IP to ASN data by DB-IP](https://db-ip.com), licensed under CC BY 4.0.
