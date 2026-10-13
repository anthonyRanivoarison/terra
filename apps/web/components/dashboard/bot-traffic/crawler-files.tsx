import { FileText } from "lucide-react"
import type { CrawlFileHit } from "@/lib/analytics/crawls"
import { formatNumber } from "../format"

type CrawlerFilesType = { files: CrawlFileHit[] }

export const CrawlerFiles = ({ files }: CrawlerFilesType) => {
  const totals = new Map<string, number>()
  for (const f of files) totals.set(f.file, (totals.get(f.file) ?? 0) + f.hits)
  const rows = [...totals].sort((a, b) => b[1] - a[1]).slice(0, 6)
  if (!rows.length) return null
  return (
    <div className="flex flex-wrap items-center gap-2 border-t pt-3 text-xs">
      <span className="text-muted-foreground">Crawler files</span>
      {rows.map(([file, hits]) => (
        <span
          key={file}
          className="inline-flex items-center gap-1.5 rounded-md border bg-muted/40 px-2 py-1"
        >
          <FileText aria-hidden className="size-3 text-muted-foreground" />
          <span className="font-mono">{file}</span>
          <span className="text-muted-foreground tabular-nums">
            {formatNumber(hits)}
          </span>
        </span>
      ))}
    </div>
  )
}
