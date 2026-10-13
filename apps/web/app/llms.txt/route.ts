import { llmsSummary } from "@/lib/llms/summary"

export function GET() {
  return new Response(llmsSummary(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
