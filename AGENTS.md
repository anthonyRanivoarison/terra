<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Terra

Free, self-hostable, multi-site web analytics. A customer adds a site, pastes one script tag and sees traffic, goals, revenue and AI crawlers.

## Commands

Use **bun** only (`bun@1.4.0`, `bun.lock`). Never use npm, pnpm or yarn, and never add a dependency unless asked.

| Command                  | What it does                                                  |
| ------------------------ | ------------------------------------------------------------- |
| `bun run dev`            | turbo dev: web on :3000, ingest on :4000                      |
| `bun run db:migrate`     | Terra tables (`packages/db`) then Better Auth tables (`.env`) |
| `bun run db:seed`        | Demo site with a year of fake traffic (`apps/web/scripts`)    |
| `bun run lint`           | ESLint in every workspace                                     |
| `bun run typecheck`      | `tsc --noEmit` in every workspace                             |
| `bun run test`           | `bun test` in every workspace that has tests                  |
| `bun run format[:check]` | Prettier write / check (CI runs the check)                    |
| `bun run build`          | Tracker bundle, then `next build` (standalone output)         |

Typecheck a single workspace with `../../node_modules/.bin/tsc --noEmit -p .` from its folder.

Check order before saying a change is done: `lint → typecheck → test → format:check → build`.

## Architecture

```
apps/
  web/        Next.js 16 dashboard: Better Auth (organizations), sites, dashboards,
              public API (app/api/v1), billing and revenue webhooks. proxy.ts guards /sites
  ingest/     Hono on Bun.serve: GET /js/script.js, POST /api/event, POST /api/crawl,
              GET /health. In-memory batcher, rate limit and site cache
packages/
  core/       Payload validation, attribution, UA parsing, geo, client IP, crawler detection
  db/         postgres client (`sql()`), schema (`migrate(sql)`), every table keyed by site_id
  tracker/    Browser script, built to dist/script.js and served by ingest
  crawl/      Server-side AI crawler reporting (Next, Hono, Express, Workers)
  sdk/        Typed client for the public API
  ui/         shadcn (Base UI) components, imported as `@workspace/ui/components/<name>`
infra/        docker-compose.yml (local Postgres), docker-compose.prod.yml, backups, deploy guide
```

## Code conventions

- No comments in code (vendored code and shadcn `packages/ui` excepted).
- Keep files at 200 lines or fewer. Split into folders when a file grows.
- Components: `type XType = { … }` then `export const X = ({ … }: XType) => …`. Next.js pages and layouts keep `export default`.
- No repetition: reuse helpers from `@terra/core`, `@terra/db` and `apps/web/lib`.
- Every query that touches analytics data filters by `site_id` first, and checks the site belongs to the active organization.
- Prettier formats everything (no semicolons, double quotes); run `bun run format`.

## Environment

The list lives in `.env.example`. New variables go there with a short comment, and production ones also in `infra/README.md`. `NEXT_PUBLIC_*` variables are the only ones exposed to the browser, and they are inlined at build time.

## Git

- Conventional commits: `type(scope): summary`, for example `feat(ingest): …`, `fix(web): …`, `docs: …`.
- No `Co-Authored-By` or any AI attribution in commits or PRs.
- Only commit or push when asked.

<!-- BEGIN:turborepo-agent-rules -->

# This is NOT the Turborepo you know

Turborepo configuration, task behavior, and CLI commands can vary between installed versions and may differ from your training data. Resolve the `turbo` package from this file's directory or relevant workspace; in monorepos, it may not be visible from the repository root. For example, run `node -p "require.resolve('turbo/package.json')"` from a workspace that depends on `turbo`.

Read `docs/README.md` inside that installed package first, then read the relevant pages from its `docs/` directory before changing Turborepo configuration or commands. Heed deprecation notices. These bundled docs match the installed package version and are available without network access.

This block is written and re-added by `turbo` before repository-scoped commands when an AI agent is detected. In the Turborepo source repository, its template is defined in `crates/turborepo-cli/src/cli/agent_guidance.rs`. Removing the managed block while updates are enabled means a later qualifying invocation will add it again. Set `"agentGuidance": false` in the root `turbo.json` or `turbo.jsonc` to opt out; this does not remove an existing block. Keep the block committed with your work to avoid an uncommitted change on the next agent invocation.
<!-- END:turborepo-agent-rules -->
