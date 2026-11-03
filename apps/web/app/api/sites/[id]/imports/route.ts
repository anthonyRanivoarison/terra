import { refreshAnalytics } from "@/lib/analytics/cache"
import { parseImport } from "@/lib/imports/parse"
import { saveImport } from "@/lib/imports/store"
import { getOptionalSession, requireOrganization } from "@/lib/session"
import { getSite } from "@/lib/sites"

const MAX_BYTES = 50 * 1024 * 1024
const SOURCES = new Set(["plausible", "umami", "ga4", "vercel", "csv"])

const fail = (error: string, status = 400) =>
  Response.json({ error }, { status })

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  if (!(await getOptionalSession())) return fail("unauthorized", 401)
  const site = await getSite(await requireOrganization(), (await params).id)
  if (!site) return fail("not found", 404)
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BYTES)
    return fail("Files are larger than 50 MB. Split the export.", 413)

  const form = await request.formData().catch(() => null)
  const files = (form?.getAll("files") ?? []).filter(
    (file): file is File => file instanceof File && file.size > 0
  )
  if (!files.length) return fail("Choose at least one CSV file.")
  const source = String(form?.get("source") ?? "csv")
  const parsed = parseImport(
    await Promise.all(
      files.map(async (file) => ({ name: file.name, text: await file.text() }))
    )
  )
  if (!parsed.rows.length)
    return fail(
      `No rows found. File names must look like visitors.csv or imported_pages_20240101_20241231.csv${
        parsed.skipped.length ? ` (skipped: ${parsed.skipped.join(", ")})` : ""
      }.`
    )

  await saveImport(site.id, SOURCES.has(source) ? source : "csv", parsed)
  refreshAnalytics(site.id)
  return Response.json({
    rows: parsed.rows.length,
    tables: parsed.tables,
    skipped: parsed.skipped,
    firstDate: parsed.firstDate,
    lastDate: parsed.lastDate,
  })
}
