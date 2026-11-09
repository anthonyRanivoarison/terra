"use client"

import { useState, type ReactNode } from "react"
import { Card } from "@workspace/ui/components/card"
import { Tabs, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { ReportDialog } from "./report-dialog"
import { ReportList } from "./report-list"
import type { ReportTab } from "./types"

export type ReportExtra = { key: string; label: string; content: ReactNode }

type ReportCardType = {
  title: string
  tabs: ReportTab[]
  domain: string
  extras?: ReportExtra[]
  limit?: number
}

export const ReportCard = ({
  title,
  tabs,
  domain,
  extras = [],
  limit = 10,
}: ReportCardType) => {
  const [active, setActive] = useState(tabs[0]?.key ?? extras[0]?.key)
  const tab = tabs.find((t) => t.key === active)
  const extra = extras.find((e) => e.key === active)

  return (
    <Card className="h-[29rem] gap-2.5 py-3">
      <div className="flex items-center justify-between gap-2 px-4">
        <Tabs
          value={active}
          onValueChange={(value) => setActive(String(value))}
          className="min-w-0"
        >
          <TabsList
            variant="line"
            aria-label={title}
            className="max-w-full justify-start overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {[...tabs, ...extras].map((t) => (
              <TabsTrigger key={t.key} value={t.key} className="flex-none">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {tab && tab.rows.length > limit && (
          <ReportDialog title={title} tab={tab} domain={domain} />
        )}
      </div>
      {tab && (
        <ReportList
          tab={tab}
          rows={tab.rows.slice(0, limit)}
          domain={domain}
          className="px-3"
        />
      )}
      {extra && <div className="relative min-h-0 flex-1">{extra.content}</div>}
    </Card>
  )
}

export const ReportCardSkeleton = () => (
  <Card className="h-[29rem] animate-pulse" />
)
