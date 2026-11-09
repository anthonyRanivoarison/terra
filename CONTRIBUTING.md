# Contributing to Terra

Thanks for helping. Terra is a free community tool, and every change should keep it simple to self-host.

## Setup

Follow the local quickstart in the [README](README.md). Use `bun` only, never npm, pnpm or yarn.

## Before you open a pull request

Run the same checks as CI, in this order:

```bash
bun run lint
bun run typecheck
bun run test
bun run format:check
bun run build
```

## Conventions

The full list is in [AGENTS.md](AGENTS.md). The ones reviews check most:

- No comments in code.
- Files stay at 200 lines or fewer; split into folders when they grow.
- Components: `type XType = { … }` then `export const X = ({ … }: XType) => …`.
- Every analytics query filters by `site_id` first and is covered by `lib/analytics/scoping.test.ts`.
- No new dependency without discussing it in an issue first.
- New UI comes with matching demo data in `apps/web/scripts/seed-demo.sql`.
- Conventional commits: `feat(web): …`, `fix(ingest): …`, `docs: …`.

## License

By contributing, you agree that your changes are licensed under the license of the package you change: AGPL-3.0 for the app, MIT for `packages/tracker`, `packages/sdk` and `packages/crawl`.
