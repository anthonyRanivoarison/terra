export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ""
  let quoted = false
  const source = text.replace(/^﻿/, "")
  for (let i = 0; i < source.length; i++) {
    const char = source[i]
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') {
        field += '"'
        i++
      } else if (char === '"') quoted = false
      else field += char
    } else if (char === '"') quoted = true
    else if (char === ",") {
      row.push(field)
      field = ""
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && source[i + 1] === "\n") i++
      row.push(field)
      if (row.some((cell) => cell !== "")) rows.push(row)
      row = []
      field = ""
    } else field += char
  }
  row.push(field)
  if (row.some((cell) => cell !== "")) rows.push(row)
  return rows
}

export function toRecords(text: string): Record<string, string>[] {
  const [header, ...body] = parseCsv(text)
  if (!header) return []
  const keys = header.map((key) => key.trim().toLowerCase())
  return body.map((cells) =>
    Object.fromEntries(keys.map((key, i) => [key, cells[i]?.trim() ?? ""]))
  )
}
