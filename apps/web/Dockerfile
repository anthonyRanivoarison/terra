FROM oven/bun:1.4 AS manifests
WORKDIR /src
COPY . .
RUN mkdir /out && cp package.json bun.lock /out/ \
  && find apps packages -maxdepth 2 -name package.json -exec cp --parents {} /out/ \;

FROM oven/bun:1.4 AS deps
WORKDIR /app
COPY --from=manifests /out/ ./
RUN bun install --frozen-lockfile

FROM deps AS builder
ARG NEXT_PUBLIC_INGEST_URL
ENV NEXT_PUBLIC_INGEST_URL=$NEXT_PUBLIC_INGEST_URL
ENV NEXT_TELEMETRY_DISABLED=1
COPY . .
RUN cd apps/web && bun run build

FROM builder AS migrate
ENV NODE_ENV=production
CMD ["sh", "-c", "bun packages/db/src/migrate.ts && cd apps/web && bun scripts/migrate-auth.ts"]

FROM oven/bun:1.4-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
COPY --from=builder --chown=bun:bun /app/apps/web/.next/standalone ./
COPY --from=builder --chown=bun:bun /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=bun:bun /app/apps/web/public ./apps/web/public
USER bun
EXPOSE 3000
CMD ["bun", "apps/web/server.js"]
