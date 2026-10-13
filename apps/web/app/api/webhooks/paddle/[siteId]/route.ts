import { handleSiteWebhook } from "@/lib/revenue/webhook"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ siteId: string }> }
) {
  const { siteId } = await params
  return handleSiteWebhook(
    siteId,
    await req.text(),
    req.headers.get("paddle-signature")
  )
}
