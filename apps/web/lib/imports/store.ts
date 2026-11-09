import { sql } from "@terra/db/client"
import type { ParsedImport } from "./parse"

export type ImportSummary = {
  id: string
  source: string
  firstDate: string
  lastDate: string
  rows: number
  createdAt: Date
}

const BATCH = 5000

export async function saveImport(
  siteId: string,
  source: string,
  parsed: ParsedImport
): Promise<string> {
  return sql().begin(async (tx) => {
    const [created] = await tx<{ id: string }[]>`
      INSERT INTO imports (site_id, source, first_date, last_date, rows)
      VALUES (${siteId}, ${source}, ${parsed.firstDate}, ${parsed.lastDate},
        ${parsed.rows.length})
      RETURNING id
    `
    const importId = created!.id
    for (let i = 0; i < parsed.rows.length; i += BATCH) {
      const chunk = parsed.rows.slice(i, i + BATCH)
      const column = <K extends keyof (typeof chunk)[number]>(key: K) =>
        chunk.map((row) => row[key])
      await tx`
        INSERT INTO imported_stats (site_id, import_id, date, dimension, value,
          visitors, visits, pageviews, bounces, duration)
        SELECT ${siteId}, ${importId}, * FROM unnest(
          ${column("date")}::date[], ${column("dimension")}::text[],
          ${column("value")}::text[], ${column("visitors")}::bigint[],
          ${column("visits")}::bigint[], ${column("pageviews")}::bigint[],
          ${column("bounces")}::bigint[], ${column("duration")}::bigint[]
        )
      `
    }
    return importId
  })
}

export function listImports(siteId: string): Promise<ImportSummary[]> {
  return sql()<ImportSummary[]>`
    SELECT id, source, to_char(first_date, 'YYYY-MM-DD') AS "firstDate",
      to_char(last_date, 'YYYY-MM-DD') AS "lastDate", rows,
      created_at AS "createdAt"
    FROM imports WHERE site_id = ${siteId} ORDER BY created_at DESC
  `
}

export async function deleteImport(
  siteId: string,
  importId: string
): Promise<void> {
  await sql()`DELETE FROM imports WHERE site_id = ${siteId} AND id = ${importId}`
}
