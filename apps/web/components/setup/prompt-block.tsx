"use client"

import { useState } from "react"
import { Check, ChevronDown, Copy } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"
import { useCopy } from "@/hooks/use-copy"

type PromptBlockType = { prompt: string }

export const PromptBlock = ({ prompt }: PromptBlockType) => {
  const [open, setOpen] = useState(false)
  const { copied, copy } = useCopy(prompt)
  return (
    <div className="flex flex-col gap-2">
      <div className="relative overflow-hidden rounded-lg bg-muted">
        <pre
          id="agent-prompt"
          className={cn(
            "p-4 pr-14 font-mono text-[13px] leading-relaxed wrap-anywhere whitespace-pre-wrap",
            open ? "max-h-[32rem] overflow-y-auto" : "max-h-40 overflow-hidden"
          )}
        >
          {prompt}
        </pre>
        {!open && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-muted to-transparent"
          />
        )}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy prompt"}
          className="absolute top-2 right-2"
        >
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
        </Button>
      </div>
      <Button
        variant="ghost"
        size="xs"
        className="self-start text-muted-foreground"
        aria-expanded={open}
        aria-controls="agent-prompt"
        onClick={() => setOpen(!open)}
      >
        {open ? "Show less" : "Show full prompt"}
        <ChevronDown
          aria-hidden
          data-icon="inline-end"
          className={cn("transition-transform", open && "rotate-180")}
        />
      </Button>
    </div>
  )
}
