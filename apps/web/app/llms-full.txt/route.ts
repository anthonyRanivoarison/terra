import { llmsFull } from "@/lib/llms/full"

export function GET() {
  return new Response(llmsFull(), {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
