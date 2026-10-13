"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@workspace/ui/components/button"

type CopyKeyType = { value: string }

export const CopyKey = ({ value }: CopyKeyType) => {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="flex items-center gap-2 rounded-lg border bg-muted/40 p-2 pl-3">
      <code className="min-w-0 flex-1 truncate font-mono text-sm">{value}</code>
      <Button type="button" variant="outline" size="sm" onClick={copy}>
        {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  )
}
