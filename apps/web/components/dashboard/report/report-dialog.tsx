"use client"

import { useState } from "react"
import { Maximize2 } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { dimensionLabel } from "../format"
import { ReportList } from "./report-list"
import type { ReportTab } from "./types"

type ReportDialogType = { title: string; tab: ReportTab; domain: string }

export const ReportDialog = ({ title, tab, domain }: ReportDialogType) => {
  const [query, setQuery] = useState("")
  const needle = query.trim().toLowerCase()
  const rows = tab.rows.filter((row) =>
    dimensionLabel(tab.key, row.label).toLowerCase().includes(needle)
  )

  return (
    <Dialog onOpenChange={() => setQuery("")}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label={`Show all ${tab.label.toLowerCase()}`}
          />
        }
      >
        <Maximize2 aria-hidden />
      </DialogTrigger>
      <DialogContent className="flex max-h-[85vh] flex-col gap-3 sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {title} · {tab.label}
          </DialogTitle>
        </DialogHeader>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${tab.label.toLowerCase()}`}
          aria-label={`Search ${tab.label.toLowerCase()}`}
        />
        <ReportList
          tab={tab}
          rows={rows}
          domain={domain}
          className="-mx-1 overflow-y-auto px-1"
        />
      </DialogContent>
    </Dialog>
  )
}
