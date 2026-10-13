import { createApp } from "./app"
import { Batcher } from "./batcher"
import { warmCrawlerIps } from "./crawl"
import type { Job } from "./jobs"
import { writeJobs } from "./writer"

const scriptPath =
  process.env.TRACKER_SCRIPT ??
  new URL("../../../packages/tracker/dist/script.js", import.meta.url).pathname

let cached: { body: string; etag: string } | null = null

async function script(): Promise<Response> {
  if (!cached) {
    const body = await Bun.file(scriptPath).text()
    cached = { body, etag: `"${Bun.hash(body).toString(36)}"` }
  }
  return new Response(cached.body, {
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "public, max-age=3600, stale-while-revalidate=86400",
      "access-control-allow-origin": "*",
      etag: cached.etag,
    },
  })
}

const queue = new Batcher<Job>(writeJobs)
const app = createApp({ queue, script })
const port = Number(process.env.INGEST_PORT ?? 4000)

warmCrawlerIps()

const server = Bun.serve({ port, fetch: app.fetch })
console.log(`[ingest] listening on :${server.port}`)

const shutdown = async () => {
  await queue.close()
  server.stop()
  process.exit(0)
}
process.on("SIGTERM", shutdown)
process.on("SIGINT", shutdown)
