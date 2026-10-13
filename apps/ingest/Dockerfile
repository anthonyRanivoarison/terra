FROM oven/bun:1.4 AS manifests
WORKDIR /src
COPY . .
RUN mkdir /out && cp package.json bun.lock /out/ \
  && find apps packages -maxdepth 2 -name package.json -exec cp --parents {} /out/ \;

FROM oven/bun:1.4 AS tracker
WORKDIR /app
COPY --from=manifests /out/ ./
RUN bun install --frozen-lockfile --filter @terra/tracker
COPY packages/tracker ./packages/tracker
RUN cd packages/tracker && bun run build

FROM oven/bun:1.4 AS deps
WORKDIR /app
COPY --from=manifests /out/ ./
RUN bun install --frozen-lockfile --production --filter @terra/ingest

FROM oven/bun:1.4-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV INGEST_PORT=4000
ENV TRACKER_SCRIPT=/app/packages/tracker/dist/script.js
COPY --from=deps /app ./
COPY packages/core ./packages/core
COPY packages/db ./packages/db
COPY apps/ingest ./apps/ingest
COPY --from=tracker /app/packages/tracker/dist/script.js ./packages/tracker/dist/script.js
USER bun
EXPOSE 4000
CMD ["bun", "apps/ingest/src/index.ts"]
