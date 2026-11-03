import { toRecords } from "./csv"
import { TABLES, tableOf, type ImportedRow } from "./tables"

export type ImportFile = { name: string; text: string }

export type ParsedImport = {
  rows: ImportedRow[]
  tables: string[]
  skipped: string[]
  firstDate: string | null
  lastDate: string | null
}

const DATE = /^\d{4}-\d{2}-\d{2}$/

const toDate = (value = "") =>
  /^\d{8}$/.test(value)
    ? `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`
    : value.slice(0, 10)

const sum = (a: ImportedRow, b: ImportedRow): ImportedRow => ({
  ...a,
  visitors: a.visitors + b.visitors,
  visits: a.visits + b.visits,
  pageviews: a.pageviews + b.pageviews,
  bounces: a.bounces + b.bounces,
  duration: a.duration + b.duration,
})

export function parseImport(files: ImportFile[]): ParsedImport {
  const merged = new Map<string, ImportedRow>()
  const tables: string[] = []
  const skipped: string[] = []
  for (const file of files) {
    const table = tableOf(file.name)
    if (!table) {
      skipped.push(file.name)
      continue
    }
    tables.push(table)
    for (const record of toRecords(file.text)) {
      const date = toDate(record.date)
      if (!DATE.test(date)) continue
      for (const row of TABLES[table](record)) {
        const full = { date, ...row, value: row.value.slice(0, 500) }
        const key = `${date}\u0000${full.dimension}\u0000${full.value}`
        const previous = merged.get(key)
        merged.set(key, previous ? sum(previous, full) : full)
      }
    }
  }
  const rows = [...merged.values()]
  const dates = rows.map((row) => row.date).sort()
  return {
    rows,
    tables,
    skipped,
    firstDate: dates[0] ?? null,
    lastDate: dates.at(-1) ?? null,
  }
}
