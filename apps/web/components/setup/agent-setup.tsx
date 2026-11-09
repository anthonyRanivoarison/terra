"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { Check, Copy, SquareTerminal } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"
import { Snippet } from "@/components/sites/snippet"
import { useCopy } from "@/hooks/use-copy"
import { AGENTS } from "./agents"
import { PromptBlock } from "./prompt-block"
import { SetupStep, SetupSteps } from "./setup-step"

type AgentSetupType = {
  prompt: string
  promptNote: string
  manual: ReactNode
}

export const AgentSetup = ({ prompt, promptNote, manual }: AgentSetupType) => {
  const [tab, setTab] = useState("claude")
  const manualRef = useRef<HTMLDivElement>(null)
  const { copied, copy } = useCopy(prompt)

  useEffect(() => {
    const open = () => {
      const id = window.location.hash.slice(1)
      if (!id || !manualRef.current?.querySelector(`#${CSS.escape(id)}`)) return
      requestAnimationFrame(() => {
        setTab("manual")
        requestAnimationFrame(() =>
          document.getElementById(id)?.scrollIntoView({ block: "start" })
        )
      })
    }
    open()
    window.addEventListener("hashchange", open)
    return () => window.removeEventListener("hashchange", open)
  }, [])

  return (
    <Tabs
      value={tab}
      onValueChange={setTab}
      className="gap-0 overflow-hidden rounded-xl border bg-card"
    >
      <div className="flex items-center gap-2 border-b px-3">
        <div className="min-w-0 flex-1 overflow-x-auto pt-1.5 pb-[5px] [scrollbar-width:none]">
          <TabsList variant="line">
            {AGENTS.map((agent) => (
              <TabsTrigger
                key={agent.key}
                value={agent.key}
                className="flex-none px-2"
              >
                {agent.icon}
                {agent.label}
              </TabsTrigger>
            ))}
            <TabsTrigger value="manual" className="flex-none px-2">
              <SquareTerminal aria-hidden />
              Manual
            </TabsTrigger>
          </TabsList>
        </div>
        <Button
          variant="ghost"
          size="xs"
          onClick={copy}
          className="hidden text-muted-foreground sm:inline-flex"
        >
          {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
          {copied ? "Copied" : "Copy as prompt"}
        </Button>
      </div>
      {AGENTS.map((agent) => (
        <TabsContent key={agent.key} value={agent.key} className="p-5 sm:p-6">
          <h3 className="mb-6 font-semibold">Set up with {agent.label}</h3>
          <SetupSteps>
            <SetupStep
              index={1}
              title={agent.start.title}
              description={agent.start.description}
            >
              {agent.start.command && (
                <Snippet code={agent.start.command} label="start command" />
              )}
            </SetupStep>
            <SetupStep
              index={2}
              title="Paste this prompt"
              description={promptNote}
            >
              <PromptBlock prompt={prompt} />
            </SetupStep>
            <SetupStep
              index={3}
              title="Review and deploy"
              description="The agent lists the files it changed. Check the diff, then deploy as usual."
            />
          </SetupSteps>
        </TabsContent>
      ))}
      <TabsContent value="manual" keepMounted className="p-5 sm:p-6">
        <div ref={manualRef}>{manual}</div>
      </TabsContent>
    </Tabs>
  )
}
