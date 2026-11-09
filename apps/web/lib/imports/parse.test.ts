import { describe, expect, it } from "bun:test"
import { parseCsv } from "./csv"
import { parseImport } from "./parse"

const file = (name: string, lines: string[]) => ({
  name,
  text: lines.join("\n"),
})

describe("parseCsv", () => {
  it("handles quotes, commas and CRLF", () => {
    expect(parseCsv('a,b\r\n"x, y","say ""hi"""\r\n')).toEqual([
      ["a", "b"],
      ["x, y", 'say "hi"'],
    ])
  })
})

describe("parseImport", () => {
  const parsed = parseImport([
    file("imported_visitors_20240101_20240131.csv", [
      "date,visitors,pageviews,bounces,visits,visit_duration",
      "2024-01-01,10,30,4,12,600",
      "2024-01-02,5,9,1,6,120",
    ]),
    file("export/sources_20240101_20240131.csv", [
      "date,source,referrer,utm_source,utm_medium,utm_campaign,utm_content,utm_term,pageviews,visitors,visits,visit_duration,bounces",
      "2024-01-01,Google,https://www.google.com/,,,,,,8,4,5,100,2",
      "2024-01-01,,,newsletter,email,launch,,,3,2,2,40,1",
      "2024-01-01,Direct / None,,,,,,,1,1,1,0,1",
    ]),
    file("imported_locations_20240101_20240131.csv", [
      "date,country,region,city,visitors,visits,visit_duration,bounces,pageviews",
      "2024-01-01,FR,FR-IDF,2988507,3,3,10,1,4",
      "2024-01-01,FR,FR-ARA,2996944,2,2,10,1,2",
    ]),
    file("imported_entry_pages_20240101_20240131.csv", [
      "date,entry_page,visitors,entrances,visit_duration,bounces,pageviews",
      "2024-01-01,/pricing,4,5,50,2,9",
    ]),
    file("devices.csv", ["date,device,visitors", "20240103,desktop,7"]),
    file("notes.txt", ["hello"]),
  ])
  const find = (dimension: string, value: string) =>
    parsed.rows.find((r) => r.dimension === dimension && r.value === value)

  it("reads totals and the date range", () => {
    expect(find("total", "")).toMatchObject({ visitors: 10, visits: 12 })
    expect(parsed.firstDate).toBe("2024-01-01")
    expect(parsed.lastDate).toBe("2024-01-03")
    expect(find("device", "Desktop")?.visitors).toBe(7)
    expect(parsed.skipped).toEqual(["notes.txt"])
  })

  it("maps sources to referrers, channels and UTM", () => {
    expect(find("referrer", "google.com")?.visitors).toBe(4)
    expect(find("channel", "Organic Search")?.visitors).toBe(4)
    expect(find("channel", "Email")?.visitors).toBe(2)
    expect(find("channel", "Direct")?.visitors).toBe(1)
    expect(find("utm_campaign", "launch")?.visitors).toBe(2)
  })

  it("sums regions into countries and uses entrances as visits", () => {
    expect(find("country", "FR")).toMatchObject({ visitors: 5, pageviews: 6 })
    expect(find("region", "IDF")?.visitors).toBe(3)
    expect(find("entry", "/pricing")?.visits).toBe(5)
  })
})
