"use client"

import { useState } from "react"
import { Bot, Check, ChevronDown, Copy } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible"

type AgentPromptType = {
  title: string
  description: string
  prompt: string
}

export const AgentPrompt = ({
  title,
  description,
  prompt,
}: AgentPromptType) => {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(prompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <Collapsible className="flex flex-col gap-4 rounded-xl border bg-card p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span
          aria-hidden
          className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
        >
          <Bot className="size-5" />
        </span>
        <div className="flex flex-1 flex-col gap-1">
          <h2 className="font-semibold">{title}</h2>
          <p className="text-sm text-pretty text-muted-foreground">
            {description}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <CollapsibleTrigger
            render={<Button variant="ghost" size="sm" />}
            className="group"
          >
            Preview
            <ChevronDown
              aria-hidden
              className="transition-transform group-data-panel-open:rotate-180"
            />
          </CollapsibleTrigger>
          <Button size="sm" onClick={copy}>
            {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
            {copied ? "Copied" : "Copy prompt"}
          </Button>
        </div>
      </div>
      <CollapsibleContent>
        <pre className="max-h-96 overflow-auto rounded-lg bg-muted p-4 font-mono text-[13px] leading-relaxed whitespace-pre-wrap">
          {prompt}
        </pre>
      </CollapsibleContent>
    </Collapsible>
  )
}
