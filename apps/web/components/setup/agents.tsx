import Claude from "@thesvg/react/claude"
import Codex from "@thesvg/react/codex"
import Cursor from "@thesvg/react/cursor"
import { RobotIcon } from "@phosphor-icons/react/ssr"
import type { ReactNode } from "react"

export type Agent = {
  key: string
  label: string
  icon: ReactNode
  start: { title: string; description: ReactNode; command?: string }
}

const kbd = (keys: string) => (
  <kbd className="rounded border bg-muted px-1 font-mono text-xs">{keys}</kbd>
)

export const AGENTS: Agent[] = [
  {
    key: "claude",
    label: "Claude Code",
    icon: <Claude aria-hidden />,
    start: {
      title: "Start Claude Code in your project",
      description: "Run it from the root of the repository.",
      command: "claude",
    },
  },
  {
    key: "codex",
    label: "Codex",
    icon: <Codex aria-hidden fill="currentColor" />,
    start: {
      title: "Start Codex in your project",
      description: "Run it from the root of the repository.",
      command: "codex",
    },
  },
  {
    key: "cursor",
    label: "Cursor",
    icon: <Cursor aria-hidden />,
    start: {
      title: "Open the agent in Cursor",
      description: (
        <>
          Open the project, then the agent with {kbd("⌘ I")} or {kbd("Ctrl I")}.
        </>
      ),
    },
  },
  {
    key: "other",
    label: "Other agents",
    icon: <RobotIcon aria-hidden />,
    start: {
      title: "Open your agent in the project",
      description:
        "Windsurf, GitHub Copilot, Gemini CLI, Cline or any agent that can edit files and run commands.",
    },
  },
]
