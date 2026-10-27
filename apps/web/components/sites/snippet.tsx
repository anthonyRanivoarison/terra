"use client"

import { Check, Copy } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { useCopy } from "@/hooks/use-copy"

type SnippetType = { code: string; label: string }

export const Snippet = ({ code, label }: SnippetType) => {
  const { copied, copy } = useCopy(code)
  return (
    <div className="relative rounded-lg bg-muted">
      <pre className="overflow-x-auto p-4 pr-14 font-mono text-[13px] leading-relaxed">
        <code>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={copy}
        aria-label={copied ? "Copied" : `Copy ${label}`}
        className="absolute top-2 right-2"
      >
        {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
      </Button>
    </div>
  )
}
