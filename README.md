# Terra

Free, self-hostable web analytics for many sites. Add a site, paste one script tag, and see traffic, goals, revenue and AI crawlers.

```html
<script
  defer
  data-website-id="ws_..."
  data-domain="example.com"
  src="https://ingest.example.com/js/script.js"
></script>
```

## Local quickstart

Requires [Bun](https://bun.sh) 1.4 and Docker.

```bash
docker compose -f infra/docker-compose.yml up -d
cp .env.example .env
bun install
bun run db:migrate
bun run --cwd packages/tracker build
bun run dev
```

Set `BETTER_AUTH_SECRET` in `.env` first (`openssl rand -base64 32`). The dashboard runs on http://localhost:3000 and the ingest server on http://localhost:4000.

## Layout

- `apps/web`: Next.js dashboard, auth and public API
- `apps/ingest`: tracking script and event ingestion
- `packages/*`: shared core logic, database, tracker, SDK and UI

See [AGENTS.md](AGENTS.md) for conventions and commands.

## Self-hosting

Terra runs for free on an Oracle Cloud Always Free ARM VM behind a Cloudflare Tunnel, with nightly backups to Cloudflare R2. Follow [infra/README.md](infra/README.md).
