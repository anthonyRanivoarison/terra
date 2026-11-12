"use client"

import { MoonIcon, SunIcon } from "@phosphor-icons/react/ssr"
import { useTheme } from "next-themes"
import { Button } from "@workspace/ui/components/button"

type ThemeToggleType = { className?: string }

export const ThemeToggle = ({ className }: ThemeToggleType) => {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={className}
      aria-label="Toggle dark mode"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <SunIcon className="dark:hidden" aria-hidden />
      <MoonIcon className="hidden dark:block" aria-hidden />
    </Button>
  )
}
